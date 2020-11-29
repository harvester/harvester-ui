import _ from 'lodash';
import { VM_TEMPLATE, VM } from '@/config/types';
import { MODE, _ADD, _EDIT } from '@/config/query-params';

export default {
  availableActions() {
    let out = this._standardActions;
    const toFilter = ['cloneYaml', 'goToEditYaml', 'goToViewYaml'];

    out = out.filter((action) => {
      if (!toFilter.includes(action.action)) {
        return action;
      }
    });

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
      const launchVersion = this.id;
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
      const launchVersion = this.id;
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
    return _.find(this.templates, T => T.id === this.spec.templateId);
  },

  setDefaultVersion() {
    return async(moreQuery = {}) => {
      const templateResource = this.currentTemplate;

      templateResource.spec.defaultVersionId = this.id;
      await templateResource.save();
    };
  },

  defaultVersion() {
    const templates = this.$rootGetters['cluster/all'](VM_TEMPLATE.template);
    const template = templates.find(T => this.spec.templateId === T.id);

    return template?.status?.defaultVersion;
  },

  customValidationRules() {
    const rules = [
      {
        nullable:       false,
        path:           'metadata.name',
        required:       true,
        minLength:      1,
        maxLength:      63,
        translationKey: 'vm.fields.name'
      },
      {
        nullable:       false,
        path:           'spec.vm.template.spec.domain.cpu.cores',
        min:            1,
        max:            100,
        required:       true,
        translationKey: 'vm.fields.cpu',
      },
      {
        nullable:       false,
        path:           'spec.vm.template.spec.domain.resources.requests.memory',
        required:       true,
        translationKey: 'vm.fields.memory',
        validators:     ['vmMemoryUnit'],
      },
      {
        nullable:       false,
        path:           'spec.vm.template.spec',
        validators:     ['vmNetworks'],
      },
      {
        nullable:       false,
        path:           'spec.vm',
        validators:     ['vmDisks'],
      },
    ];

    return rules;
  },
};
