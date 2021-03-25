<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
// import VmState from '@/components/formatter/BadgeStateFormatter';
import VmState from '@/components/formatter/vmState';
import MigrationState from '@/components/formatter/MigrationState';
import { allSettled } from '@/utils/promise';
import { HARVESTER_NODE_NETWORK, HARVESTER_CLUSTER_NETWORK } from '@/config/types';

export default {
  name: 'InstanceNode',

  components: {
    SortableTable, VmState, MigrationState
  },

  props: {
    rows: {
      type:     Array,
      required: true,
    },
  },

  async fetch() {
    const hash = await allSettled({
      allNodeNetwork:      this.$store.dispatch('cluster/findAll', { type: HARVESTER_NODE_NETWORK }),
      allClusterNetwork:   this.$store.dispatch('cluster/findAll', { type: HARVESTER_CLUSTER_NETWORK }),
    });

    this.allNodeNetwork = hash.allNodeNetwork;
    this.allClusterNetwork = hash.allClusterNetwork;
  },

  data() {
    return {
      allNodeNetwork:    [],
      allClusterNetwork: []
    };
  },

  computed: {
    headers() {
      return [
        {
          ...STATE,
          width: 250
        },
        { ...NAME, width: 120 },
        {
          name:      'vmCPU',
          labelKey:  'tableHeaders.cpu',
          sort:      'vmCPU',
          search:    false,
          value:     'spec.template.spec.domain.cpu.cores',
          width:     120
        },
        {
          name:      'vmRAM',
          labelKey:  'glance.memory',
          sort:      'vmRAM',
          search:    false,
          value:     'spec.template.spec.domain.resources.requests.memory',
          width:     120
        },
        {
          name:      'ip',
          label:     'IP Address',
          labelKey:  'tableHeaders.vm.ipAddress',
          value:     'id',
          formatter: 'ipAddress'
        },
        {
          ...AGE,
          sort: 'metadata.creationTimestamp:desc',
        }
      ];
    },
  },

  methods: {}
};
</script>

<template>
  <div class="row host-instances">
    <div class="col span-12">
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
      </Sortabletable>
    </div>
  </div>
</template>

<style lang="scss">
.bordered-table .host-instances thead th {
  vertical-align: middle;
}

.bordered-table .host-instances .state {
  display: flex;

  .vmstate {
    margin-right: 6px;
  }
}
</style>
