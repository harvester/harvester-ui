<script>
import ResourceTable from '@/components/ResourceTable';
import { allSettled } from '@/utils/promise';
import { NAME, SETTING_VALUE } from '@/config/table-headers';
import { HARVESTER_SETTING, HARVESTER_CLUSTER_NETWORK } from '@/config/types';

const BLACK_LIST = [
  'api-ui-source',
  'auth-secret-name',
  'first-login',
  'no-default-admin',
  'upgradable-versions',
  'volume-snapshot-class'
];

export default {
  name: 'LSettings',

  components: { ResourceTable },

  props:      {
    schema: {
      type:     Object,
      required: true,
    }
  },

  async fetch() {
    await allSettled({
      clusterNetwork:      this.$store.dispatch('cluster/findAll', { type: HARVESTER_CLUSTER_NETWORK }),
      haversterSettings:   this.$store.dispatch('cluster/findAll', { type: HARVESTER_SETTING }),
    });
  },

  computed: {
    headers() {
      return [
        { ...NAME, width: 200 },
        { ...SETTING_VALUE, formatter: 'settingMessage' }
      ];
    },

    clusterNetwork() {
      return this.$store.getters['cluster/all'](HARVESTER_CLUSTER_NETWORK);
    },

    haversterSettings() {
      const settings = this.$store.getters['cluster/all'](HARVESTER_SETTING);

      return settings.filter( (O) => {
        return !(O.metadata.name === 'rancher-enabled' && !this.isRancher) && !BLACK_LIST.includes(O.metadata.name);
      });
    },

    rows() {
      return [...this.haversterSettings, ...this.clusterNetwork];
    },

    isRancher() {
      return this.$store.getters['auth/isRancher'];
    }
  },
};
</script>

<template>
  <ResourceTable
    v-bind="$attrs"
    :schema="schema"
    :headers="headers"
    :rows="rows"
    key-field="_key"
    v-on="$listeners"
  />
</template>
