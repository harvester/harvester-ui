import _ from 'lodash';
import { VMI, POD } from '@/config/types';

const VMI_WAITING_MESSAGE =
  'The virtual machine is waiting for resources to become available.';
const VM_ERROR = 'VM error';
const STOPPING = 'Stopping';
const OFF = 'Off';
const WAITING = 'Waiting';

const PAUSED = 'Paused';
const PAUSED_VM_MODAL_MESSAGE = 'This VM has been paused. If you wish to unpause it, please click the Unpause button below. For further details, please check with your system administrator.';

const POD_STATUS_NOT_SCHEDULABLE = 'POD_NOT_SCHEDULABLE';
const POD_STATUS_CONTAINER_FAILING = 'POD_CONTAINER_FAILING';
const POD_STATUS_NOT_READY = 'POD_NOT_READY'; // eslint-disable-line

const POD_STATUS_FAILED = 'POD_FAILED';
const POD_STATUS_CRASHLOOP_BACKOFF = 'POD_CRASHLOOP_BACKOFF';
const POD_STATUS_UNKNOWN = 'POD_STATUS_UNKNOWN';

const POD_STATUS_ALL_ERROR = [
  POD_STATUS_NOT_SCHEDULABLE,
  POD_STATUS_CONTAINER_FAILING,
  POD_STATUS_FAILED,
  POD_STATUS_CRASHLOOP_BACKOFF,
  POD_STATUS_UNKNOWN,
];

const POD_STATUS_COMPLETED = 'POD_STATUS_COMPLETED';
const POD_STATUS_SUCCEEDED = 'POD_STATUS_SUCCEEDED';
const POD_STATUS_RUNNING = 'POD_STATUS_RUNNING';

const POD_STATUS_ALL_READY = [
  POD_STATUS_RUNNING,
  POD_STATUS_COMPLETED,
  POD_STATUS_SUCCEEDED,
];

const RunStrategy = {
  Always:         'Always',
  RerunOnFailure: 'RerunOnFailure',
  Halted:         'Halted',
  Manual:         'Manual',
};

const StateChangeRequest = {
  Start: 'Start',
  Stop:  'Stop',
};

