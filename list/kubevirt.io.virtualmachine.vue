<script>
import { STATE, AGE, NAME, NAMESPACE as NAMESPACE_COL } from '@/config/table-headers';
import ResourceTable from '@/components/ResourceTable';
import { SCHEMA } from '@/config/types';
import { allHash } from '@/utils/promise';
import Loading from '@/components/Loading';
import LinkDetail from '@/components/formatter/LinkDetail';
import ConsoleBar from '@/components/form/ConsoleBar';

export default {
  name:       'ListVM',
  components: {
    ResourceTable, LinkDetail, ConsoleBar
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
        },
        {
          ...NAME,
          width: 350
        },
        NAMESPACE_COL,
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
};
</script>

<template>
  <div class="vm-list">
    <ResourceTable :schema="schema" :rows="rows" default-sort-by="age" :headers="headers">
      <template slot="cell:name" slot-scope="scope" class="name-col">
        <LinkDetail v-model="scope.row.metadata.name" :row="scope.row" />
        <ConsoleBar :resource="scope.row" />
      </template>
    </ResourceTable>
  </div>
</template>

<style lang="scss">
  .vm-list {
    .overview-web-console {
      display: inline-block !important;
      float: right;
      margin-right: 20px;
    }
  }
</style>
