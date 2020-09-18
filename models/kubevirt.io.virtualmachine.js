import _ from 'lodash';
import { VMI } from '@/config/types';
import { getPrefix } from '@/utils/url';

const VMI_WAITING_MESSAGE =
  'The virtual machine is waiting for resources to become available.';
const VM_ERROR = 'VM error';
const STOPPING = 'Stopping';
const OFF = 'Off';
const WAITING = 'Waiting';

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

export default {
  availableActions() {
    const out = this._standardActions;

    return [
      {
        action:     'stopVM',
        enabled:    !!this.actions?.stop,
        icon:       'icon icon-fw icon-pause',
        label:      'stop',
      },
      {
        action:     'pauseVM',
        enabled:    !!this.actions?.pause,
        icon:       'icon icon-fw icon-spinner',
        label:      'pause',
      },
      {
        action:     'unpauseVM',
        enabled:    !!this.actions?.unpause,
        icon:       'icon icon-fw icon-spinner',
        label:      'unpause',
      },
      {
        action:     'restartVM',
        enabled:    !!this.actions?.restart,
        icon:       'icon icon-fw icon-spinner',
        label:      'restart',
      },
      {
        action:     'startVM',
        enabled:    !!this.actions?.start,
        icon:       'icon icon-fw icon-play',
        label:      'start',
      },
      {
        action:     'openConsole',
        enabled:    true,
        icon:       'icon icon-fw icon-play',
        label:      'Open Console',
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

  openConsole() {
    return () => {
      const location = this.consoleLocation;

      const prefix = getPrefix();

      if (!prefix) {
        window.open(this.currentRouter().resolve(location).href, '_blank');
      } else {
        window.open(`dashboard/${ this.currentRouter().resolve(location).href }`, '_blank');
      }
    };
  },

  consoleLocation() {
    return {
      name:   `c-cluster-virtual-realresource-namespace-id-console`,
      params: {
        product:      'virtual',
        cluster:      this.$rootGetters['clusterId'],
        realresource: 'kubevirt.io.virtualmachineinstance',
        namespace:    this.metadata?.namespace,
        id:           this.metadata.name,
      }
    };
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

  isBeingStopped() {
    if (this && !this.isVMExpectedRunning && this.isVMCreated) {
      return { status: STOPPING };
    }

    return null;
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

  isVMCreated() {
    return !!this?.status?.created;
  },

  getDataVolumeTemplates() {
    return _.get(this, 'spec.dataVolumeTemplates') === null ? [] : this.spec.dataVolumeTemplates;
  }
};
