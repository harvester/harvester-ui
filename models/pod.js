import _ from 'lodash';
import { findBy, insertAt } from '@/utils/array';
import { NODE } from '@/config/types';

const POD_STATUS_NOT_SCHEDULABLE = 'POD_NOT_SCHEDULABLE';

const POD_STATUS_FAILED = 'POD_FAILED';
const POD_STATUS_CRASHLOOP_BACKOFF = 'POD_CRASHLOOP_BACKOFF';
const POD_STATUS_UNKNOWN = 'POD_STATUS_UNKNOWN';
const POD_STATUS_CONTAINER_FAILING = 'POD_CONTAINER_FAILING';
const POD_STATUS_NOT_READY = 'POD_NOT_READY';

const POD_STATUS_PENDING = 'POD_STATUS_PENDING';
const POD_STATUS_COMPLETED = 'POD_STATUS_COMPLETED';
const POD_STATUS_SUCCEEDED = 'POD_STATUS_SUCCEEDED';
const POD_STATUS_RUNNING = 'POD_STATUS_RUNNING';

const failedWaitingContainerReasons = ['ImagePullBackOff', 'ErrImagePull', 'CrashLoopBackOff'];
const failedTerminationContaineReasons = ['Error'];

const errorStatusMapper = {
  Failed:           POD_STATUS_FAILED,
  CrashLoopBackOff: POD_STATUS_CRASHLOOP_BACKOFF,
  Unknown:          POD_STATUS_UNKNOWN,
};

const okStatusMapper = {
  Pending:   POD_STATUS_PENDING,
  Running:   POD_STATUS_RUNNING,
  Completed: POD_STATUS_COMPLETED,
  Succeeded: POD_STATUS_SUCCEEDED,
};

const stateReasonResolver = {
  terminated: ({ reason, exitCode }) => `Terminated with ${ reason }${ exitCode ? ` (exit code ${ exitCode }).` : '.' }`,
  waiting:    ({ reason }) => `Waiting (${ reason }).`,
};

