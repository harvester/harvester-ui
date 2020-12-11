import { findBy } from '@/utils/array';

export default {
  _availableActions() {
    const out = this._standardActions;

    const toFilter = ['goToClone', 'promptRemove'];

    const actions = out.map((O) => {
      const enabled = toFilter.includes(O.action) ? false : O.enabled;
      const bulkable = toFilter.includes(O.action) ? false : O?.bulkable;

      return {
        ...O,
        enabled,
        bulkable
      };
    });

    return actions;
  },

  configuredCondition() {
    return findBy((this?.status?.conditions || []), 'type', 'configured') || {};
  },
  valueOrDefaultValue() {
    return this.value || this.default;
  }
};
