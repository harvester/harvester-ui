<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import { METRIC, VM, NODE, VMI } from '@/config/types';
import { HOSTNAME } from '@/config/labels-annotations';
import { defaultAsyncData } from '@/components/ResourceDetail';
import { allHash } from '@/utils/promise';
import Basic from './basic';
import Instance from './instance';
// import Monitor from './monitor';

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
    const hash = {
      metricNodes: this.$store.dispatch('management/findAll', { type: METRIC.NODE }),
      nodes:       this.$store.dispatch('management/findAll', { type: NODE }),
      vms:         this.$store.dispatch('management/findAll', { type: VM }),
    };

    const res = await allHash(hash);
    const instanceMap = {};

    this.metrics = res.metricNodes.find((item) => {
      return item.uid === this.value.uid;
    });

    (this.$store.getters['cluster/all'](VMI) || []).forEach((vmi) => {
      const vmiUID = vmi?.metadata?.ownerReferences?.[0]?.uid;

      if (vmiUID) {
        instanceMap[vmiUID] = vmi;
      }
    });

    this.rows = res.vms.filter((row) => {
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
      metrics:      null,
      mode:         'view',
      rows:          []
    };
  },

  methods: {
    mapToStatus(isOk) {
      return isOk ? 'success' : 'error';
    },
  }
};
</script>

<template>
  <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
    <Tab name="basic" :label="t('vm.detail.tabs.hostBasic')" :weight="3" class="bordered-table">
      <Basic v-model="value" :metrics="metrics" :mode="mode" />
    </Tab>
    <Tab name="instance" :label="t('vm.detail.tabs.instance')" :weight="2" class="bordered-table">
      <Instance :rows="rows" />
    </Tab>
    <!-- <Tab name="monitor" :label="t('vm.detail.tabs.monitor')" :weight="1" class="bordered-table">
      <Monitor v-model="value" />
    </Tab> -->
  </Tabbed>
</template>
