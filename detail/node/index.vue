<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import Poller from '@/utils/poller';
import { METRIC, VM, NODE, VMI } from '@/config/types';
import { HOSTNAME } from '@/config/labels-annotations';
import { defaultAsyncData } from '@/components/ResourceDetail';
import Basic from './basic';
import Instance from './instance';
// import Monitor from './monitor';

const METRICS_POLL_RATE_MS = 30000;
const MAX_FAILURES = 2;

export default {
  name: 'DetailNode',

  components: {
    Tabbed,
    Tab,
    Basic,
    Instance,
    // Monitor
  },

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const rows = await this.$store.dispatch('cluster/findAll', { type: VM });
    const instanceMap = {};

    (this.$store.getters['cluster/all'](VMI) || []).forEach((vmi) => {
      const vmiUID = vmi?.metadata?.ownerReferences?.[0]?.uid;

      if (vmiUID) {
        instanceMap[vmiUID] = vmi;
      }
    });

    this.rows = rows.filter((row) => {
      return instanceMap[row.metadata?.uid]?.status?.nodeName === this.value?.metadata?.labels?.[HOSTNAME];
    });
  },

  asyncData(ctx) {
    let resource;
    let parentOverride;

    if ( ctx.params.resource === 'node') {
      parentOverride = {
        displayName: 'Host',
        location:    {
          name:    'c-cluster-product-resource',
          params:  { resource: 'node' },
        }
      };
      resource = NODE;
    }

    return defaultAsyncData(ctx, resource, parentOverride);
  },

  data() {
    return {
      metricPoller: new Poller(this.loadMetrics, METRICS_POLL_RATE_MS, MAX_FAILURES),
      metrics:      { cpu: 0, memory: 0 },
      mode:         'view',
      rows:          []
    };
  },

  mounted() {
    this.metricPoller.start();
  },

  beforeDestroy() {
    this.metricPoller.stop();
  },

  methods: {
    mapToStatus(isOk) {
      return isOk ? 'success' : 'error';
    },

    async loadMetrics() {
      const schema = this.$store.getters['cluster/schemaFor'](METRIC.NODE);

      if (schema) {
        await this.$store.dispatch('cluster/find', {
          type: METRIC.NODE,
          id:   this.value.id,
          opt:  { force: true }
        });

        this.$forceUpdate();
      }
    }
  }
};
</script>

<template>
  <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
    <Tab name="basic" :label="t('vm.detail.tabs.hostBasic')" :weight="3" class="bordered-table">
      <Basic v-model="value" :mode="mode" />
    </Tab>
    <Tab name="instance" :label="t('vm.detail.tabs.instance')" :weight="2" class="bordered-table">
      <Instance :rows="rows" />
    </Tab>
    <!-- <Tab name="monitor" :label="t('vm.detail.tabs.monitor')" :weight="1" class="bordered-table">
      <Monitor v-model="value" />
    </Tab> -->
  </Tabbed>
</template>
