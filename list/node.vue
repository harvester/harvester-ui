<script>
import ResourceTable from '@/components/ResourceTable';
import Poller from '@/utils/poller';
import { STATE, NAME, AGE } from '@/config/table-headers';
import { METRIC } from '@/config/types';
import BadgeState from '@/components/BadgeState';
import MaintenanceState from '@/components/formatter/MaintenanceState';

const METRICS_POLL_RATE_MS = 30000;
const MAX_FAILURES = 2;

const HOST_IP = {
  name:      'host-ip',
  labelKey:  'tableHeaders.hostIp',
  search:    ['internalIp'],
  value:     'internalIp',
  formatter: 'HostIp'
};

export default {
  name:       'ListNode',
  components: {
    ResourceTable, BadgeState, MaintenanceState
  },

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
    return { metricPoller: new Poller(this.loadMetrics, METRICS_POLL_RATE_MS, MAX_FAILURES) };
  },

  computed: {
    headers() {
      return [{ ...STATE, width: 250 },
        NAME, HOST_IP, AGE];
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
  <ResourceTable
    v-bind="$attrs"
    :schema="schema"
    :headers="headers"
    :rows="[...rows]"
    key-field="_key"
    v-on="$listeners"
  >
    <template slot="cell:state" slot-scope="scope" class="state-col">
      <div class="state">
        <BadgeState :value="scope.row" />
        <MaintenanceState class="m-state" :row="scope.row" />
      </div>
    </template>
  </ResourceTable>
</template>

<style lang="scss" scoped>
.state {
  display: flex;

  .m-state {
    margin-left: 6px;
  }
}
</style>
