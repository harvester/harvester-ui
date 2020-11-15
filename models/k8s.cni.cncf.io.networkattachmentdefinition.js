export default {
  _availableActions() {
    const out = this._standardActions;

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
  }
};
