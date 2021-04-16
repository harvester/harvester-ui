import { HARVESTER_USER } from '@/config/types';

export default {
  _availableActions() {
    const out = this._standardActions;

    return out;
  },

  state() {
    return 'active';
  },

  doneOverride() {
    return () => {
      this.currentRouter().replace({
        name:   'c-cluster-product-resource',
        params: { resource: HARVESTER_USER }
      });
    };
  }
};
