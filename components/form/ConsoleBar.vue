<script>
import Console from '@/components/form/Console';
import SerialConsole from '@/components/form/SerialConsole';

export default {
  name: 'ConsoleBar',

  components: {
    Console,
    SerialConsole,
  },

  props: {
    resource: {
      type:     Object,
      required: true,
      default:  () => {
        return {};
      }
    },
  },

  data() {
    return {
      serialShow: false,
      vncShow:    false,
    };
  },

  computed: {
    isDown() {
      return this.isEmpty(this.resource);
    },
  },

  methods: {
    handleDropdown(c) {
      switch (c) {
      case 'vnc':
        this.showVncPanel();
        break;
      case 'serial':
        this.showSerialPanel();
        break;
      }
    },
    showVncPanel() {
      this.vncShow = true;
    },
    showSerialPanel() {
      this.serialShow = true;
    },
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    }
  }
};
</script>

<template>
  <div class="overview-web-console">
    <el-dropdown
      v-if="!isDown"
      size="mini"
      split-button
      @click="showVncPanel"
      @command="handleDropdown"
    >
      <span class="el-icon-connection">Console</span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="vnc">
          Open in Web VNC
        </el-dropdown-item>
        <el-dropdown-item command="serial">
          Open in Serial Console
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dialog
      :visible.sync="vncShow"
    >
      <Console v-model="resource" />
    </el-dialog>

    <el-dialog
      :visible.sync="serialShow"
    >
      <SerialConsole v-model="resource" :show="serialShow" />
    </el-dialog>
  </div>
</template>

<style lang="scss">
  .overview-web-console {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: auto;
    grid-row-gap: 15px;

    .el-dialog {
      width: 1024px;

      &__body {
        padding: 0;
      }

      &__headerbtn {
        top: 9px;
      }
    }
  }
</style>
