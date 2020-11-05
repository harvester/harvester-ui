<script>
import { STATE, AGE, USERNAME, IS_ADMIN } from '@/config/table-headers';
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
        USERNAME,
        IS_ADMIN,
        {
          name:  'Description',
          label: 'Description',
          value: 'description',
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
