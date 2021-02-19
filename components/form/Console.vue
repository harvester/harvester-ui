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

    sendCtrlAltDel() {
      this.$refs.novncConsole.ctrlAltDelete();
    },

    sendPrintScreen() {
      this.$refs.novncConsole.printScreen();
    },
  }
};
</script>

<template>
  <div id="app">
    <div class="vm-console">
      <div class="combination-keys">
        <v-popover
          ref="popover"
          placement="top"
          trigger="click"
        >
          <button class="btn btn-sm bg-primary">
            <i class="icon icon-actions"></i>
          </button>

          <template slot="popover">
            <ul class="list-unstyled dropdown" style="margin: -1px;">
              <li
                class="p-10 hand"
                @click="sendCtrlAltDel()"
              >
                Ctrl Alt Delete
              </li>

              <li
                class="p-10 hand"
                @click="sendPrintScreen()"
              >
                Print Screen
              </li>
            </ul>
          </template>
        </v-popover>
      </div>
      <NovncConsole v-if="url && !isDown" ref="novncConsole" :url="url" />
      <p v-if="isDown">
        {{ t("harvester.vmPage.detail.console.down") }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .combination-keys {
    position: fixed;
    right: 0;
    top: 0;
  }
</style>
