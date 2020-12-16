<script>
import { STATE, NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
import Banner from '@/components/Banner';
import Loading from '@/components/Loading';
import { HARVESTER_SETTING, NETWORK_ATTACHMENT } from '@/config/types';
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
      setting: this.$store.dispatch('cluster/findAll', { type: HARVESTER_SETTING }),
      rows:    this.$store.dispatch('cluster/findAll', { type: NETWORK_ATTACHMENT, opt: { url: 'k8s.cni.cncf.io.network-attachment-definitions' } }),
    });

    this.rows = hash.rows;
    this.setting = hash.setting;
  },

  data() {
    return {
      setting: [],
      rows:    [],
      hash:    {}
    };
  },

  computed: {
    headers() {
      return [
        { ...STATE },
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
    configuredStatus() {
      const network = findBy((this.setting || []), 'metadata.name', 'network-setting');

      return network?.getConditionStatus('configured') === 'True';
    },
    statusText() {
      const network = findBy((this.setting || []), 'metadata.name', 'network-setting');

      return network?.configuredCondition?.reason;
    },
    isAbnormal() {
      const network = findBy((this.setting || []), 'metadata.name', 'network-setting');

      return network?.configuredCondition?.status !== 'True';
    }
  },

  watch: {
    configuredStatus: {
      handler(neu) {
        const type = this.$route.params.resource;

        this.$store.commit('cluster/setConfig', {
          type,
          data: { disableCreateButton: !neu }
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
    <div v-if="isAbnormal">
      <Banner
        color="error"
      >
        <div v-if="!statusText">
          {{ t('harvester.networkPage.message.premise.prefix') }}
          <nuxt-link to="harvester.cattle.io.setting/network-setting?mode=edit">
            {{ t('harvester.networkPage.message.premise.middle') }}
          </nuxt-link>
          {{ t('harvester.networkPage.message.premise.suffic') }}
        </div>

        <div v-else>
          {{ t('harvester.networkPage.message.errorTip.prefix') }}
          <nuxt-link to="harvester.cattle.io.setting/network-setting?mode=edit">
            {{ t('harvester.networkPage.message.errorTip.middle') }}
          </nuxt-link> {{ t('harvester.networkPage.message.errorTip.suffic') }} {{ statusText }}
        </div>
      </Banner>
    </div>
    <SortableTable
      v-bind="$attrs"
      :headers="headers"
      default-sort-by="age"
      :rows="rows"
      key-field="_key"
      v-on="$listeners"
    >
    </sortabletable>
  </div>
</template>
