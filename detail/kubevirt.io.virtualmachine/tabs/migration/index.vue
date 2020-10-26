<script>
import LabelValue from '@/components/LabelValue';
import MigrationState from '@/components/formatter/MigrationState';

export default {
  name: 'Migration',

  components: {
    LabelValue,
    MigrationState
  },

  props: {
    value: {
      type:     Object,
      required: true,
    },
    vmiResource: {
      type:     Object,
      required: true,
      default:  () => {
        return {};
      }
    }
  },

  data() {
    return { localResource: this.vmiResource };
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
      return 'N/A';
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
        <MigrationState style="float: right; padding: 3px 0" :vm-resource="value" />
      </div>

      <div class="row mb-20">
        <div class="col span-6">
          <LabelValue name="Source Node" :value="sourceNode" />
        </div>
        <div class="col span-6">
          <LabelValue name="Target Node" :value="targetNode" />
        </div>
      </div>

      <div class="row mb-20">
        <div class="col span-6">
          <LabelValue name="Started" :value="started" />
        </div>
        <div class="col span-6">
          <LabelValue name="Ended" :value="ended" />
        </div>
      </div>

      <div class="row mb-20">
        <div class="col span-6">
          <LabelValue name="Message" :value="message" />
        </div>
      </div>
    </el-card>
  </div>
</template>
