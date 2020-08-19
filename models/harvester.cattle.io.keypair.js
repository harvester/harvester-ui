import _ from 'lodash';
import { VM } from '@/config/types';

export default {
  stateDisplay() {
    const status = this.getStatusConditionOfType('validated')?.status;

    return status === 'True' ? 'Validated' : 'Not Validated';
  },

  stateBackground() {
    return this.stateColor(this.stateDisplay).replace('text-', 'bg-');
  },
};
