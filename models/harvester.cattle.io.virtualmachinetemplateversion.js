import _ from 'lodash';
import { VM_TEMPLATE, VM } from '@/config/types';
import { MODE, _CREATE } from '@/config/query-params';

export default {
  availableActions() {
    let out = this._standardActions;
    const toFilter = ['goToClone', 'cloneYaml', 'goToEditYaml', 'goToViewYaml'];

    out = out.filter((action) => {
      if (!toFilter.includes(action.action)) {
        return action;
      }
    });

    return [
      {
        action:     'launchFromTemplate',
        enabled:    true,
        icon:       'icons icon-h-display',
        label:      'Launch instance from template',
      },
      {
        action:     'cloneTemplate',
        enabled:    true,
        icon:       'icon icon-fw icon-edit',
        label:      'Modify template (Create new version)',
      },
      {
        action:     'setDefaultVersion',
        enabled:    true,
        icon:       'icon icon-fw icon-checkmark',
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
      const router = this.currentRouter();

      router.push({
        name:   `c-cluster-product-resource-create`,
        params: { resource: VM_TEMPLATE.version },
        query:  {
          [MODE]:     _CREATE,
          templateId: this.spec.templateId,
          versionId:  this.id,
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
        path:           'spec.vm.template.spec.domain.cpu.cores',
        min:            1,
        max:            100,
        required:       true,
        translationKey: 'vm.fields.cpu',
      },
      {
        nullable:       false,
        path:           'spec.vm.template.spec.domain.resources.requests.memory',
        required:       false,
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
