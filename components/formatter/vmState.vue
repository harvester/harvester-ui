<script>
import { VMI, POD } from '@/config/types';

const VMIPhase = {
  Pending:    'Pending',
  Scheduling: 'Scheduling',
  Scheduled:  'Scheduled',
  Running:    'Running',
  Succeeded:  'Succeeded',
  Failed:     'Failed',
  Unknown:    'Unknown',
};

const POD_STATUS_NOT_SCHEDULABLE = 'POD_NOT_SCHEDULABLE';
const POD_STATUS_CONTAINER_FAILING = 'POD_CONTAINER_FAILING';
const POD_STATUS_NOT_READY = 'POD_NOT_READY'; // eslint-disable-line

const POD_STATUS_FAILED = 'POD_FAILED';
const POD_STATUS_CRASHLOOP_BACKOFF = 'POD_CRASHLOOP_BACKOFF';
const POD_STATUS_UNKNOWN = 'POD_STATUS_UNKNOWN';

const POD_STATUS_COMPLETED = 'POD_STATUS_COMPLETED';
const POD_STATUS_SUCCEEDED = 'POD_STATUS_SUCCEEDED';
const POD_STATUS_RUNNING = 'POD_STATUS_RUNNING';

const POD_STATUS_ALL_ERROR = [
  POD_STATUS_NOT_SCHEDULABLE,
  POD_STATUS_CONTAINER_FAILING,
  POD_STATUS_FAILED,
  POD_STATUS_CRASHLOOP_BACKOFF,
  POD_STATUS_UNKNOWN,
];

const POD_STATUS_ALL_READY = [
  POD_STATUS_RUNNING,
  POD_STATUS_COMPLETED,
  POD_STATUS_SUCCEEDED,
];

const CDI_KUBEVIRT_IO = 'cdi.kubevirt.io';
const STORAGE_IMPORT_PVC_NAME = 'storage.import.importPvcName';

const STARTING_MESSAGE =
  'This virtual machine will start shortly. Preparing storage, networking, and compute resources.';

const VMI_WAITING_MESSAGE =
  'The virtual machine is waiting for resources to become available.';

