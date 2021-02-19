<template>
  <div>
    <div ref="view"></div>
  </div>
</template>

<script>
import RFB from '@novnc/novnc/core/rfb';

export default {
  props: {
    url: {
      type:    String,
      default: ''
    }
  },

  data() {
    return { rfb: null };
  },

  mounted() {
    this.$nextTick(() => {
      this.rfb = new RFB(this.$refs.view, this.url);
    });
  },

  methods: {
    disconnect() {
      this.rfb.disconnect();
    },

    ctrlAltDelete() {
      this.rfb.sendCtrlAltDel();
    },

    printScreen() {
      this.rfb.sendKey(0, 'PrintScreen');
    },
  }
};
</script>
