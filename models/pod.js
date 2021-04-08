import _ from 'lodash';
import { findBy, insertAt } from '@/utils/array';
import { colorForState, stateDisplay } from '@/plugins/steve/resource-instance';
import { NODE, WORKLOAD_TYPES } from '@/config/types';

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

export const WORKLOAD_PRIORITY = {
  [WORKLOAD_TYPES.DEPLOYMENT]:             1,
  [WORKLOAD_TYPES.CRON_JOB]:               2,
  [WORKLOAD_TYPES.DAEMON_SET]:             3,
  [WORKLOAD_TYPES.STATEFUL_SET]:           4,
  [WORKLOAD_TYPES.JOB]:                    5,
  [WORKLOAD_TYPES.REPLICA_SET]:            6,
  [WORKLOAD_TYPES.REPLICATION_CONTROLLER]: 7,
};

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

      return stateDisplay(state);
    };
  },

  containerStateColor() {
    return (container) => {
      const state = Object.keys(container.state || {})[0];

      return colorForState(state);
    };
  },

  imageNames() {
    return this.spec.containers.reduce((all, container) => {
      all.push(container.image);

      return all;
    }, []);
  },

  workloadRef() {
    const owners = this.getOwners() || [];
    const workloads = owners.filter((owner) => {
      return Object.values(WORKLOAD_TYPES).includes(owner.type);
    }).sort((a, b) => {
      // Prioritize types so that deployments come before replicasets and such.
      const ia = WORKLOAD_PRIORITY[a.type];
      const ib = WORKLOAD_PRIORITY[b.type];

      return ia - ib;
    });

    return workloads[0];
  },

  details() {
    const out = [
      {
        label:   this.t('workload.detailTop.podIP'),
        content: this.status.podIP
      },
    ];

    if ( this.workloadRef ) {
      out.push({
        label:         'Workload',
        formatter:     'LinkName',
        formatterOpts: {
          value:     this.workloadRef.name,
          type:      this.workloadRef.type,
          namespace: this.workloadRef.namespace
        },
        content: this.workloadRef.name
      });
    }

    if ( this.spec.nodeName ) {
      out.push({
        label:         'Node',
        formatter:     'LinkName',
        formatterOpts: { type: NODE, value: this.spec.nodeName },
        content:       this.spec.nodeName,
      });
    }

    return out;
  },

  isRunning() {
    return this.status.phase === 'Running';
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
