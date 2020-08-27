<script>
import SortableTable from '@/components/SortableTable';
import { STATE, NAME } from '@/config/table-headers';

export default {
  name:       'ListSSH',
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
      headers:         [
        STATE,
        {
          ...NAME,
          width: 250
        },
        {
          name:      'Fingerprint',
          label:     'Fingerprint',
          value:     'status.fingerPrint',
        }
      ],
    };
  },

  typeDisplay() {
    return 'SSH Keys';
  },
};
</script>

<template>
  <SortableTable
    v-bind="$attrs"
    :headers="headers"
    :rows="[...rows]"
    key-field="_key"
    v-on="$listeners"
  >
  </SortableTable>
</template>
