<script>
import NovncConsole from '@/components/NovncConsole';

export default {
  components: { NovncConsole },

  props: {
    value: {
      type:     Object,
      required: true,
      default:  () => {
        return {};
      }
    }
  },

  computed: {
    isDown() {
      return this.isEmpty(this.value);
    },
    url() {
      const isDev = process.env.dev;

      const ip = !isDev ? `${ window.location.hostname }:${ window.location.port }` : process.env.api.split('//')[1];

      return `wss://${ ip }${ this.value?.getVMIApiPath }`;
    },
  },

  methods: {
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    },

    close() {
      this.$refs.novncConsole.disconnect();
    },
  }
};
</script>

<template>
  <div id="app">
    <div class="vm-console">
      <NovncConsole v-if="url && !isDown" ref="novncConsole" :url="url" />
      <p v-if="isDown">
        {{ t("vm.detail.console.down") }}
      </p>
    </div>
  </div>
</template>
