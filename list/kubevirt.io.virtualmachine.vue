<script>
import { STATE, AGE, NAME, NAMESPACE as NAMESPACE_COL } from '@/config/table-headers';
import ResourceTable from '@/components/ResourceTable';
import VmState from '@/components/formatter/vmState';
import MigrationState from '@/components/formatter/MigrationState';
import { SCHEMA } from '@/config/types';
import { allHash } from '@/utils/promise';
import Loading from '@/components/Loading';

export default {
  name:       'ListVM',
  components: {
    ResourceTable, VmState, MigrationState
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
          width:      200
        },
        {
          ...NAME,
          width:         350,
          formatter:     'vmName',
        },
        {
          ...NAMESPACE_COL,
          name: 'groupByLabel'
        },
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
  <ResourceTable :schema="schema" :rows="rows" default-sort-by="age" :headers="headers" group-by="namespace">
    <template slot="cell:state" slot-scope="scope" class="state-col">
      <div class="state">
        <VmState v-model="scope.row.id" class="vmstate" :row="scope.row" />
        <MigrationState :vm-resource="scope.row" />
      </div>
    </template>
  </ResourceTable>
</template>

<style lang="scss" scoped>
.state {
  display: flex;

  .vmstate {
    margin-right: 6px;
  }
}
</style>