const STARTING_MESSAGE =
  'This virtual machine will start shortly. Preparing storage, networking, and compute resources.';

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
  availableActions() {
    const out = this._standardActions;

    return [
      {
        action:     'stopVM',
        enabled:    !!this.actions?.stop,
        icon:       'icon icon-pause',
        label:      'stop',
      },
      {
        action:     'pauseVM',
        enabled:    !!this.actions?.pause,
        icon:       'icon icon-pause',
        label:      'pause',
      },
      {
        action:     'unpauseVM',
        enabled:    !!this.actions?.unpause,
        icon:       'icon icon-spinner',
        label:      'unpause',
      },
      {
        action:     'restartVM',
        enabled:    !!this.actions?.restart,
        icon:       'icon icon-spinner',
        label:      'restart',
      },
      {
        action:     'startVM',
        enabled:    !!this.actions?.start,
        icon:       'icon icon-play',
        label:      'start',
      },
      // {
      //   action:     'migrateVM',
      //   enabled:    !!this.actions?.migrate,
      //   icon:       'icons icon-h-migrate',
      //   label:      'migrate',
      // },
      {
        action:     'abortMigrationVM',
        enabled:    !!this.actions?.abortMigration,
        icon:       'icon icon-fw el-icon-circle-close',
        label:      'abortMigration',
      },
      ...out
    ];
  },

  restartVM() {
    return () => {
      this.doAction('restart', {});
    };
  },

  pauseVM() {
    return () => {
      this.doAction('pause', {});
    };
  },

  unpauseVM() {
    return () => {
      this.doAction('unpause', {});
    };
  },

  stopVM() {
    return () => {
      this.doAction('stop', {});
    };
  },

  startVM() {
    return () => {
      this.doAction('start', {});
    };
  },

  migrateVM() {
    return () => {
      this.doAction('migrate', {});
    };
  },

  abortMigrationVM() {
    return () => {
      this.doAction('abortMigration', {});
    };
  },

  isOff() {
    return !this.isVMExpectedRunning ? { status: OFF } : null;
  },

  isWaitingForVMI() {
    if (this && this.isVMExpectedRunning && !this.isVMCreated) {
      return { status: WAITING, message: VMI_WAITING_MESSAGE };
    }

    return null;
  },

  isVMExpectedRunning() {
    if (!this?.spec) {
      return false;
    }
    const { running, runStrategy } = this.spec;

    if (running !== null) {
      return running;
    }

    if (runStrategy !== null) {
      let changeRequests;

      switch (runStrategy) {
      case RunStrategy.Halted:
        return false;
      case RunStrategy.Always:
      case RunStrategy.RerunOnFailure:
        return true;
      case RunStrategy.Manual:
      default:
        changeRequests = new Set(
          (this.status?.stateChangeRequests || []).map(chRequest => chRequest?.action),
        );

        if (changeRequests.has(StateChangeRequest.Stop)) {
          return false;
        }
        if (changeRequests.has(StateChangeRequest.Start)) {
          return true;
        }

        return this.isVMCreated; // if there is no change request we can assume created is representing running (current and expected)
      }
    }

    return false;
  },

  podResource() {
    const vmiResource = this.$rootGetters['cluster/byId'](POD, this.id);
    const podList = this.$rootGetters['cluster/all'](POD);

    return podList.find( (P) => {
      return vmiResource?.metadata?.name === P.metadata?.ownerReferences?.[0].name;
    });
  },

  isPaused() {
    const conditions = this.vmi?.status?.conditions || [];
    const isPause = conditions.filter(cond => cond.type === PAUSED).length > 0;

    return isPause ? {
      status:  PAUSED,
      message: PAUSED_VM_MODAL_MESSAGE
    } : null;
  },

  isVMError() {
    const vmFailureCond = this.getStatusConditionOfType('Failure');

    if (vmFailureCond) {
      return {
        status:          VM_ERROR,
        detailedMessage: vmFailureCond.message,
      };
    }

    return null;
  },

  vmi() {
    return this.$rootGetters['cluster/byId'](VMI, this.id);
  },

  isError() {
    const vmiFailureCond = this?.vmi?.getStatusConditionOfType('Failure');

    if (vmiFailureCond) {
      return { status: 'VMI error', detailedMessage: vmiFailureCond.message };
    }

    if ((this.vmi || this.isVMCreated) && this.podResource) {
      const podStatus = this.podResource.getPodStatus;

      if (POD_STATUS_ALL_ERROR.includes(podStatus?.status)) {
        return {
          ...podStatus,
          status: 'LAUNCHER_POD_ERROR',
          pod:    this.podResource,
        };
      }
    }

    return null;
  },

  isRunning() {
    if (this.vmi?.getStatusPhase === VMIPhase.Running) {
      return { status: VMIPhase.Running };
    }

    return null;
  },

  isBeingStopped() {
    if (this && !this.isVMExpectedRunning && this.isVMCreated) {
      return { status: STOPPING };
    }

    return null;
  },

  isStarting() {
    if (this.isVMExpectedRunning && this.isVMCreated) {
      // created but not yet ready
      if (this.podResource) {
        const podStatus = this.podResource.getPodStatus;

        if (!POD_STATUS_ALL_READY.includes(podStatus?.status)) {
          return {
            ...podStatus,
            status:          'STARTING',
            message:         STARTING_MESSAGE,
            detailedMessage: podStatus?.message,
            pod:             this.podResource,
          };
        }
      }

      return {
        status: 'STARTING', message: STARTING_MESSAGE, pod: this.podResource
      };
    }

    return null;
  },

  otherState() {
    const state = (this.vmi && [VMIPhase.Scheduling, VMIPhase.Scheduled].includes(this.vmi.getStatusPhase) && {
      status:  'STARTING',
      message: STARTING_MESSAGE,
    }) ||
    (this.vmi && this.vmi.getStatusPhase === VMIPhase.Pending && {
      status:  'VMI_WAITING',
      message: VMI_WAITING_MESSAGE,
    }) ||
    (this.vmi && this.vmi.getStatusPhase === VMIPhase.Failed && { status: 'VMI_ERROR' }) ||
    ((this.isVMExpectedRunning && !this.isVMCreated) && { status: 'Pending' }) ||
    { status: 'UNKNOWN' };

    return state;
  },

  isVMCreated() {
    return !!this?.status?.created;
  },

  getDataVolumeTemplates() {
    return _.get(this, 'spec.dataVolumeTemplates') === null ? [] : this.spec.dataVolumeTemplates;
  },

  actualState() {
    const state =
      this.isPaused?.status ||
      this.isVMError?.status ||
      this.isBeingStopped?.status ||
      this.isOff?.status ||
      this.isError?.status ||
      this.isRunning?.status ||
      this.isStarting?.status ||
      this.isWaitingForVMI?.state ||
      this.otherState?.status;

    return state;
  },

  // customValidationRules() {
  //   const rules = [
  //     {
  //       nullable:       false,
  //       path:           'spec.name',
  //       required:       true,
  //       translationKey: 'monitoring.receiver.fields.name'
  //     },
  //   ];

  //   return rules;
  // },

  // network, disk logic
};
