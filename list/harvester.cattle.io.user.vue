<script>
import { STATE, AGE, USERNAME } from '@/config/table-headers';
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
          ...USERNAME,
          formatter:   'LinkDetail',
          width:     250
        },
        AGE
      ];
    },
  },

  customCreateFormName() {
    return 'User';
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
