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
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },

  computed: {
    ip() {
      const VMI = 'kubevirt.io.virtualmachineinstance';
      const choices = this.$store.getters['cluster/all'](VMI);
      const resource = choices.find(VMI => VMI.id === this.value) || null;

      return resource?.status?.interfaces?.[0]?.ipAddress;
    }
  },
};
</script>

<template>
  <CopyToClipboardText v-if="ip" :text="ip" />
</template>
