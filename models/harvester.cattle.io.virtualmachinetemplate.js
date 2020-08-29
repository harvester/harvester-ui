import _ from 'lodash';
import { VM } from '@/config/types';
import { MODE, _ADD, _EDIT } from '@/config/query-params';

export default {
  availableActions() {
    const out = this._standardActions;

    return [
      {
        action:     'createFromTemplate',
        enabled:    true,
        icon:       'icon icon-fw icon-spinner',
        label:      'Create a virtual Machine',
      },
      {
        action:     'addVersion',
        enabled:    true,
        icon:       'icon icon-fw icon-spinner',
        label:      'Add templateVersion',
      },
      ...out
    ];
  },

  createFromTemplate() {
    return () => {
      const router = this.currentRouter();

      router.push({
        name:   `c-cluster-product-resource-create`,
        params: { resource: VM },
        query:  { template: this.spec.defaultVersionId }
      });
    };
  },

  addVersion() {
    return (moreQuery = {}) => {
      const location = this.detailLocation;

      location.query = {
        ...location.query,
        [MODE]: _EDIT,
        type:   _ADD,
        ...moreQuery
      };

      this.currentRouter().push(location);
    };
  }
};
