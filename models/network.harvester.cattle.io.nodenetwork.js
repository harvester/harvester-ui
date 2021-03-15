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
    return this.getLabelValue('network.harvester.cattle.io/nodename');
  }
};
