<script>
import SortableTable from '@/components/SortableTable';
import { STATE, NAME, AGE } from '@/config/table-headers';

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
        },
        AGE
      ],
    };
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
  />
</template>
