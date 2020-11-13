<script>
import _ from 'lodash';
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
      const choices = this.$store.getters['cluster/all'](VMI);
      const podList = this.$store.getters['cluster/all'](POD);
      const ips = new Set();

      const resource = choices.find(VMI => VMI.id === this.value) || null;

      const podResource = podList.find( (P) => {
        return resource?.metadata?.name === P.metadata?.ownerReferences?.[0].name;
      });

      const networkStatus = podResource?.getAnnotationValue('k8s.v1.cni.cncf.io/network-status');

      try {
        if (networkStatus) {
          const obj = JSON.parse(networkStatus);

          obj.map( (O) => {
            ips.add(...O.ips);
          });
        }
      } catch (err) {

      }
      ips.add(resource?.status?.interfaces?.[0]?.ipAddress);

      return _.compact([...ips]).join(',  ');
    },
    ipList() {
      return (this.ip && this.ip.split(', ')) || [];
    }
  },
};
</script>

<template>
  <div v-if="isList">
    <p v-for="(ipValue, index) in ipList" :key="ipValue">
      {{ index+1 }}. <CopyToClipboardText :text="ipValue" />
    </p>
  </div>
  <div v-else>
    <CopyToClipboardText v-if="ip" :text="ip" />
  </div>
</template>
