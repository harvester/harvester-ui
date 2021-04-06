export default {
  _availableActions() {
    let out = this._standardActions;
    const toFilter = ['goToClone', 'cloneYaml', 'goToViewConfig', 'goToEditYaml', 'goToEdit', 'download'];

    out = out.filter((action) => {
      if (!toFilter.includes(action.action)) {
        return action;
      }
    });

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

  customValidationRules() {
    const rules = [
      {
        nullable:       false,
        path:           'metadata.name',
        required:       true,
        minLength:      1,
        maxLength:      63,
        translationKey: 'harvester.fields.name'
      },
    ];

    return rules;
  },
};
