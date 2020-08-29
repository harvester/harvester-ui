<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import ResourceTable from '@/components/ResourceTable';
import { SCHEMA, DATA_VOLUME, VM, PV } from '@/config/types';
import { allHash } from '@/utils/promise';
import Loading from '@/components/Loading';

export default {
  name:       'ListPV',
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
        STATE,
        NAME,
        {
          name:      'default',
          label:     'Default version',
          value:     'status.defaultVersion',
        },
        {
          name:      'latest',
          label:     'Latest version',
          value:     'status.latestVersion',
        },
        AGE
      ];
    },
  },

  typeDisplay() {
    return 'Templates';
  },
};
</script>

<template>
  <ResourceTable :schema="schema" :rows="rows" :headers="headers" />
</template>
