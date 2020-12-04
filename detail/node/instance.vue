<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
import VmState from '@/components/formatter/BadgeStateFormatter';
import MigrationState from '@/components/formatter/MigrationState';

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

  data() {
    return {};
  },

  computed: {
    headers() {
      return [
        STATE,
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
            <VmState class="vmstate" :row="scope.row" />
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
</style>
