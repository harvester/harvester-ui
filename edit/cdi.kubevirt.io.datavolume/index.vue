<script>
import NameNsDescription from '@/components/form/NameNsDescription';
import Footer from '@/components/form/Footer';
import LabelAndAnnoTabs from '@/components/form/LabelAndAnnoTabs';
import CreateEditView from '@/mixins/create-edit-view';
import { allHash } from '@/utils/promise';
import { STORAGE_CLASS, IMAGE } from '@/config/types';
import { DESCRIPTION } from '@/config/labels-annotations';
import VolumeSource from './VolumeSource';

export default {
  name: 'Volume',

  components: {
    Footer,
    VolumeSource,
    LabelAndAnnoTabs,
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

  data() {
    let spec = this.value.spec;

    if (!spec) {
      spec = { pvc: { resources: { requests: { storage: '' } } } };
      this.value.spec = spec;
    }

    return {
      spec,
      index:       0,
      errors:      [],
      description: this.value.metadata?.[DESCRIPTION]
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
    updateAnno() {
      this.description = this.value.metadata?.annotations?.[DESCRIPTION];
    },
    willSave() {
      this.$set(this.value.metadata, 'annotations', {
        ...this.value.metadata.annotations,
        [DESCRIPTION]: this.description
      });
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
      v-if="isCreate"
      :value="value"
      :mode="mode"
      @change="updateAnno"
    />

    <VolumeSource ref="vs" v-model="spec" :mode="mode" class="mb-20" />

    <LabelAndAnnoTabs v-model="value" :mode="mode" />

    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>
