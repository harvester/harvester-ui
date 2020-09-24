<script>
import NameNsDescription from '@/components/form/NameNsDescription';
import Footer from '@/components/form/Footer';
import ResourceTabs from '@/components/form/ResourceTabs';
import CreateEditView from '@/mixins/create-edit-view';
import { allHash } from '@/utils/promise';
import { STORAGE_CLASS, IMAGE } from '@/config/types';
import VolumeSource from './VolumeSource';

export default {
  name: 'Volume',

  components: {
    Footer,
    VolumeSource,
    ResourceTabs,
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
    const hash = await allHash({
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
      randow: Math.random(),
      index:  0,
      errors: []
    };
  },

  watch: {
    spec(neu) {
      Object.assign(this.value.spec, neu);
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
  <el-card class="box-card mb-20">
    <div>
      <NameNsDescription
        v-if="isCreate"
        :value="value"
        :mode="mode"
        name-label="Name"
      />

      <VolumeSource ref="vs" v-model="spec" :mode="mode" class="mb-20" @update:annotation="updateAnnotation" />

      <ResourceTabs :key="randow" v-model="value" :mode="mode" />

      <Footer :mode="mode" :errors="errors" @save="beforeSave" @done="done" />
    </div>
  </el-card>
</template>
