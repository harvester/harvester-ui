<script>
import ResourceTable from '@/components/ResourceTable';
import { STATE, NAME, AGE } from '@/config/table-headers';

export default {
  name:       'ListSetting',
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
    return { headers: [STATE, NAME, AGE] };
  },

  methods: {}

};
</script>

<template>
  <ResourceTable
    v-bind="$attrs"
    :schema="schema"
    :headers="headers"
    :rows="[...rows]"
    key-field="_key"
    v-on="$listeners"
  >
  </ResourceTable>
</template>
