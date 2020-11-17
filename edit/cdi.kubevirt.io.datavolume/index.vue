<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import NameNsDescription from '@/components/form/NameNsDescription';
import Footer from '@/components/form/Footer';
import LabelsAndAnnosModal from '@/components/form/LabelsAndAnnosModal';
import CreateEditView from '@/mixins/create-edit-view';
import { allHash } from '@/utils/promise';
import { STORAGE_CLASS, IMAGE } from '@/config/types';
import { DESCRIPTION } from '@/config/labels-annotations';
import { defaultAsyncData } from '@/components/ResourceDetail';
import Basic from './basic';
import Advanced from './advanced';

export default {
  name: 'Volume',

  components: {
    Tab,
    Tabbed,
    Footer,
    Basic,
    Advanced,
    LabelsAndAnnosModal,
    NameNsDescription
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    await allHash({
      image:         this.$store.dispatch('cluster/findAll', { type: IMAGE }),
      storageClass:  this.$store.dispatch('cluster/findAll', { type: STORAGE_CLASS }),
    });
  },

  asyncData(ctx) {
    const parentOverride = { displayName: 'Volume' };
    const resource = ctx.params.resource;

    return defaultAsyncData(ctx, resource, parentOverride);
  },

  data() {
    let spec = this.value.spec;
    const description = this.value.metadata?.annotations?.[DESCRIPTION];

    if (!spec) {
      spec = { pvc: { resources: { requests: { storage: '' } } } };
      this.value.spec = spec;
    }

    if (description) {
      // if description exist, copy it, then remove it from annotations
      this.$set(this.value.spec, 'description', description);
      this.value.setAnnotation(DESCRIPTION, null);
    }

    return {
      spec,
      index:  0,
      errors: [],
    };
  },

  watch: {
    spec(neu) {
      Object.assign(this.value.spec, neu);
    }
  },

  created() {
    this.registerBeforeHook(this.validateBefore, 'validate');
    this.registerBeforeHook(this.willSave, 'willSave');
  },

  methods: {
    updateAnno(neu) {
      this.$set(this.value.metadata, 'annotations', {
        ...this.value.metadata.annotations,
        ...neu
      });
    },
    willSave() {
      this.value.setAnnotation(DESCRIPTION, this.value.spec.description);

      this.value.spec.description = undefined;
    },
    validateBefore() {
      if (!this.$refs.vs.source) {
        this.getInvalidMsg('Source');

        return false;
      }

      if (!this.$refs.vs.image && this.$refs.vs.isVmImage) {
        this.getInvalidMsg('Image');

        return false;
      }

      if (isNaN(parseInt(this.$refs.vs.storage))) {
        this.getInvalidMsg('Size');

        return false;
      }
    },
    getInvalidMsg(key) {
      this.errors = [this.$store.getters['i18n/t']('validation.required', { key })];
    }
  },
};
</script>

<template>
  <div>
    <NameNsDescription
      description-key="spec.description"
      :value="value"
      :namespaced="false"
      :mode="mode"
    />

    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab name="basic" label="Basic" :weight="3" class="bordered-table">
        <Basic ref="vs" v-model="spec" :mode="mode" class="mb-20" @update:annotation="updateAnno" />
      </Tab>
      <Tab name="labels" label="Labels & Annotations" :weight="2" class="bordered-table">
        <LabelsAndAnnosModal v-model="value" :mode="mode" />
      </Tab>
      <Tab name="advanced" label="Advanced Options" :weight="1" class="bordered-table">
        <Advanced v-model="spec" :mode="mode" class="mb-20" />
      </Tab>
    </Tabbed>

    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>
