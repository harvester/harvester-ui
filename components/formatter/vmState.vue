<script>
import VMState from '@/components/formatter/BadgeStateFormatter';
// import RestoreProgress from '@/components/formatter/restoreProgress';

export default {
  components: { VMState },
  props:      {
    value: {
      type:     String,
      default: ''
    },

    row: {
      type:     Object,
      required: true
    },

    allNodeNetwork: {
      type:     Array,
      default: () => {
        return [];
      }
    },

    allClusterNetwork: {
      type:     Array,
      default: () => {
        return [];
      }
    }
  },

  computed: {
    NetworkImpassability() {
      const nodeName = this.row?.nodeName;
      const nn = this.allNodeNetwork.find( N => N.attachNodeName === nodeName);

      return (!!nn?.message || !this.enableClusterNetwork) && this.row?.attachNetwork;
    },

    message() {
      return this.t('harvester.networkPage.message.vlanInactive', { name: this.row.realAttachNodeName });
    },

    enableClusterNetwork() {
      const clusterNetwork = this.allClusterNetwork?.[0] || {};

      return clusterNetwork?.enable;
    }
  }
};
</script>

<template>
  <span>
    <!-- <RestoreProgress :vm="row" /> -->
    <div class="state">
      <VMState :row="row" />
      <i v-if="NetworkImpassability" v-tooltip="message" class="icon icon-warning icon-lg text-warning" />
    </div>
  </span>
</template>

<style lang="scss" scoped>
.state {
  display: flex;
  justify-content: space-between;

  .icon-warning {
    margin-top: 2px;
  }
}
</style>
