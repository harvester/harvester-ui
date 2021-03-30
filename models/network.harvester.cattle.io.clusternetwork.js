import { ACTION_VIEW } from '@/config/constant';

export default {
  availableActions() {
    let out = this._standardActions;
    const toFilter = ACTION_VIEW;

    out = out.filter((action) => {
      if (!toFilter.includes(action.action)) {
        return action;
      }
    });

    return out;
  },

  isOpenVlan() {
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
};
