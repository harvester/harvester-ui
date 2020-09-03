import _ from 'lodash';
import { VM_TEMPLATE, VM } from '@/config/types';
import { MODE, _ADD, _CLONE, _EDIT } from '@/config/query-params';

export default {
  availableActions() {
    const out = this._standardActions;

    return [
      {
        action:     'launchFromTemplate',
        enabled:    true,
        icon:       'icon icon-fw icon-spinner',
        label:      'Launch instance from template',
      },
      {
        action:     'cloneTemplate',
        enabled:    true,
        icon:       'icon icon-fw icon-spinner',
        label:      'Modify template (Create new version)',
      },
      {
        action:     'setDefaultVersion',
        enabled:    true,
        icon:       'icon icon-fw icon-spinner',
        label:      'Set default version',
      },
      ...out
    ];
  },

  templates() {
    return this.$rootGetters['cluster/all'](VM_TEMPLATE.template);
  },

  launchFromTemplate() {
    return () => {
      const templateResource = this.currentTemplate;
      const templateId = templateResource.id;
      const launchVersion = this.id.replace('/', ':');
      const router = this.currentRouter();

      router.push({
        name:   `c-cluster-product-resource-create`,
        params: { resource: VM },
        query:  { templateId, version: launchVersion }
      });
    };
  },

  cloneTemplate() {
    return (moreQuery = {}) => {
      const templateResource = this.currentTemplate;
      const launchVersion = this.id.replace('/', ':');
      const id = templateResource.id.replace(/.*\//, '');
      const schema = this.$getters['schemaFor'](this.type);
      const router = templateResource.currentRouter();

      router.push({
        name:   `c-cluster-product-resource${ schema?.attributes?.namespaced ? '-namespace' : '' }-id`,
        params: {
          resource:  VM_TEMPLATE.template,
          namespace: this.metadata?.namespace,
          id,
        },
        query:  {
          version: launchVersion,
          [MODE]:   _EDIT,
          type:     _ADD,
        }
      });
    };
  },

  currentTemplate() {
    return _.find(this.templates, T => T.id === this.spec.templateId.replace(':', '/'));
  },

  setDefaultVersion() {
    return async(moreQuery = {}) => {
      const templateResource = this.currentTemplate;

      templateResource.spec.defaultVersionId = this.id.replace('/', ':');
      await templateResource.save();
    };
  }
};
