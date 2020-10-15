<script>
import Footer from '@/components/form/Footer';
import ResourceTabs from '@/components/form/ResourceTabs';
import CreateEditView from '@/mixins/create-edit-view';
import { DESCRIPTION } from '@/config/labels-annotations';
import { allHash } from '@/utils/promise';
import { sortBy } from '@/utils/sort';
import { get, set } from '@/utils/object';
import { STORAGE_CLASS, IMAGE, NAMESPACE } from '@/config/types';
import VolumeSource from './VolumeSource';

export default {
  name: 'Volume',

  components: {
    Footer,
    VolumeSource,
    ResourceTabs,
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const hash = await allHash({
      image:         this.$store.dispatch('cluster/findAll', { type: IMAGE }),
      storageClass:  this.$store.dispatch('cluster/findAll', { type: STORAGE_CLASS }),
    });
  },

  data() {
    let spec = this.value.spec;
    const v = this.value;
    const metadata = v.metadata;
    let namespace;

    namespace = metadata?.namespace;

    if ( !namespace ) {
      namespace = this.$store.getters['defaultNamespace'];
      if ( metadata ) {
        metadata.namespace = namespace;
      }
    }

    if (!spec) {
      spec = { pvc: { resources: { requests: { storage: '' } } } };
      this.value.spec = spec;
    }

    return {
      spec,
      namespace,
      randow: Math.random(),
      index:  0,
      errors: []
    };
  },

  computed: {
    namespaces() {
      const choices = this.$store.getters['cluster/all'](NAMESPACE);

      const out = sortBy(choices.map((obj) => {
        return {
          label: obj.nameDisplay,
          value: obj.id,
        };
      }), 'label');

      if ( this.forceNamespace ) {
        out.unshift({
          label: this.forceNamespace,
          value: this.forceNamespace
        });
      }

      return out;
    },
    description() {
      return this.value.metadata?.annotations?.[DESCRIPTION];
    }
  },

  watch: {
    spec(neu) {
      Object.assign(this.value.spec, neu);
    },
    description(val) {
      this.value.setAnnotation(DESCRIPTION, val);
    }
  },

  methods: {
    updateAnnotation(neu) {
      this.randow = Math.random();

      this.$set(this.value.metadata, 'annotations', {
        ...this.value.metadata.annotations,
        ...neu
      });
    },
    beforeSave(buttonCb) {
      if (!this.$refs.vs.source) {
        buttonCb(false);

        return this.getInvalidMsg('Source');
      }

      if (!this.$refs.vs.image && this.$refs.vs.isVmImage) {
        buttonCb(false);

        return this.getInvalidMsg('Image');
      }

      if (isNaN(parseInt(this.$refs.vs.storage))) {
        buttonCb(false);

        return this.getInvalidMsg('Size');
      }

      this.save(buttonCb);
    },
    getInvalidMsg(key) {
      this.errors.splice(0, 1, this.$store.getters['i18n/t']('validation.required', { key }));
    }
  },
};
</script>

<template>
  <a-card>
    <div>
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="Namespace">
              <a-select
                v-model="value.metadata.namespace"
                :options="namespaces"
                show-search
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Name" required>
              <a-input v-model="value.metadata.name" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Description">
              <a-input v-model="description" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <VolumeSource ref="vs" v-model="spec" :mode="mode" class="mb-20" @update:annotation="updateAnnotation" />

      <ResourceTabs :key="randow" v-model="value" :mode="mode" />

      <Footer :mode="mode" :errors="errors" @save="beforeSave" @done="done" />
    </div>
  </a-card>
</template>
