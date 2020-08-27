<script>
/* eslint-disable */
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import NameNsDescription from '@/components/form/NameNsDescription';
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';
import VolumeSource from '@/components/form/VolumeSource';
import { _CREATE } from '@/config/query-params';
import { allHash } from '@/utils/promise';
import { mapValueLabel } from '@/utils/array';
import { NAMESPACE, STORAGE_CLASS, PVC, IMAGE } from '@/config/types';

export default {
  name: 'volume',

  components: {
    Footer,
    VolumeSource,
    LabeledInput,
    LabeledSelect,
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
    };
  },

  watch: {
    spec(neu) {
      Object.assign(this.value.spec, neu);
    }
  }
};
</script>

<template>
  <div>
    <NameNsDescription
      :value="value"
      :mode="mode"
      name-label="Name"
    />

    <VolumeSource v-model="spec" />

    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>

<style lang="scss" scoped>

</style>
