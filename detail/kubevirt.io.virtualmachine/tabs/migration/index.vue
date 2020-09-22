<script>
/* eslint-disable */
import VmState from '@/components/formatter/vmState';
import LabelValue from '@/components/LabelValue';

export default {
  name: 'Migration',

  components: {
    VmState,
    LabelValue
  },

  props: {
    vmiResource: {
      type:     Object,
      required: true,
      default:  () => {
        return {};
      }
    }
  },

  data() {
    return {
      localResource: this.vmiResource
    };
  },

  computed: {
    migrationState() {
      return this.localResource?.status?.migrationState;
    },
    sourceNode() {
      return this.migrationState?.sourceNode || '-';
    },
    targetNode() {
      return this.migrationState?.targetNode || '-';
    },
    started() {
      return this.migrationState?.startTimestamp || 'N/A';
    },
    ended() {
      return this.migrationState?.endTimestamp || 'N/A';
    },
    message() {
      return '------'
    }
  },

  watch: {
    vmiResource: {
      handler(neu) {
        this.localResource = neu;
      },
      deep: true
    }
  }
};
</script>

<template>
  <div>
    <el-card class="box-card mb-20">
      <div slot="header" class="clearfix">
        <span>Migration</span>
        <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
      </div>

      <div class="row mb-20">
        <div class="col span-6">
          <LabelValue name="Source Node"  :value="sourceNode" />
        </div>
        <div class="col span-6">
          <LabelValue name="Target Node"  :value="targetNode" />
        </div>
      </div>

      <div class="row mb-20">
        <div class="col span-6">
          <LabelValue name="Started"  :value="started" />
        </div>
        <div class="col span-6">
          <LabelValue name="Ended"  :value="ended" />
        </div>
      </div>

      <div class="row mb-20">
        <div class="col span-6">
          <LabelValue name="Message"  :value="message" />
        </div>
      </div>
    </el-card>
  </div>
</template>
