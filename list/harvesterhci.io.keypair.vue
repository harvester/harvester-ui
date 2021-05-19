<script>
import ResourceTable from '@/components/ResourceTable';
import { STATE, NAME, FINGERPRINT, AGE } from '@/config/table-headers';

export default {
  name:       'LSSHs',
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
  <ResourceTable
    v-bind="$attrs"
    :headers="headers"
    :rows="rows"
    :groupable="true"
    key-field="_key"
    v-on="$listeners"
  />
</template>
