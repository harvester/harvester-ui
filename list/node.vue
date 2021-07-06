<script>
import ResourceTable from '@/components/ResourceTable';
import Poller from '@/utils/poller';
import { STATE, NAME, AGE } from '@/config/table-headers';
import { METRIC, NODE } from '@/config/types';
import { allSettled } from '@/utils/promise';

const METRICS_POLL_RATE_MS = 30000;
const MAX_FAILURES = 2;

const HOST_IP = {
  name:      'host-ip',
  labelKey:  'harvester.tableHeaders.hostIp',
  search:    ['internalIp'],
  value:     'internalIp',
  formatter: 'HostIp'
};

export default {
  name:       'ListNode',
  components: { ResourceTable },

  props: {
    schema: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const hash = await allSettled({
      metrics:  this.$store.dispatch('cluster/findAll', { type: METRIC.NODE }),
      nodes:   this.$store.dispatch('cluster/findAll', { type: NODE }),
    });

    this.rows = hash.nodes;
  },

  data() {
    return {
      rows:          [],
      metricPoller: new Poller(this.loadMetrics, METRICS_POLL_RATE_MS, MAX_FAILURES)
    };
  },

  computed: {
    headers() {
      return [
        STATE,
        NAME,
        HOST_IP,
        {
          name:          'cpu',
          labelKey:      'node.detail.glance.consumptionGauge.cpu',
          value:         'id',
          width:         230,
          formatter:     'CPUUsed',
        },
        {
          name:          'memory',
          labelKey:      'node.detail.glance.consumptionGauge.memory',
          value:         'id',
          width:         230,
          formatter:     'MemoryUsed',
        },
        {
          name:          'storage',
          labelKey:      'harvester.hostPage.detail.storage',
          value:         'id',
          width:         230,
          formatter:     'StorageUsed',
        },
        AGE,
      ];
    },
  },

  mounted() {
    this.metricPoller.start();
  },
  beforeDestroy() {
    this.metricPoller.stop();
  },

  methods: {
    async loadMetrics() {
      const schema = this.$store.getters['cluster/schemaFor'](METRIC.NODE);

      if (schema) {
        await this.$store.dispatch('cluster/findAll', {
          type: METRIC.NODE,
          opt:  { force: true }
        });
        this.$forceUpdate();
      }
    }
  },

};
</script>

<template>
  <div>
    <ResourceTable
      v-bind="$attrs"
      :schema="schema"
      :headers="headers"
      :rows="[...rows]"
      key-field="_key"
      v-on="$listeners"
    >
    </ResourceTable>
  </div>
</template>