export default {
  props: {
    value: {
      type:     String,
      default: ''
    },
    row: {
      type:     Object,
      required: true
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },

  async fetch() {

  },

  data() {
    return {
      vmiResource: null, podResource: null, vmiList: [], podList: []
    };
  },

  computed: {
    state() {
      const state =
      (this.vmiResource && this.vmiResource.isPaused?.status) ||
      this.row.isVMError?.status ||
      this.row.isBeingStopped?.status ||
      this.row.isOff?.status ||
      this.isError()?.status ||
      (this.vmiResource && this.vmiResource.isRunning?.status) ||
      this.isStarting()?.status ||
      this.row.isWaitingForVMI?.state ||
      this.otherState()?.status;

      return state;
    },
    isRun() {
      return this.state === 'Running';
    },
    isOf() {
      return this.state === 'Off';
    },
    isPending() {
      return this.state === 'Pending';
    },
    isErrorS() {
      return this.state === 'Error';
    },
    isStop() {
      return this.state === 'Stoping';
    },
    isStart() {
      return this.state === 'Starting';
    },
    isOther() {
      return this.state !== 'Off' && this.state !== 'Running' && this.state !== 'Stoping';
    }
  },
  watch: {
    vmiList: {
      handler(neu) {
        const vmiResource = this.vmiList.find(VMI => VMI.id === this.value) || null;
        let podResource = null;

        if (vmiResource) {
          podResource = this.podList.find( (P) => {
            return vmiResource.metadata.name === P.metadata?.ownerReferences?.[0].name;
          });
        }
        this.vmiResource = vmiResource;
        this.podResource = podResource;
      },
      immediate: true,
      deep:      true
    }
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadData() {
      const podList = await this.$store.getters['cluster/all'](POD);
      const vmiList = await this.$store.getters['cluster/all'](VMI);
      // const vmiList = await this.$store.dispatch('cluster/findAll', { type: VMI });
      // const podList = await this.$store.dispatch('cluster/findAll', { type: POD });

      this.podList = podList;
      this.vmiList = vmiList;
    },

    isError() {
      const vmiFailureCond = this?.vmiResource?.getStatusConditionOfType('Failure');

      if (vmiFailureCond) {
        return { status: 'VMI error', detailedMessage: vmiFailureCond.message };
      }

      if ((this.vmiResource || this.row.isVMCreated) && this.podResource) {
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

    otherState() {
      const state = (this.vmiResource && [VMIPhase.Scheduling, VMIPhase.Scheduled].includes(this.vmiResource.getStatusPhase) && {
        status:  'STARTING',
        message: STARTING_MESSAGE,
      }) ||
      (this.vmiResource && this.vmiResource.getStatusPhase === VMIPhase.Pending && {
        status:  'VMI_WAITING',
        message: VMI_WAITING_MESSAGE,
      }) ||
      (this.vmiResource && this.vmiResource.getStatusPhase === VMIPhase.Failed && { status: 'VMI_ERROR' }) ||
      ((this.row.isVMExpectedRunning && !this.row.isVMCreated) && { status: 'Pending' }) ||
      { status: 'UNKNOWN' };

      return state;
    },

    isStarting() {
      if (this.row.isVMExpectedRunning && this.row.isVMCreated) {
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

    isBeingImported() {
      const importerPods = this.getVMImporterPods();

      if (importerPods && importerPods.length > 0 && !this.row.isVMCreated) {

        // const dvLookup = createBasicLookup(dataVolumes);
        // const importerPodsStatuses = importerPods.map((pod) => {
        //   const podStatus = getPodStatus(pod);
        //   const dvName = getLabelValue(pod, `${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_PVC_NAME}`);
        //   const dataVolume = dvLookup[dvName];

        //   if (POD_STATUS_ALL_ERROR.includes(podStatus.status)) {
        //     let status = VMStatus.CDI_IMPORT_ERROR;
        //     if (
        //       podStatus.status === POD_STATUS_NOT_SCHEDULABLE &&
        //       getPodStatusPhase(pod) === POD_PHASE_PENDING
        //     ) {
        //       status = VMStatus.CDI_IMPORT_PENDING;
        //     }

        //     return {
        //       message: podStatus.message,
        //       status,
        //       progress: null,
        //       dataVolume,
        //       pod,
        //     };
        //   }
        //   return {
        //     status: VMStatus.CDI_IMPORTING,
        //     message: podStatus.message,
        //     pod,
        //     dataVolume,
        //     progress: parsePercentage(dataVolume?.status?.progress, 0),
        //   };
        // });
        // const importStatus =
        //   importerPodsStatuses.find(({ status }) => status.isError()) ||
        //   importerPodsStatuses.find(({ status }) => status.isPending()) ||
        //   importerPodsStatuses[0];
        // const resultStatus = importStatus?.status || VMStatus.CDI_IMPORT_PENDING;
        // return {
        //   status: resultStatus,
        //   message: resultStatus.isError()
        //     ? IMPORTING_CDI_ERROR_MESSAGE
        //     : resultStatus.isPending()
        //     ? IMPORT_CDI_PENDING_MESSAGE
        //     : IMPORTING_CDI_MESSAGE,
        //   importerPodsStatuses,
        // };
      }

      return null;
    },

    getVMImporterPods() {
      const pvcNameLabel = `${ CDI_KUBEVIRT_IO }/${ STORAGE_IMPORT_PVC_NAME }`;

      if (!this.podResource) {
        return null;
      }
      const datavolumeNames = this.row.getDataVolumeTemplates
        .map(dataVolumeTemplate => dataVolumeTemplate.name)
        .filter(dataVolumeTemplate => dataVolumeTemplate);

      return this.podList.filter(
        p => p.namespace === this.row.namespace &&
          p.getLabelValue(CDI_KUBEVIRT_IO) === 'importer' &&
          datavolumeNames.some(name => p.getLabelValue(pvcNameLabel) === name),
      );
    },

    createBasicLookup(list = []) {
      return (list || []).reduce((lookup, entity) => {
        const key = entity.name;

        if (key) {
          lookup[key] = entity;
        }

        return lookup;
      }, {});
    }
  }
};
</script>

<template>
  <span :key="state" :class="{'badge-state': true, 'bg-success': isRun, 'bg-error': isErrorS, 'bg-warning': isOf, 'bg-tip': isOther}">
    <template>
      {{ state }}
    </template>
  </span>
</template>

<style lang="scss" scoped>
.badge-state {
    padding: 5px 10px;
    border: 1px solid transparent;
    border-radius: 20px;
    max-width: 250px !important;

    &.bg-info {
      border-color: var(--primary);
    }

    &.bg-error {
      border-color: var(--error);
    }

    &.bg-warning {
      border-color: var(--warning);
    }

    &.bg-tip {
      border-color: wheat;
    }

    // Successful states are de-emphasized by using [text-]color instead of background-color
    &.bg-success {
      color: var(--success);
      border-color: var(--success);
      background: transparent;
    }
  }
</style>
