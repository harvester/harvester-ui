<script>
import { STATE, AGE, NAME, NAMESPACE as NAMESPACE_COL } from '@/config/table-headers';
import ResourceTable from '@/components/ResourceTable';
import { SCHEMA } from '@/config/types';
import { allHash } from '@/utils/promise';
import Loading from '@/components/Loading';

export default {
  name:       'ListVM',
  components: { ResourceTable },

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
        NAME,
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
  <ResourceTable :schema="schema" :rows="rows" default-sort-by="age" :headers="headers" />
</template>
