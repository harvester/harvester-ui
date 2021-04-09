<script>
import VMState from '@/components/formatter/BadgeStateFormatter';
import { VMI } from '@/config/types';
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

      return (!!nn?.message || !this.enableClusterNetwork) && this.row?.attachNetwork && this?.row?.actualState === 'Running';
    },

    message() {
      return this.t('harvester.networkPage.message.vlanInactive', { name: this.row.realAttachNodeName });
    },

    enableClusterNetwork() {
      const clusterNetwork = this.allClusterNetwork?.[0] || {};

      return clusterNetwork?.enable;
    },

    vmiResource() {
      const vmiList = this.$store.getters['cluster/all'](VMI) || [];
      const vmi = vmiList.find( (VMI) => {
        return VMI?.metadata?.ownerReferences?.[0]?.uid === this.row?.metadata?.uid;
      });

      return vmi;
    },

    migrationState() {
      return this.vmiResource?.migrationState?.status || '';
    }
  }
};
</script>

<template>
  <span>
    <!-- <RestoreProgress :vm="row" /> -->
    <span v-if="!!migrationState" :class="{'badge-state': true, [vmiResource.migrationStateBackground]: true}">
      {{ migrationState }}
    </span>
    <div v-else class="state">
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
