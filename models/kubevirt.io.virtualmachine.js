/* eslint-disable */
import Vue from 'vue';
import _ from 'lodash';
import { safeLoad } from 'js-yaml';
import Notification from '@/components/Notification/main.js';
import { colorForState } from '@/plugins/steve/resource-instance';
import {
  VMI, POD, VM, NODE, HARVESTER_RESTORE
} from '@/config/types';
import { HARVESTER_RESTORE_NAME } from '@/config/labels-annotations';

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
        icon:       'icons icon-h-stop',
        label:      this.t('action.stop'),
        bulkable:   true,
        external:   true,
      },
      {
        action:     'pauseVM',
        enabled:    !!this.actions?.pause,
        icon:       'icons icon-h-pause',
        label:      this.t('action.pause'),
      },
      {
        action:     'unpauseVM',
        enabled:    !!this.actions?.unpause,
        icon:       'icon icon-spinner',
        label:      this.t('action.unpause'),
      },
      {
        action:     'restartVM',
        enabled:    !!this.actions?.restart,
        icon:       'icons icon-h-restart',
        label:      this.t('action.restart'),
        bulkable:   true,
        external:   true,
      },
      {
        action:     'startVM',
        enabled:    !!this.actions?.start,
        icon:       'icon icon-play',
        label:      this.t('action.start'),
        bulkable:   true,
        external:   true,
      },
      {
        action:     'backupVM',
        enabled:    !!this.actions?.backup,
        icon:       'icons icon-h-restore-existing',
        label:      this.t('action.backup'),
        // bulkable:   true,
        // external:   true,
      },
      {
        action:     'restoreVM',
        enabled:    !!this.actions?.restore,
        icon:       'icons icon-h-restore-new',
        label:      this.t('action.restore'),
        // bulkable:   true,
        // external:   true,
      },
      {
        action:     'ejectCDROM',
        enabled:    !!this.actions.ejectCdRom,
        icon:       'icon icon-delete',
        label:      this.t('action.ejectCDROM'),
      },
      {
        action:     'migrateVM',
        enabled:    !!this.actions?.migrate,
        icon:       'icons icon-h-migrate',
        label:      this.t('action.migrate'),
      },
      {
        action:     'abortMigrationVM',
        enabled:    !!this.actions?.abortMigration,
        icon:       'icon icon-close',
        label:      this.t('action.abortMigration'),
      },
      {
        action:     'createTemplate',
        enabled:    !!this.actions?.createTemplate,
        icon:       'icon icon-copy',
        label:      this.t('action.createTemplate'),
      },
      ...out
    ];
  },

  restartVM() {
    return () => {
      this.doAction('restart', {});
    };
  },

  backupVM() {
    return (resources = this) => {
      this.$commit('kubevirt.io.virtualmachine/toggleBackupModal', resources, { root: true });
    };
  },

  restoreVM() {
    return (resources = this) => {
      this.$commit('kubevirt.io.virtualmachine/toggleRestoreModal', resources, { root: true });
    };
  },

  realAttachNodeName() {
    const vmi = this.$getters['byId'](VMI, this.id);
    const nodeName = vmi?.status?.nodeName;
    const node = this.$getters['byId'](NODE, nodeName);

    return node?.nameDisplay || '';
  },

  nodeName() {
    const vmi = this.$getters['byId'](VMI, this.id);
    const nodeName = vmi?.status?.nodeName;
    const node = this.$getters['byId'](NODE, nodeName);

    return node?.id;
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
    return (resources = this) => {
      this.$commit('kubevirt.io.virtualmachine/toggleMigrationModal', resources, { root: true });
    };
  },

  ejectCDROM() {
    return () => {
      this.$dispatch('ejectCDROM', this);
    };
  },

  abortMigrationVM() {
    return () => {
      this.doAction('abortMigration', {});
    };
  },

  createTemplate() {
    return async (resources = this) => {
      this.$commit('kubevirt.io.virtualmachine/toggleCloneTemplateModal', resources, { root: true });
      // try {
      //   const message = this.t('harvester.vmPage.createTemplate.message.success');
      //   const res = await this.doAction('createTemplate', {});

      //   if (res._status === 200 || res._status === 204) {
      //     Notification({
      //       title:    this.t('harvester.notification.title.succeed'),
      //       duration: 5000,
      //       message,
      //       type:     'success'
      //     })
      //   }
      // } catch(err) {
      //   const message = err?.response?.data?.message || err || this.t('harvester.vmPage.createTemplate.message.failed')

      //   Notification({
      //     title:    this.t('harvester.notification.title.error'),
      //     duration: 5000,
      //     message,
      //     type:     'error'
      //   })
      // }
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
    const { running = null, runStrategy = null } = this.spec;

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
    const vmiResource = this.$rootGetters['cluster/byId'](VMI, this.id);
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
      // const podStatus = this.podResource.getPodStatus;

      // if (POD_STATUS_ALL_ERROR.includes(podStatus?.status)) {
      //   return {
      //     ...podStatus,
      //     status: 'LAUNCHER_POD_ERROR',
      //     pod:    this.podResource,
      //   };
      // }
    }

    return this?.vmi?.status?.phase;
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
            status:          'Starting',
            message:         STARTING_MESSAGE,
            detailedMessage: podStatus?.message,
            pod:             this.podResource,
          };
        }
      }

      return {
        status: 'Starting', message: STARTING_MESSAGE, pod: this.podResource
      };
    }

    return null;
  },

  otherState() {
    const state = (this.vmi && [VMIPhase.Scheduling, VMIPhase.Scheduled].includes(this.vmi.getStatusPhase) && {
      status:  'Starting',
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

  restoreState() {
    return (vmResource = this, id) => {
      if (!id) {
        id = `default/${ vmResource.getAnnotationValue(HARVESTER_RESTORE_NAME) }`;
      }
      const restoreResource = this.$rootGetters['cluster/byId'](HARVESTER_RESTORE, id);

      if (!restoreResource) {
        return true;
      }

      return restoreResource?.isComplete;
    };
  },

  actualState() {
    if (!this.restoreState()) {
      return 'Restoring';
    }

    if (this?.metadata?.deletionTimestamp) {
      return 'Terminating';
    }

    if (!!this?.vmi?.migrationState && this.vmi.migrationState.status !== 'Failed') {
      return this.vmi.migrationState.status
    }

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

  warningMessage() {
    const vmFailureCond = this.getStatusConditionOfType('Failure');

    if (vmFailureCond) {
      return {
        status:  VM_ERROR,
        message: vmFailureCond.message,
      };
    }


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

  migrationMessage() {
    if (!!this?.vmi?.migrationState && this.vmi.migrationState.status === 'Failed') {
      return {
        ...this.actualState,
        message: this.t('harvester.vmPage.migrationModal.failedMessage')
      }
    }
    return null;
  },

  stateDisplay() {
    return this.actualState;
  },

  stateColor() {
    const state = this.actualState;

    return colorForState(state);
  },

  networkIps() {
    let networkData = '';
    const out = [];
    const arrVolumes = this.spec.template?.spec?.volumes || [];

    arrVolumes.forEach((V) => {
      if (V.cloudInitNoCloud) {
        networkData = V.cloudInitNoCloud.networkData;
      }
    });

    try {
      const newInitScript = safeLoad(networkData);

      if (newInitScript?.config && Array.isArray(newInitScript.config)) {
        const config = newInitScript.config;

        config.forEach((O) => {
          if (O?.subnets && Array.isArray(O.subnets)) {
            const subnets = O.subnets;

            subnets.forEach((S) => {
              if (S.address) {
                out.push(S.address);
              }
            });
          }
        });
      }
    } catch (err) {

    }

    return out;
  },

  warningCount() {
    return this.resourcesStatus.warningCount;
  },

  errorCount() {
    return this.resourcesStatus.errorCount;
  },

  resourcesStatus() {
    const vmList = this.$rootGetters['cluster/all'](VM);
    let warningCount = 0;
    let errorCount = 0;

    vmList.forEach((vm) => {
      const status = vm.actualState;

      if (status === VM_ERROR) {
        errorCount += 1;
      } else if (status === 'Stopping' || status === 'Waiting' || status === 'Pending' || status === 'Starting' || status === 'Terminating') {
        warningCount += 1;
      }
    });

    return {
      warningCount,
      errorCount
    };
  },

  restoreName() {
    return this.getAnnotationValue(HARVESTER_RESTORE_NAME);
  },

  actuallyBeforeSave() {
    return () => {
      Vue.delete(this, 'type');
    };
  },

  customValidationRules() {
    const rules = [
      {
        nullable:       false,
        path:           'metadata.name',
        required:       true,
        minLength:      1,
        maxLength:      63,
        translationKey: 'harvester.fields.name'
      },
      {
        nullable:       false,
        path:           'spec.template.spec.domain.cpu.cores',
        min:            1,
        max:            100,
        required:       true,
        translationKey: 'harvester.fields.cpu',
      },
      {
        nullable:       false,
        path:           'spec.template.spec.domain.resources.requests.memory',
        required:       false,
        translationKey: 'harvester.fields.memory',
        validators:     ['vmMemoryUnit'],
      },
      {
        nullable:       false,
        path:           'spec.template.spec',
        validators:     ['vmNetworks'],
      },
      {
        nullable:       false,
        path:           'spec',
        validators:     ['vmDisks'],
      },
    ];

    return rules;
  },

  attachNetwork() {
    const networks = this.spec?.template?.spec?.networks || [];
    const hasMultus = networks.find( N => N.multus);

    return !!hasMultus;
  },

  memorySort() {
    const memory = this?.spec?.template?.spec?.domain?.resources?.requests?.memory || 0;

    return parseInt(memory)
  }

  // network, disk logic
};
