<script>
import IPAddress from '@/components/formatter/ipAddress';
import Console from '@/components/form/Console';
import SerialConsole from '@/components/form/SerialConsole';

const UNDEFINED = 'n/a';

export default {
  name: 'Details',

  components: {
    Console,
    SerialConsole,
    IPAddress,
  },

  props: {
    value: {
      type:     Object,
      required: true
    },
    resource: {
      type:     Object,
      required: true,
      default:  () => {
        return {};
      }
    },
    mode: {
      type:     String,
      required: true,
    },
  },

  data() {
    return {
      serialShow: false,
      vncShow:    false,
    };
  },

  computed: {
    name() {
      return this.value?.metadata?.name || UNDEFINED;
    },
    namespace() {
      return this.value?.metadata?.namespace || UNDEFINED;
    },
    creationTimestamp() {
      const date = new Date(this.value?.metadata?.creationTimestamp);

      if (!date.getMonth) {
        return UNDEFINED;
      }

      return `${ date.getMonth() + 1 }/${ date.getDate() }/${ date.getUTCFullYear() }`;
    },
    node() {
      return this.resource?.status?.nodeName || UNDEFINED;
    },
    hostname() {
      return this.resource?.spec?.hostname || UNDEFINED;
    },
    isNamespace() {
      return 'Namespace';
    },
    isNode() {
      return 'Node';
    },
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
  <div class="overview-basics">
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.name") }}
      </label>
      <div>
        <div class="row">
          <div class="col span-6 overview-basics__name">
            {{ name }}
          </div>
          <div class="col span-6 text-right">
            <el-dropdown size="mini" split-button type="primary" @click="showVncPanel" @command="handleDropdown">
              <span class="el-icon-connection">SSH</span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="vnc">
                  Open in Web VNC
                </el-dropdown-item>
                <el-dropdown-item command="serial">
                  Open in Serial Console
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.namespace") }}
      </label>
      <div>
        {{ namespace }}
      </div>
    </div>
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.hostname") }}
      </label>
      <div v-if="!isDown">
        {{ hostname }}
      </div>
      <div v-else>
        {{ t("vm.detail.details.down") }}
      </div>
    </div>
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.node") }}
      </label>
      <div v-if="!isDown">
        <span>{{ node }}</span>
      </div>
      <div v-else>
        {{ t("vm.detail.details.down") }}
      </div>
    </div>
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.ipAddress") }}
      </label>
      <div>
        <IPAddress v-model="value.id" :row="value" />
      </div>
    </div>
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.created") }}
      </label>
      <div>
        {{ creationTimestamp }}
      </div>
    </div>

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
  .overview-basics {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: auto;
    grid-row-gap: 15px;

    .badge-state {
      padding: 2px 5px;
      font-size: 12px;
      margin-right: 3px;
    }

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
