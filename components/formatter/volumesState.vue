<script>
import { VM, DATA_VOLUME } from '@/config/types';
export default {
  props: {
    value: {
      type:    Object,
      default: () => {}
    },
    row: {
      type:     Object,
      required: true
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },

  data() {
    const dataVolumeList = this.$store.getters['cluster/all'](DATA_VOLUME) || [];
    const vmList = this.$store.getters['cluster/all'](VM) || [];

    return {
      vmList,
      dataVolumeList,
    };
  },

  computed: {
    formatValue() {
      if (this.col.type === 'state') {
        const boundCondition = this.dataVolume?.getStatusConditionOfType('Bound');
        const readyCondition = this.dataVolume?.getStatusConditionOfType('Ready');

        if (boundCondition?.status === 'True') {
          return 'In-use';
        } else if (readyCondition?.status === 'True' && boundCondition?.status === 'False') {
          return 'available';
        } else {
          return 'N/A';
        }
      }

      if (this.col.type === 'status') {
        const readyCondition = this.dataVolume?.getStatusConditionOfType('Ready');

        return readyCondition?.status === 'True' ? 'ready' : 'noready';
      }

      if (this.col.type === 'attached') {
        return this.vm?.metadata?.name || 'N/A';
      }

      return '';
    },
    dataVolume() {
      const id = `${ this.value?.namespace }/${ this.value?.name }`;

      return this.dataVolumeList.find( (D) => {
        return D.id === id;
      });
    },

    vm() {
      return this.vmList.find( (D) => {
        return D.metadata?.uid === this.dataVolume?.metadata?.ownerReferences?.[0]?.uid;
      });
    },
  }
};
</script>

<template>
  <span>
    {{ formatValue }}
  </span>
</template>
