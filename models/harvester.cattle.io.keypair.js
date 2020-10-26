import { colorForState } from '@/plugins/steve/resource-instance';

export default {
  stateDisplay() {
    const status = this.getStatusConditionOfType('validated')?.status;

    return status === 'True' ? 'Validated' : 'Not Validated';
  },

  stateBackground() {
    // return this.stateColor(this.stateDisplay).replace('text-', 'bg-');
    return colorForState(this.stateDisplay);
  },
};
