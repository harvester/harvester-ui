import { colorForState } from '@/plugins/steve/resource-instance';

export default {
  stateDisplay() {
    const ownedBy = this?.metadata?.annotations?.['harvester.cattle.io/owned-by'];

    if (ownedBy) {
      return 'In-use';
    } else {
      return 'Ready';
    }
  },

  stateBackground() {
    return colorForState(this.stateDisplay).replace('text-', 'bg-');
  },

  statusDisplay() {
    const readyCondition = this?.getStatusConditionOfType('Ready');

    return readyCondition?.status === 'True' ? 'Ready' : 'NoReady';
  },

  phaseStatus() {
    return this?.status?.phase || 'N/A';
  }
};
