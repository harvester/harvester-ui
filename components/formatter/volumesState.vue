<script>
import { VM, DATA_VOLUME } from '@/config/types';
import { DATA_VOLUME_OWNEDBY } from '@/config/labels-annotations';

export default {
  props: {
    value: {
      type:    [String, Object],
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
      const ownerAnnotation = this.row?.metadata?.annotations?.[DATA_VOLUME_OWNEDBY];

      if (!ownerAnnotation) {
        return;
      }

      const owner = JSON.parse(ownerAnnotation)[0]?.refs?.[0];

      return this.vmList.find( (D) => {
        return D.id === owner;
      });
    },

    to() {
      return this.vm?.detailLocation;
    },
  }
};
</script>

<template>
  <div>
    <span v-if="col.type !== 'attached'">
      {{ formatValue }}
    </span>

    <span else>
      <n-link v-if="to" :to="to">
        {{ formatValue }}
      </n-link>
    </span>
  </div>
</template>
