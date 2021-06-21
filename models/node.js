import { formatPercent } from '@/utils/string';
import {
  NODE_ROLES,
  RKE,
  CAPI as CAPI_ANNOTATIONS,
  HOST_CUSTOM_NAME,
  NODE_ROLE_MASTER,
  NODE_ROLE_CONTROL_PLANE,
  HARVESTER_PROMOTE_STATUS,
  HARVESTER_MAINTENANCE_STATUS
} from '@/config/labels-annotations.js';
import { METRIC, POD, NODE, CAPI } from '@/config/types';
import { parseSi } from '@/utils/units';
import { clone } from '@/utils/object';
import { PRIVATE } from '@/plugins/steve/resource-proxy';
import findLast from 'lodash/findLast';

export default {
  _availableActions() {
    const cordon = {
      action:     'cordon',
      enabled:    this.hasAction('cordon'),
      icon:       'icon icon-fw icon-pause',
      label:      this.t('harvester.action.cordon'),
      total:      1,
      bulkable:   true
    };

    const uncordon = {
      action:     'uncordon',
      enabled:    this.hasAction('uncordon'),
      icon:       'icon icon-fw icon-play',
      label:      this.t('harvester.action.uncordon'),
      total:      1,
      bulkable:   true
    };

    const enableMaintenance = {
      action:     'enableMaintenanceMode',
      enabled:    this.hasAction('enableMaintenanceMode'),
      icon:       'icon icon-fw icon-unlock',
      label:      this.t('harvester.action.enableMaintenance'),
      total:      1
    };

    const disableMaintenance = {
      action:     'disableMaintenanceMode',
      enabled:    this.hasAction('disableMaintenanceMode'),
      icon:       'icon icon-fw icon-lock',
      label:      this.t('harvester.action.disableMaintenance'),
      total:      1
    };

    return [
      cordon,
      uncordon,
      enableMaintenance,
      disableMaintenance,
      ...this._standardActions
    ];
  },

  detailLocation() { // maybe only harvester mode
    const detailLocation = clone(this._detailLocation);

    detailLocation.params.resource = 'host';

    return detailLocation;
  },

  doneOverride() { // maybe only harvester mode
    const detailLocation = clone(this._detailLocation);

    delete detailLocation.params.namespace;
    delete detailLocation.params.id;
    detailLocation.params.resource = 'host';
    detailLocation.name = 'c-cluster-product-resource';

    return detailLocation;
  },

  canCustomEdit() {
    return true;
  },

  canUpdate() {
    return true;
  },

  nameDisplay() {
    return this.metadata?.annotations?.[HOST_CUSTOM_NAME] || this.metadata?.name;
  },

  showDetailStateBadge() {
    return true;
  },

  name() {
    return this.metadata.name;
  },

  internalIp() {
    const addresses = this.status?.addresses || [];

    return findLast(addresses, address => address.type === 'InternalIP')?.address;
  },

  externalIp() {
    const addresses = this.status?.addresses || [];
    const annotationAddress = this.metadata.annotations[RKE.EXTERNAL_IP];
    const statusAddress = findLast(addresses, address => address.type === 'ExternalIP')?.address;

    return statusAddress || annotationAddress;
  },

  labels() {
    // return this.metadata?.labels || {};
    return {};
  },

  annotations() {
    return {};
  },

  isWorker() {
    const { WORKER: worker } = NODE_ROLES;

    return `${ this.labels[worker] }` === 'true';
  },

  isControlPlane() {
    const { CONTROL_PLANE: controlPlane } = NODE_ROLES;

    return `${ this.labels[controlPlane] }` === 'true';
  },

  isEtcd() {
    const { ETCD: etcd } = NODE_ROLES;

    return `${ this.labels[etcd] }` === 'true';
  },

  hasARole() {
    const roleLabelKeys = Object.values(NODE_ROLES);

    return Object.keys(this.labels)
      .some((labelKey) => {
        const hasRoleLabel = roleLabelKeys.includes(labelKey);
        const isExpectedValue = `${ this.labels[labelKey] }` === 'true';

        return hasRoleLabel && isExpectedValue;
      });
  },

  roles() {
    const { isControlPlane, isWorker, isEtcd } = this;

    if (( isControlPlane && isWorker && isEtcd ) ||
        ( !isControlPlane && !isWorker && !isEtcd )) {
      // !isControlPlane && !isWorker && !isEtcd === RKE?
      return 'All';
    }
    // worker+cp, worker+etcd, cp+etcd

    if (isControlPlane && isWorker) {
      return 'Control Plane, Worker';
    }

    if (isControlPlane && isEtcd) {
      return 'Control Plane, Etcd';
    }

    if (isEtcd && isWorker) {
      return 'Etcd, Worker';
    }

    if (isControlPlane) {
      return 'Control Plane';
    }

    if (isEtcd) {
      return 'Etcd';
    }

    if (isWorker) {
      return 'Worker';
    }
  },

  version() {
    return this.status.nodeInfo.kubeletVersion;
  },

  cpuUsage() {
    return parseSi(this.$rootGetters['cluster/byId'](METRIC.NODE, this.id)?.usage?.cpu || '0');
  },

  cpuCapacity() {
    return parseSi(this.status.allocatable.cpu);
  },

  cpuUsagePercentage() {
    return ((this.cpuUsage * 10000) / this.cpuCapacity).toString();
  },

  ramUsage() {
    return parseSi(this.$rootGetters['cluster/byId'](METRIC.NODE, this.id)?.usage?.memory || '0');
  },

  ramCapacity() {
    return parseSi(this.status.capacity.memory);
  },

  ramUsagePercentage() {
    return ((this.ramUsage * 10000) / this.ramCapacity).toString();
  },

  podUsage() {
    return calculatePercentage(this.status.allocatable.pods, this.status.capacity.pods);
  },

  podCapacity() {
    return Number.parseInt(this.status.capacity.pods);
  },

  podConsumed() {
    return this.runningPods.length;
  },

  isPidPressureOk() {
    return this.isCondition('PIDPressure', 'False');
  },

  isDiskPressureOk() {
    return this.isCondition('DiskPressure', 'False');
  },

  isMemoryPressureOk() {
    return this.isCondition('MemoryPressure', 'False');
  },

  isKubeletOk() {
    return this.isCondition('Ready');
  },

  isCordoned() {
    return !!this.spec.unschedulable;
  },

  isEnteringMaintenance() {
    return this.metadata?.annotations?.[HARVESTER_MAINTENANCE_STATUS] === 'running';
  },

  isMaintenance() {
    return this.metadata?.annotations?.[HARVESTER_MAINTENANCE_STATUS] === 'completed';
  },

  maintenanceStatus() {
    const isCompeted = this.row?.metadata?.annotations?.[HARVESTER_MAINTENANCE_STATUS] === 'completed';
    const isRunning = this.row?.metadata?.annotations?.[HARVESTER_MAINTENANCE_STATUS] === 'running';

    if (isRunning) {
      return 'entering maintain';
    } else if (isCompeted) {
      return 'maintain';
    }
  },

  containerRuntimeVersion() {
    return this.status.nodeInfo.containerRuntimeVersion.replace('docker://', '');
  },

  containerRuntimeIcon() {
    if ( this.status.nodeInfo.containerRuntimeVersion.includes('docker') ) {
      return 'icon-docker';
    }

    return '';
  },

  cordon() {
    return (resources = this) => {
      this.$commit('node/toggleCordonModal', resources, { root: true });
    };
  },

  uncordon() {
    this.doAction('uncordon', {});
  },

  enableMaintenanceMode() {
    return (resources = this) => {
      this.$commit('node/toggleMaintenanceModal', resources, { root: true });
    };
  },

  disableMaintenanceMode() {
    this.doAction('disableMaintenanceMode', {});
  },

  state() {
    if (this.isEnteringMaintenance) {
      return 'Entering maintenance mode';
    }

    if (this.isMaintenance) {
      return 'Maintenance mode';
    }

    if ( !this[PRIVATE].isDetailPage && this.isCordoned ) {
      return 'cordoned';
    }

    return this.metadata?.state?.name || 'unknown';
  },

  details() {
    // return [{
    //   label:     this.t('node.detail.detailTop.ipAddress'),
    //   formatter: 'CopyToClipboardText',
    //   content:   this.externalIp || this.internalIp
    // },
    // {
    //   label:    this.t('node.detail.detailTop.version'),
    //   content:  this.version
    // },
    // {
    //   label:    this.t('node.detail.detailTop.os'),
    //   content:  this.status.nodeInfo.osImage
    // },
    // {
    //   label:         this.t('node.detail.detailTop.containerRuntime'),
    //   // formatter:     'IconText',
    //   // formatterOpts: { iconClass: this.containerRuntimeIcon },
    //   content:       this.containerRuntimeVersion
    // }];
    return [];
  },

  warningCount() {
    return this.resourcesStatus.warningCount;
  },

  errorCount() {
    return this.resourcesStatus.errorCount;
  },

  resourcesStatus() {
    const nodeList = this.$rootGetters['cluster/all'](NODE);

    const warning = 0;
    let error = 0;

    nodeList.forEach((item) => {
      const status = item.getConditionStatus('Ready');

      if (status === 'False' || status === 'Unknown') {
        error += 1;
      }
    });

    return {
      warningCount: warning,
      errorCount:   error
    };
  },

  pods() {
    const allPods = this.$rootGetters['cluster/all'](POD);

    return allPods.filter(pod => pod.spec.nodeName === this.name);
  },

  runningPods() {
    return this.pods.filter(pod => pod.isRunning);
  },

  nodeRoleState() {
    const isExistRoleStatus = this.getLabelValue(NODE_ROLE_MASTER) !== undefined || this.getLabelValue(NODE_ROLE_CONTROL_PLANE) !== undefined;
    const promoteStatus = this.getAnnotationValue(HARVESTER_PROMOTE_STATUS) || 'none';

    if (!isExistRoleStatus && promoteStatus === 'complete') {
      return 'promoteRestart';
    } else if (isExistRoleStatus && promoteStatus === 'complete') {
      return 'promoteSucceed';
    }

    return promoteStatus;
  },

  isMaster() {
    return this.metadata?.labels?.[NODE_ROLE_MASTER] !== undefined || this.metadata?.labels?.[NODE_ROLE_CONTROL_PLANE] !== undefined;
  },

  confirmRemove() {
    return true;
  },

  // You need to preload CAPI.MACHINEs to use this
  provisionedMachine() {
    const namespace = this.metadata?.annotations?.[CAPI_ANNOTATIONS.CLUSTER_NAMESPACE];
    const name = this.metadata?.annotations?.[CAPI_ANNOTATIONS.MACHINE_NAME];

    if ( namespace && name ) {
      return this.$rootGetters['management/byId'](CAPI.MACHINE, `${ namespace }/${ name }`);
    }
  },
};

function calculatePercentage(allocatable, capacity) {
  const c = Number.parseFloat(capacity);
  const a = Number.parseFloat(allocatable);
  const percent = (((c - a) / c) * 100);

  return formatPercent(percent);
}
