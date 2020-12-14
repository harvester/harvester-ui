<script>
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
      return this.row.realAttachNodeName;
    }
  },
};
</script>

<template>
  <CopyToClipboardText v-if="nodeName " :text="nodeName" />
</template>
