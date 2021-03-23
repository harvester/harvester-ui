<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
// import VmState from '@/components/formatter/BadgeStateFormatter';
import VmState from '@/components/formatter/vmState';
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
        {
          ...STATE,
          // value:     'id',
          width: 200
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
          <VmState class="vmstate" :row="scope.row" />
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
