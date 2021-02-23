import { colorForState } from '@/plugins/steve/resource-instance';
import { getPrefix } from '@/utils/url';

const PAUSED = 'Paused';
const PAUSED_VM_MODAL_MESSAGE = 'This VM has been paused. If you wish to unpause it, please click the Unpause button below. For further details, please check with your system administrator.';
const VMIPhase = {
  Pending:    'Pending',
  Scheduling: 'Scheduling',
  Scheduled:  'Scheduled',
  Running:    'Running',
  Succeeded:  'Succeeded',
  Failed:     'Failed',
  Unknown:    'Unknown',
};

export default {
  migrationState() {
    if (this.status?.migrationState?.abortStatus === 'Succeeded') {
      return {
        type:   'abortMigration',
        status: 'aborted'
      };
    }

    if (this.status?.migrationState?.failed) {
      return {
        type:   'migration',
        status: 'failed'
      };
    }

    if (this.status?.migrationState?.completed === true) {
      return {
        type:   'migration',
        status: 'success'
      };
    }

    if (this.status?.migrationState && this.status?.migrationState?.abortStatus === undefined) {
      return {
        type:   'migration',
        status: 'migrating'
      };
    }

    if (this.status?.migrationState && this.status?.migrationState?.abortStatus) {
      return {
        type:   'abortMigration',
        status: this.status?.migrationState?.abortStatus
      };
    }
  },

  migrationStateBackground() {
    const state = this.migrationState.status;

    return colorForState(state).replace('text-', 'bg-');
  },

  isPaused() {
    const conditions = this?.status?.conditions || [];
    const isPause = conditions.filter(cond => cond.type === PAUSED).length > 0;

    return isPause ? {
      status:  PAUSED,
      message: PAUSED_VM_MODAL_MESSAGE
    } : null;
  },

  isRunning() {
    if (this.getStatusPhase === VMIPhase.Running) {
      return { status: VMIPhase.Running };
    }

    return null;
  },

  getVMIApiPath() {
    const prefix = getPrefix();

    if (!prefix) {
      return `/apis/subresources.kubevirt.io/v1/namespaces/${ this.metadata.namespace }/virtualmachineinstances/${ this.name }/vnc`;
    } else {
      return `${ prefix }apis/subresources.kubevirt.io/v1/namespaces/${ this.metadata.namespace }/virtualmachineinstances/${ this.name }/vnc`;
    }
  },

  getSerialConsolePath() {
    return `/apis/subresources.kubevirt.io/v1/namespaces/${ this.metadata.namespace }/virtualmachineinstances/${ this.name }/console`;
  }
};
