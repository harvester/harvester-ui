<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';

export default {
  name:       'ListUpgrades',
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
          name:      'Progress',
          value:     'status',
          // formatter: 'Upgrade',
        },
        AGE
      ];
    },
  },

  customCreateFormName() {
    return 'Upgrade';
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
