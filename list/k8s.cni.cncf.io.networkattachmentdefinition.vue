<script>
import Banner from '@/components/Banner';
import Loading from '@/components/Loading';
import SortableTable from '@/components/SortableTable';

import { NAME, NETWORK_TYPE, NETWORK_VLAN, AGE } from '@/config/table-headers';
import { HARVESTER_CLUSTER_NETWORK, NETWORK_ATTACHMENT, HARVESTER_NODE_NETWORK, NODE } from '@/config/types';

import { findBy } from '@/utils/array';
import { allSettled } from '@/utils/promise';

export default {
  name:       'LNetworks',
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
    const hash = await allSettled({
      clusterNetworkSetting:  this.$store.dispatch('cluster/findAll', { type: HARVESTER_CLUSTER_NETWORK }),
      hostNetworks:           this.$store.dispatch('cluster/findAll', { type: HARVESTER_NODE_NETWORK }),
      hosts:                  this.$store.dispatch('cluster/findAll', { type: NODE }),
      rows:                   this.$store.dispatch('cluster/findAll', { type: NETWORK_ATTACHMENT, opt: { url: 'k8s.cni.cncf.io.network-attachment-definitions' } }),
    });

    this.rows = hash.rows;
    this.hosts = hash.hosts;
    this.hostNetworks = hash.hostNetworks;
    this.clusterNetworkSetting = hash.clusterNetworkSetting;
  },

  data() {
    return {
      hash:                  {},
      rows:                  [],
      hosts:                 [],
      hostNetworks:          [],
      clusterNetworkSetting: [],
    };
  },

  computed: {
    headers() {
      return [
        NAME,
        NETWORK_TYPE,
        NETWORK_VLAN,
        AGE
      ];
    },

    isVlanDisable() {
      const vlan = findBy((this.clusterNetworkSetting || []), 'metadata.name', 'vlan') || {};

      return !vlan.canUseVlan;
    },

    abnormalNetwork() {
      const notReadyCrd = this.hostNetworks.filter( O => !O.isReady);

      return notReadyCrd.map( O => O.linkMessage);
    },

    disableCreate() {
      const hostsLength = this.hosts.length;
      const abnormalNetworkLength = this.abnormalNetwork.length;

      return this.isVlanDisable || !(hostsLength - abnormalNetworkLength);
    }
  },

  watch: {
    disableCreate: {
      handler(neu) {
        const type = this.$route.params.resource;

        this.$store.commit('cluster/setConfig', {
          type,
          data: { disableCreateButton: neu }
        });
      },
      immediate: true
    }
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <template v-if="isVlanDisable">
      <Banner color="error">
        <div>
          {{ t('harvester.networkPage.message.premise.prefix') }}
          <nuxt-link to="network.harvester.cattle.io.clusternetwork/harvester-system/vlan?mode=edit">
            {{ t('harvester.networkPage.message.premise.middle') }}
          </nuxt-link>
          {{ t('harvester.networkPage.message.premise.suffic') }}
        </div>
      </Banner>
    </template>

    <template v-if="abnormalNetwork.length">
      <Banner
        v-for="item in abnormalNetwork"
        :key="item.name"
        color="error"
      >
        <nuxt-link :to="item.to">
          {{ item.name }}:
        </nuxt-link>
        {{ item.message }}
      </Banner>
    </template>

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