export default {
  availableActions() {
    const out = this._standardActions;

    const removeAction = findBy(out, 'altAction', ' remove');
    let idx = out.length - 1;

    if ( removeAction ) {
      idx = out.indexOf(removeAction);
    }

    const openShell = {
      action:     'openShell',
      enabled:    true,
      icon:       'icon icon-fw icon-chevron-right',
      label:      'Execute Shell',
      total:      1,
    };
    const openLogs = {
      action:     'openLogs',
      enabled:    true,
      icon:       'icon icon-fw icon-chevron-right',
      label:      'View Logs',
      total:      1,
    };

    insertAt(out, idx, openShell);
    insertAt(out, idx + 1, openLogs);
    insertAt(out, idx + 2, { divider: true });

    return out;
  },

  defaultContainerName() {
    const containers = this.spec.containers;
    const desirable = containers.filter(c => c.name !== 'istio-proxy');

    if ( desirable.length ) {
      return desirable[0].name;
    }

    return containers[0]?.name;
  },

  openShell() {
    return () => {
      this.$dispatch('wm/open', {
        id:        `${ this.id }-shell`,
        label:     this.nameDisplay,
        icon:      'terminal',
        component: 'ContainerShell',
        attrs:     {
          pod:       this,
          container: this.defaultContainerName
        }
      }, { root: true });
    };
  },

  openLogs() {
    return () => {
      this.$dispatch('wm/open', {
        id:        `${ this.id }-logs`,
        label:     this.nameDisplay,
        icon:      'file',
        component: 'ContainerLogs',
        attrs:     {
          pod:       this,
          container: this.defaultContainerName
        }
      }, { root: true });
    };
  },

  containerStateDisplay() {
    return (container) => {
      const state = Object.keys(container.state || {})[0];

      return this._stateDisplay(state);
    };
  },

  containerStateColor() {
    return (container) => {
      const state = Object.keys(container.state || {})[0];

      return this.stateColor(state);
    };
  },

  workload() {
    const kind = this.metadata.ownerReferences[0].kind;
    const uid = this.metadata.ownerReferences[0].uid;
    const schema = this.$rootGetters['cluster/schema'](kind);

    if (schema) {
      const type = schema.id;
      const allOfResourceType = this.$rootGetters['cluster/all'](type);

      return allOfResourceType.filter(resource => resource?.metadata?.uid === uid)[0];
    }
  },

  nodes() {
    return this.$rootGetters['cluster/all'](NODE);
  },

  node() {
    const { nodeName } = this.spec;

    return this.nodes.filter((node) => {
      return node?.metadata?.name === nodeName;
    })[0];
  },

  details() {
    return [
      {
        label:         this.t('workload.detailTop.workload'),
        formatter:     'LinkDetail',
        formatterOpts: { row: this.workload },
        content:       this.workload?.metadata.name
      },
      {
        label:   this.t('workload.detailTop.podIP'),
        content: this.status.podIP
      },
      {
        label:         this.t('workload.detailTop.node'),
        formatter:     'LinkDetail',
        formatterOpts: { row: this.node },
        content:       this.node?.metadata.name
      },
      {
        label:   this.t('workload.detailTop.podRestarts'),
        content: (this.status?.containerStatuses || [])[0]?.restartCount
      }
    ];
  },

  getPodStatus() {
    return this.isNotSchedulable ||
    this.hasErrorStatus ||
    this.isContainerFailing ||
    this.isNotReady ||
    this.hasOkStatus || { status: POD_STATUS_UNKNOWN };
  },

  isNotSchedulable() {
    if (!this.isPodSchedulable) {
      return {
        status:  POD_STATUS_NOT_SCHEDULABLE,
        message: 'Pod scheduling failed.',
      };
    }

    return null;
  },

  hasErrorStatus() {
    const status = errorStatusMapper[this.getStatusPhase];

    if (status) {
      return {
        status,
        message: this.getContainerStatusReason(this.findFailingContainerStatus),
      };
    }

    return null;
  },

  isPodSchedulable() {
    const podScheduledCond = this.getStatusConditionOfType('PodScheduled');

    return !(
      podScheduledCond &&
      podScheduledCond.status !== 'True' &&
      podScheduledCond.reason === 'Unschedulable'
    );
  },

  findFailingContainerStatus() {
    return _.get(this, 'status.containerStatuses', []).find((container) => {
      return !container.ready &&
      (_.includes(failedWaitingContainerReasons, _.get(container, 'state.waiting.reason')) ||
      _.includes(failedTerminationContaineReasons, _.get(container, 'state.terminated.reason')));
    });
  },

  getContainerStatusReason() {
    return (containerStatus) => {
      if (containerStatus) {
        const stateName = Object.getOwnPropertyNames(containerStatus.state).find(
          pn => !!containerStatus.state[pn].reason,
        );

        if (stateName) {
          const state = containerStatus.state[stateName];

          return (
            state.message ||
            (stateReasonResolver[stateName] && stateReasonResolver[stateName](state)) ||
            stateName
          );
        }
      }

      return undefined;
    };
  },

  isContainerFailing() {
    const failingContainer = this.findFailingContainerStatus;

    if (failingContainer) {
      return {
        status:  POD_STATUS_CONTAINER_FAILING,
        message: this.getContainerStatusReason(failingContainer),
      };
    }

    return null;
  },

  isNotReady() {
    const message = this.findPodFalseStatusConditionMessage;

    if (message) {
      return {
        status: POD_STATUS_NOT_READY,
        message,
      };
    }

    return null;
  },

  hasOkStatus() {
    const status = okStatusMapper[this.getStatusPhase];

    if (status) {
      return { status };
    }

    return null;
  },

  findPodFalseStatusConditionMessage() {
    const notReadyConditions = this.getPodFalseStatusConditions;

    if (notReadyConditions.length > 0) {
      return notReadyConditions[0].message || `Step: ${ notReadyConditions[0].type }`;
    }

    return undefined;
  },

  getPodFalseStatusConditions() {
    return this.getPodStatusConditions.filter(condition => condition.status !== 'True');
  },

  getPodStatusConditions() {
    return _.get(this, 'status.conditions', []);
  },
};
