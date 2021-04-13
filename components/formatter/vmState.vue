<script>
import VMState from '@/components/formatter/BadgeStateFormatter';
import MigrationState from '@/components/formatter/MigrationState';
// import RestoreProgress from '@/components/formatter/restoreProgress';

export default {
  components: { VMState, MigrationState },
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

  data() {
    return { isMigrating: false };
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
  },

  methods: {
    migrationStateChanged(neu) {
      this.isMigrating = !!neu;
    }
  },
};
</script>

<template>
  <span>
    <!-- <RestoreProgress :vm="row" /> -->
    <MigrationState v-show="isMigrating" :vm-resource="row" @state-changed="migrationStateChanged" />
    <div v-show="!isMigrating" class="state">
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
