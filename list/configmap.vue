<script>
import SortableTable from '@/components/SortableTable';
import { NAME, KEYS, AGE } from '@/config/table-headers';
import { HARVESTER_CLOUD_INIT_USER, HARVESTER_CLOUD_INIT_NETWORK } from '@/config/labels-annotations';

export default {
  name:       'ListConfigMap',
  components: { SortableTable },

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
    return {
      headers: [
        {
          ...NAME,
          width: 300
        },
        KEYS,
        {
          name:          'type',
          labelKey:      'tableHeaders.type',
          value:         'metadata.labels',
          formatter:     'CloudInitType',
        },
        AGE
      ],
    };
  },

  computed: {
    filterdRows() {
      return this.rows.filter((r) => {
        return !!r.metadata?.labels?.[HARVESTER_CLOUD_INIT_USER] || !!r.metadata?.labels?.[HARVESTER_CLOUD_INIT_NETWORK];
      });
    }
  },

};
</script>

<template>
  <SortableTable
    v-bind="$attrs"
    :headers="headers"
    :rows="[...filterdRows]"
    key-field="_key"
    v-on="$listeners"
  />
</template>
