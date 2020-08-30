<script>
/* eslint-disable */
import NameNsDescription from '@/components/form/NameNsDescription';
import Footer from '@/components/form/Footer';
import ResourceTabs from '@/components/form/ResourceTabs';
import CreateEditView from '@/mixins/create-edit-view';
import VolumeSource from './VolumeSource';
import { allHash } from '@/utils/promise';
import { STORAGE_CLASS, IMAGE } from '@/config/types';

export default {
  name: 'volume',

  components: {
    Footer,
    VolumeSource,
    ResourceTabs,
    NameNsDescription
  },

  mixins: [CreateEditView],

  async fetch() {
    const hash = await allHash({
      image:         this.$store.dispatch('cluster/findAll', { type: IMAGE }),
      storageClass:  this.$store.dispatch('cluster/findAll', { type: STORAGE_CLASS }),
    });
  },

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    let spec = this.value.spec;

    if (!spec) {
      spec = {
        pvc: {
          resources: {
            requests: {
              storage: ''
            }
          }
        },

      }
      this.value.spec = spec;
    }
    return {
      spec,
      randow: Math.random(),
      index: 0
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
      this.$set(this.value.metadata, 'annotations', neu)
    }
  },
};
</script>

<template>
  <div>
    <NameNsDescription
      :value="value"
      :mode="mode"
      name-label="Name"
    />

    <VolumeSource v-model="spec" class="mb-20" @update:annotation="updateAnnotation" />

    <ResourceTabs v-model="value" :mode="mode" :key="randow" />

    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>
