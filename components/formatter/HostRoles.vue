<script>
import { NODE_ROLES } from '@/config/labels-annotations.js';

export default {
  props: {
    value: {
      type:    Object,
      default: () => {}
    }
  },

  data() {
    return { dialogVisible: false };
  },

  computed: {
    isWorker() {
      const { WORKER: worker } = NODE_ROLES;

      return `${ this.value[worker] }` === 'true';
    },

    isControlPlane() {
      const { CONTROL_PLANE: controlPlane } = NODE_ROLES;

      return `${ this.value[controlPlane] }` === 'true';
    },

    isEtcd() {
      const { ETCD: etcd } = NODE_ROLES;

      return `${ this.value[etcd] }` === 'true';
    },

    isK3sMaster() {
      return this.value['node-role.kubernetes.io/master'] === 'true';
    },

    hostType() {
      const management = this.t('node.detail.type.management');
      const compute = this.t('node.detail.type.compute');
      const all = 'All';
      const isWorker = this.isWorker;
      const isControlPlane = this.isControlPlane;
      const isEtcd = this.isEtcd;
      const isK3sMaster = this.isK3sMaster;

      if (!isWorker && !isControlPlane && !isEtcd && isK3sMaster) {
        return management;
      }

      if (isWorker && isControlPlane && isEtcd) {
        return all;
      }

      if (isControlPlane || isEtcd) {
        return management;
      }

      if (isWorker) {
        return compute;
      }

      return compute;
    }
  },

  methods: {}
};
</script>

<template>
  <div>
    {{ hostType }}
  </div>
</template>
