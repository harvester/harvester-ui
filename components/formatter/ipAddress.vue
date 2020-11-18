<script>
import _ from 'lodash';
import { HARVESTER_NETWORK_IPS, HARVESTER_NETWORK_STATUS } from '@/config/labels-annotations';
import { VMI, POD } from '@/config/types';
import CopyToClipboardText from '@/components/CopyToClipboardText';

export default {
  components: { CopyToClipboardText },
  props:      {
    value: {
      type:     String,
      default: ''
    },
    row: {
      type:     Object,
      required: true
    },
    col: {
      type:     Object,
      default: () => {}
    },
    isList: {
      type:    Boolean,
      default: false
    }
  },

  computed: {
    ip() {
      const s = new Set([...this.vmiIp, ...this.podIp, ...this.networkAnnotationIP]);

      return _.compact([...s]);
    },

    networkAnnotationIP() {
      if (this.row.actualState !== 'Running') { // TODO: Running
        return [];
      }

      const annotationIp = this.row.getAnnotationValue(HARVESTER_NETWORK_IPS) || '[]';

      const out = JSON.parse(annotationIp);

      return out.map( (O) => {
        return O.replace(/\/[\d\D]*/, '');
      });
    },

    podIp() {
      const vmiResources = this.$store.getters['cluster/all'](VMI);
      const podResources = this.$store.getters['cluster/all'](POD);

      const ips = new Set();
      let networkStatus = '[]';
      let podResource = null;

      const resource = vmiResources.find(VMI => VMI.id === this.value) || null;

      if (resource) {
        podResource = podResources.find( (P) => {
          return resource?.metadata?.name === P.metadata?.ownerReferences?.[0].name;
        });

        networkStatus = podResource?.getAnnotationValue(HARVESTER_NETWORK_STATUS);
      }

      try {
        if (networkStatus) {
          const obj = JSON.parse(networkStatus);

          obj.map( (O) => {
            ips.add(...O.ips);
          });
        }
      } catch (err) {

      }

      return [...ips];
    },

    vmiIp() {
      const vmiResources = this.$store.getters['cluster/all'](VMI);
      const resource = vmiResources.find(VMI => VMI.id === this.value) || null;
      const out = resource?.status?.interfaces?.[0]?.ipAddress || '';

      return [out];
    }
  },
};
</script>

<template>
  <div v-if="isList">
    <p v-for="(ipValue, index) in ip" :key="ipValue">
      {{ index+1 }}. <CopyToClipboardText :text="ipValue" />
    </p>
  </div>
  <div v-else>
    <span v-for="(ipValue, index) in ip" :key="index">
      <CopyToClipboardText :text="ipValue" /> <span v-if="index !== ip.length-1">, </span>
    </span>
  </div>
</template>
