import Vue from 'vue';
import { formatPercent } from '@/utils/string';
import { NODE_ROLES, RKE, HOST_CUSTOM_NAME } from '@/config/labels-annotations.js';
import { METRIC, POD, NODE } from '@/config/types';
import { parseSi } from '@/utils/units';
import { PRIVATE } from '@/plugins/steve/resource-proxy';
import findLast from 'lodash/findLast';

export default {
  availableActions() {
    const cordon = {
      action:     'cordon',
      enabled:    this.hasLink('update') && this.isWorker && !this.isCordoned,
      icon:       'icon icon-fw icon-pause',
      label:      'Cordon',
      total:      1,
      bulkable:   true
    };

    const uncordon = {
      action:     'uncordon',
      enabled:    this.hasLink('update') && this.isWorker && this.isCordoned,
      icon:       'icon icon-fw icon-play',
      label:      'Uncordon',
      total:      1,
      bulkable:   true
    };

    return [
      cordon,
      uncordon,
      ...this._standardActions
    ];
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
    return this.hasCondition('PIDPressure', 'False');
  },

  isDiskPressureOk() {
    return this.hasCondition('DiskPressure', 'False');
  },

  isMemoryPressureOk() {
    return this.hasCondition('MemoryPressure', 'False');
  },

  isKubeletOk() {
    return this.hasCondition('Ready');
  },

  isCordoned() {
    return !!this.spec.unschedulable;
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
    return async() => {
      Vue.set(this.spec, 'unschedulable', true);
      await this.save();
    };
  },

  uncordon() {
    return async() => {
      Vue.set(this.spec, 'unschedulable', false);
      await this.save();
    };
  },

  state() {
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

    let warning = 0;
    let error = 0;

    nodeList.forEach((item) => {
      const status = item.getConditionStatus('Ready');

      if (status === 'False') {
        error += 1;
      } else if (status === 'Unknown') {
        warning += 1;
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
  }
};

function calculatePercentage(allocatable, capacity) {
  const c = Number.parseFloat(capacity);
  const a = Number.parseFloat(allocatable);
  const percent = (((c - a) / c) * 100);

  return formatPercent(percent);
}
