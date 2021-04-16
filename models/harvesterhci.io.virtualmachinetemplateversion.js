import _ from 'lodash';
import { VM_TEMPLATE, VM } from '@/config/types';
import {
  AS, MODE, _CREATE, _VIEW, _CONFIG
} from '@/config/query-params';

export default {
  availableActions() {
    let out = this._standardActions;
    const toFilter = ['goToClone', 'cloneYaml', 'goToViewConfig', 'goToEditYaml', 'goToViewYaml'];

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
        label:      this.t('action.launchFormTemplate'),
      },
      {
        action:     'cloneTemplate',
        enabled:    true,
        icon:       'icon icon-fw icon-edit',
        label:      this.t('action.modifyTemplate'),
      },
      {
        action:     'setDefaultVersion',
        enabled:    true,
        icon:       'icon icon-fw icon-checkmark',
        label:      this.t('action.setDefaultVersion'),
      },
      {
        action:  'goToViewConfig',
        label:   this.t('action.view'),
        icon:    'icon icon-edit',
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

  goToViewConfig() {
    return (moreQuery = {}) => {
      const location = this.detailLocation;

      location.query = {
        ...location.query,
        [MODE]:     _VIEW,
        [AS]:       _CONFIG,
        templateId: this.spec.templateId,
        ...moreQuery
      };

      this.currentRouter().push(location);
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
        translationKey: 'harvester.fields.cpu',
      },
      {
        nullable:       false,
        path:           'spec.vm.template.spec.domain.resources.requests.memory',
        required:       false,
        translationKey: 'harvester.fields.memory',
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
        validators:     ['vmDisks:isVMTemplate'],
      },
    ];

    return rules;
  },
};
