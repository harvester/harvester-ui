<script>
import ResourceTable from '@/components/ResourceTable';
import { allSettled } from '@/utils/promise';
import { NAME, SETTING_VALUE } from '@/config/table-headers';
import { HARVESTER_SETTING, HARVESTER_CLUSTER_NETWORK } from '@/config/types';

export default {
  name:       'ListSetting',
  components: { ResourceTable },
  props:      {
    schema: {
      type:     Object,
      required: true,
    }
  },
  async fetch() {
    const hash = await allSettled({
      haversterSettings:      this.$store.dispatch('cluster/findAll', { type: HARVESTER_SETTING }),
      clusterNetworkSettings: this.$store.dispatch('cluster/findAll', { type: HARVESTER_CLUSTER_NETWORK }),
    });

    this.haversterSettings = hash.haversterSettings;
    this.clusterNetworkSettings = hash.clusterNetworkSettings;
  },
  data() {
    return {
      headers:                [NAME, { ...SETTING_VALUE, formatter: 'settingMessage' }],
      haversterSettings:      [],
      clusterNetworkSettings: []
    };
  },
  computed: {
    rows() {
      return [...this.haversterSettings, ...this.clusterNetworkSettings];
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
