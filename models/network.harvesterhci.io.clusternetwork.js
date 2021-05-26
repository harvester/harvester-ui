export default {
  availableActions() {
    let out = this._standardActions;
    const toFilter = ['goToClone', 'cloneYaml', 'goToViewYaml', 'goToViewConfig', 'promptRemove', 'goToEditYaml', 'download'];

    out = out.filter((action) => {
      if (!toFilter.includes(action.action)) {
        return action;
      }
    });

    return out;
  },

  // vlan
  canUseVlan() {
    return this.isVlanOpen && this.defaultPhysicalNic.length > 0;
  },

  isVlanOpen() {
    return !!this.enable;
  },

  defaultPhysicalNic() {
    return this?.config?.defaultPhysicalNIC;
  },

  displayValue() { // Select the field you want to display
    if (this.enable) {
      return this?.config?.defaultPhysicalNIC || '';
    }
  },

  formatValue() {
    return this.enable && this?.config?.defaultPhysicalNIC;
  },

  customized() {
    // const setting = HCI_ALLOWED_SETTINGS[this.id];
    // const readonly = !!setting.readOnly;

    // return !readonly && this.value && this.value !== this.default;
    return false;
  },

};
