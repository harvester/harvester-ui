import { HARVESTER_CLUSTER_NETWORK } from '@/config/types';

export default {
  _availableActions() {
    const out = this._standardActions;

    return out;
  },

  isIpamStatic() {
    let config = '';

    try {
      config = JSON.parse(this.spec.config);
    } catch (err) {
      return false;
    }

    return config?.ipam?.type === 'static';
  },

  state() {
    const clusterNetwork = this.$rootGetters['cluster/all'](HARVESTER_CLUSTER_NETWORK)[0] || {};

    return (clusterNetwork?.defaultPhysicalNic && clusterNetwork.enable) ? 'active' : 'inactive';
  }
};
