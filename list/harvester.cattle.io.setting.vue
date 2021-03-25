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

    const isRancher = this.$store.dispatch('auth/getIsRancher');

    this.haversterSettings = hash.haversterSettings;
    this.clusterNetworkSettings = hash.clusterNetworkSettings;
    this.isRancher = isRancher;
  },
  data() {
    return {
      headers:                [{ ...NAME, width: 200 }, { ...SETTING_VALUE, formatter: 'settingMessage' }],
      haversterSettings:      [],
      clusterNetworkSettings: [],
      isRancher:              []
    };
  },
  computed: {
    rows() {
      const settings = this.haversterSettings.filter( (O) => {
        return !(O.metadata.name === 'rancher-enabled' && !this.isRancher);
      });

      return [...settings, ...this.clusterNetworkSettings];
    }
  },

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
