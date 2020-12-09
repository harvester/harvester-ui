<script>
import ResourceTable from '@/components/ResourceTable';
import { NAME, SETTING_VALUE } from '@/config/table-headers';

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
    return { headers: [NAME, { ...SETTING_VALUE, formatter: 'settingMessage' }] };
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
