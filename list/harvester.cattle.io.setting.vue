<script>
import ResourceTable from '@/components/ResourceTable';
import { allHash } from '@/utils/promise';
import { NAME, SETTING_VALUE } from '@/config/table-headers';
import { HARVESTER_SETTING } from '@/config/types';

export default {
  name:       'ListSetting',
  components: { ResourceTable },

  props: {
    schema: {
      type:     Object,
      required: true,
    }
  },

  async fetch() {
    const hash = await allHash({ haversterSettings: this.$store.dispatch('cluster/findAll', { type: HARVESTER_SETTING }) });

    this.haversterSettings = hash.haversterSettings;
  },

  data() {
    return {
      headers:           [{ ...NAME, width: 200 }, { ...SETTING_VALUE, formatter: 'settingMessage' }],
      haversterSettings: []
    };
  },

  computed: {
    rows() {
      return [...this.haversterSettings];
    },
  }

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
