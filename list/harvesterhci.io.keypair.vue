<script>
import ResourceTable from '@/components/ResourceTable';
import {
  STATE, NAME, FINGERPRINT, AGE, NAMESPACE
} from '@/config/table-headers';

export default {
  name:       'ListSSH',
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
        NAMESPACE,
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
    :schema="schema"
    key-field="_key"
    v-on="$listeners"
  />
</template>
