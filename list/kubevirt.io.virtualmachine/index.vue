<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
// import VmState from '@/components/formatter/BadgeStateFormatter';
import VmState from '@/components/formatter/vmState';
import { allSettled } from '@/utils/promise';
import { HARVESTER_NODE_NETWORK, HARVESTER_CLUSTER_NETWORK, VM } from '@/config/types';
import MigrationState from '@/components/formatter/MigrationState';
import BackupModal from './backupModal';
import RestoreModal from './restoreModal';

export default {
  name:       'ListVM',
  components: {
    SortableTable,
    VmState,
    MigrationState,
    BackupModal,
    RestoreModal
  },

  props: {
    schema: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const hash = await allSettled({
      vm:                  this.$store.dispatch('cluster/findAll', { type: VM }),
      allNodeNetwork:      this.$store.dispatch('cluster/findAll', { type: HARVESTER_NODE_NETWORK }),
      allClusterNetwork:   this.$store.dispatch('cluster/findAll', { type: HARVESTER_CLUSTER_NETWORK }),
    });

    this.vmList = hash.vm;
    this.allNodeNetwork = hash.allNodeNetwork;
    this.allClusterNetwork = hash.allClusterNetwork;
  },

  data() {
    return {
      vmList:            [],
      allNodeNetwork:    [],
      allClusterNetwork: []
    };
  },

  computed: {
    headers() {
      return [
        {
          ...STATE,
          // value:     'id',
          width: 250
        },
        {
          ...NAME,
          width:         350,
          formatter:     'vmName',
        },
        {
          name:      'ip',
          label:     'IP Address',
          value:     'id',
          formatter: 'ipAddress',
          labelKey:  'tableHeaders.vm.ipAddress'
        },
        {
          name:      'node',
          label:     'Node',
          value:     'id',
          formatter: 'nodeName',
          labelKey:  'tableHeaders.vm.node'
        },
        {
          ...AGE,
          sort: 'metadata.creationTimestamp:desc',
        }
      ];
    },

    rows() {
      return this.vmList;
    }
  },
};
</script>

<template>
  <div>
    <SortableTable
      v-bind="$attrs"
      :headers="headers"
      default-sort-by="age"
      :rows="[...rows]"
      key-field="_key"
      v-on="$listeners"
    >
      <template slot="cell:state" slot-scope="scope" class="state-col">
        <div class="state">
          <VmState class="vmstate" :row="scope.row" :all-node-network="allNodeNetwork" :all-cluster-network="allClusterNetwork" />
          <MigrationState :vm-resource="scope.row" :show-success="false" />
        </div>
      </template>
    </sortabletable>

    <BackupModal />
    <RestoreModal />
  </div>
</template>

<style lang="scss" scoped>
.state {
  display: flex;

  .vmstate {
    margin-right: 6px;
  }
}
</style>
