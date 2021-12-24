export default {
  message() {
    return this.getStatusConditionOfType('Ready')?.message;
  },

  isReady() {
    return this.getStatusConditionOfType('Ready')?.status === 'True';
  },

  physicalNics() {
    return this?.status?.physicalNICs || [];
  },

  attachNodeName() {
    return this.getLabelValue('network.harvesterhci.io/nodename');
  },

  linkMessage() {
    return {
      name:    this.attachNodeName,
      message: this.message,
      to:      `node/${ this.attachNodeName }?mode=edit`
    };
  },

  doneOverride() {
    return () => {
      this.currentRouter().replace({
        name:   'c-cluster-product-resource',
        params: { resource: 'host' }
      });
    };
  },
};
