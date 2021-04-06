<script>
import SortableTable from '@/components/SortableTable';
import { STATE, NAME, FINGERPRINT, AGE } from '@/config/table-headers';

export default {
  name:       'LSSHs',
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
        STATE,
        {
          ...NAME,
          width: 250
        },
        FINGERPRINT,
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
    :rows="rows"
    key-field="_key"
    v-on="$listeners"
  />
</template>
