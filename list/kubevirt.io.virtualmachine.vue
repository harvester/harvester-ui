<script>
import { STATE, AGE, NAME, NAMESPACE as NAMESPACE_COL } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
import VmState from '@/components/formatter/vmState';
import MigrationState from '@/components/formatter/MigrationState';

export default {
  name:       'ListVM',
  components: {
    SortableTable, VmState, MigrationState
  },

  props: {
    schema: {
      type:     Object,
      required: true,
    },

    rows: {
      type:     Array,
      required: true,
    },
  },

  computed: {
    headers() {
      return [
        {
          ...STATE,
          value:     'id',
          formatter: 'vmState',
          width:      250
        },
        {
          ...NAME,
          width:         350,
          formatter:     'vmName',
        },
        { ...NAMESPACE_COL },
        {
          name:      'ip',
          label:     'IP Address',
          value:     'id',
          formatter: 'ipAddress'
        },
        {
          name:      'node',
          label:     'Node',
          value:     'id',
          formatter: 'nodeName'
        },
        {
          ...AGE,
          sort: 'metadata.creationTimestamp:desc',
        }
      ];
    },
  },

  customCreateFormName() {
    return 'Virtual Machine';
  },
};
</script>

<template>
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
        <VmState v-model="scope.row.id" class="vmstate" :row="scope.row" />
        <MigrationState :vm-resource="scope.row" :show-success="false" />
      </div>
    </template>
  </sortabletable>
</template>

<style lang="scss" scoped>
.state {
  display: flex;

  .vmstate {
    margin-right: 6px;
  }
}
</style>
