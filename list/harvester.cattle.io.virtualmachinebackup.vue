<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';

export default {
  name:       'ListUser',
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

  computed: {
    headers() {
      return [
        { ...STATE },
        {
          ...NAME,
          width: 200
        },
        {
          name:    'sourceName',
          label:   'SourceName',
          value:   'spec.source.name',
          align:   'right',
        },
        {
          name:    'readyToUse',
          label:   'ReadyToUse',
          value:   'status.readyToUse',
          align:   'right',
        },
        AGE
      ];
    },
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
  </sortabletable>
</template>
