import { findBy } from '@/utils/array';

const hasFormName = ['network-setting']; // It has the function of editing form

export default {
  _availableActions() {
    let out = this._standardActions;

    if (!hasFormName.includes(this.metadata.name)) {
      const toFilter = ['goToEdit', 'goToClone', 'promptRemove'];

      out = out.filter((action) => {
        if (!toFilter.includes(action.action)) {
          return action;
        }
      });
    }

    return out;
  },

  configuredCondition() {
    return findBy((this?.status?.conditions || []), 'type', 'configured') || {};
  }
};
