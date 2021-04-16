import { colorForState } from '@/plugins/steve/resource-instance';

export default {
  stateDisplay() {
    const status = this.getStatusConditionOfType('validated')?.status;

    return status === 'True' ? 'Validated' : 'Not Validated';
  },

  stateBackground() {
    return colorForState(this.stateDisplay).replace('text-', 'bg-');
  },
};
