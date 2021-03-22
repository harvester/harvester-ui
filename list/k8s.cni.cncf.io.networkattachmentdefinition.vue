<script>
import { NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
import Banner from '@/components/Banner';
import Loading from '@/components/Loading';
import { HARVESTER_CLUSTER_NETWORK, NETWORK_ATTACHMENT, HARVESTER_NODE_NETWORK } from '@/config/types';
import { allHash } from '@/utils/promise';
import { findBy } from '@/utils/array';

export default {
  name:       'ListNetwork',
  components: {
    SortableTable, Banner, Loading
  },

  props: {
    schema: {
      type:     Object,
      required: true,
    }
  },

  async fetch() {
    const hash = await allHash({
      clusterNetworkSetting:      this.$store.dispatch('cluster/findAll', { type: HARVESTER_CLUSTER_NETWORK }),
      hostNetworks:          this.$store.dispatch('cluster/findAll', { type: HARVESTER_NODE_NETWORK }),
      rows:                  this.$store.dispatch('cluster/findAll', { type: NETWORK_ATTACHMENT, opt: { url: 'k8s.cni.cncf.io.network-attachment-definitions' } }),
    });

    this.rows = hash.rows;
    this.clusterNetworkSetting = hash.clusterNetworkSetting;
    this.hostNetworks = hash.hostNetworks;
  },

  data() {
    return {
      clusterNetworkSetting:      [],
      rows:                  [],
      hash:                  {},
      hostNetworks:          [],
    };
  },

  computed: {
    headers() {
      return [
        { ...NAME },
        {
          name:      'type',
          value:     'spec.config',
          sort:      'spec.config',
          type:       'type',
          formatter: 'ParseNetworkConfig',
          labelKey:  'tableHeaders.network.type'
        },
        {
          name:      'vlan',
          value:     'spec.config',
          sort:      'spec.config',
          type:       'vlan',
          formatter:  'ParseNetworkConfig',
          labelKey:  'tableHeaders.network.vlan'
        }
      ];
    },

    isAbnormal() {
      const network = findBy((this.clusterNetworkSetting || []), 'metadata.name', 'vlan');

      return !(network?.isOpenVlan && network?.defaultPhysicalNic.length > 0);
    },

    hostNetworkReady() {
      const notReadyCrd = this.hostNetworks.filter( (O) => {
        return !O.isReady;
      });

      return notReadyCrd.map( (O) => {
        return {
          name:    O.attachNodeName,
          message: O.message,
          to:      `node/${ O.attachNodeName }?mode=edit`
        };
      });
    }
  },

  watch: {
    isAbnormal: {
      handler(neu) {
        const type = this.$route.params.resource;

        this.$store.commit('cluster/setConfig', {
          type,
          data: { disableCreateButton: neu }
        });
      },
      immediate: true
    },

    hostNetworkReady: {
      handler(neu) {
        const type = this.$route.params.resource;

        if ((neu.length === this.hostNetworks.length) && this.hostNetworks !== 0) {
          this.$store.commit('cluster/setConfig', {
            type,
            data: { disableCreateButton: true }
          });
        }
      },
      immediate: true
    }
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <div v-if="isAbnormal">
      <Banner
        color="error"
      >
        <div>
          {{ t('harvester.networkPage.message.premise.prefix') }}
          <nuxt-link to="network.harvester.cattle.io.clusternetwork/harvester-system/vlan?mode=edit">
            {{ t('harvester.networkPage.message.premise.middle') }}
          </nuxt-link>
          {{ t('harvester.networkPage.message.premise.suffic') }}
        </div>
      </Banner>
    </div>

    <div v-if="hostNetworkReady.length">
      <Banner
        v-for="item in hostNetworkReady"
        :key="item.name"
        color="error"
      >
        <nuxt-link :to="item.to">
          {{ item.name }}
        </nuxt-link>
        {{ item.message }}
      </Banner>
    </div>

    <SortableTable
      v-bind="$attrs"
      :headers="headers"
      default-sort-by="age"
      :rows="rows"
      key-field="_key"
      v-on="$listeners"
    />
  </div>
</template>
