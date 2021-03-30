<script>
import { VMI, NODE } from '@/config/types';
import CopyToClipboardText from '@/components/CopyToClipboardText';

export default {
  components: { CopyToClipboardText },
  props:      {
    value: {
      type:     String,
      default: ''
    },
    row: {
      type:     Object,
      required: true
    }
  },

  computed: {
    nodeName() {
      return this.node?.nameDisplay || '';
    },

    vmi() {
      const vmiResources = this.$store.getters['cluster/all'](VMI);
      const resource = vmiResources.find(VMI => VMI.id === this.row.id) || null;

      return resource;
    },

    node() {
      const nodeName = this.vmi?.status?.nodeName;

      return this.$store.getters['cluster/byId'](NODE, nodeName);
    },
  },
};
</script>

<template>
  <CopyToClipboardText v-if="nodeName " :text="nodeName" />
</template>
