import _ from 'lodash';
import { VM } from '@/config/types';

export default {
  stateDisplay() {
    const boundCondition = this.getStatusConditionOfType('Bound');
    const readyCondition = this.getStatusConditionOfType('Ready');

    if (boundCondition?.status === 'True') {
      return 'In-use';
    } else if (readyCondition?.status === 'True' && boundCondition?.status === 'False') {
      return 'Available';
    } else {
      return 'N/A';
    }
  },

  stateBackground() {
    return this.stateColor(this.stateDisplay).replace('text-', 'bg-');
  },

  statusDisplay() {
    const readyCondition = this?.getStatusConditionOfType('Ready');

    return readyCondition?.status === 'True' ? 'Ready' : 'NoReady';
  }
};
