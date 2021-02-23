export const NORMAN_NAME = 'field.cattle.io/name';
export const DESCRIPTION = 'field.cattle.io/description';
export const HOSTNAME = 'kubernetes.io/hostname';
export const TIMESTAMP = 'cattle.io/timestamp';
export const SYSTEM_NAMESPACE = 'management.cattle.io/system-namespace';
export const PROJECT = 'field.cattle.io/projectId';
export const SYSTEM_PROJECT = 'authz.management.cattle.io/system-project';
export const CONTAINER_DEFAULT_RESOURCE_LIMIT = 'field.cattle.io/containerDefaultResourceLimit';
export const CATTLE_PUBLIC_ENDPOINTS = 'field.cattle.io/publicEndpoints';
export const TARGET_WORKLOADS = 'field.cattle.io/targetWorkloadIds';
export const UI_MANAGED = 'management.cattle.io/ui-managed';

export const KUBERNETES = {
  SERVICE_ACCOUNT_UID:  'kubernetes.io/service-account.uid',
  SERVICE_ACCOUNT_NAME: 'kubernetes.io/service-account.name',
  MANAGED_BY:           'app.kubernetes.io/managed-by',
  MANAGED_NAME:         'app.kubernetes.io/name',
  INSTANCE:             'app.kubernetes.io/instance',
};

export const RIO = { STACK: 'rio.cattle.io/stack' };

export const CERTMANAGER = { ISSUER: 'cert-manager.io/issuer-name' };

export const STORAGE = { DEFAULT_STORAGE_CLASS: 'storageclass.kubernetes.io/is-default-class' };

export const NODE_ROLES = {
  CONTROL_PLANE: 'node-role.kubernetes.io/controlplane',
  WORKER:        'node-role.kubernetes.io/worker',
  ETCD:          'node-role.kubernetes.io/etcd',
};

export const CATALOG = {
  CERTIFIED:     'catalog.cattle.io/certified',
  _RANCHER:      'rancher',
  _PARTNER:      'partner',
  _OTHER:         'other',

  EXPERIMENTAL:  'catalog.cattle.io/experimental',
  NAMESPACE:     'catalog.cattle.io/namespace',
  RELEASE_NAME:  'catalog.cattle.io/release-name',

  REQUIRES_GVK:     'catalog.cattle.io/requires-gvr',
  PROVIDES:         'catalog.cattle.io/provides-gvr',
  AUTO_INSTALL_GVK: 'catalog.cattle.io/auto-install-gvr',
  AUTO_INSTALL:     'catalog.cattle.io/auto-install',
  HIDDEN:           'catalog.cattle.io/hidden',

  SCOPE:            'catalog.cattle.io/scope',
  _MANAGEMENT:      'management',
  _DOWNSTREAM:      'downstream',

  COMPONENT:        'catalog.cattle.io/ui-component',
  SOURCE_REPO_TYPE: 'catalog.cattle.io/ui-source-repo-type',
  SOURCE_REPO_NAME: 'catalog.cattle.io/ui-source-repo',
  COLOR:            'catalog.cattle.io/ui-color',
  DISPLAY_NAME:     'catalog.cattle.io/display-name',

  SUPPORTED_OS: 'catalog.cattle.io/os',
};

export const FLEET = {
  CLUSTER_DISPLAY_NAME: 'management.cattle.io/cluster-display-name',
  CLUSTER_NAME:         'management.cattle.io/cluster-name',
  BUNDLE_ID:            'fleet.cattle.io/bundle-id',
};

export const RBAC = { PRODUCT: 'management.cattle.io/ui-product' };

export const RKE = { EXTERNAL_IP: 'rke.cattle.io/external-ip' };

export const ISTIO = { AUTO_INJECTION: 'istio-injection' };

const CATTLE_REGEX = /cattle\.io\//;

export const LABELS_TO_IGNORE_REGEX = [
  CATTLE_REGEX
];

export const ANNOTATIONS_TO_IGNORE_REGEX = [
  CATTLE_REGEX
];

export const ANNOTATIONS_TO_FOLD = [
  /^kubectl\.kubernetes\.io\/.*$/,
  /^objectset\.rio\.cattle\.io\/.*$/,
];

// VM
export const STORAGE_CLASS_LABEL = { DEFAULT_CALSS: 'storageclass.kubernetes.io/is-default-class' };

export const DATA_VOLUME_OWNEDBY = 'harvester.cattle.io/owned-by';

export const HARVESTER_CREATOR = 'harvester.cattle.io/creator';

export const HARVESTER_IMAGE_NAME = 'harvester.cattle.io/vmName';

export const HARVESTER_DISK_NAMES = 'harvester.cattle.io/diskNames';

export const HARVESTER_SSH_NAMES = 'harvester.cattle.io/sshNames';

export const HARVESTER_NETWORK_IPS = 'networks.harvester.cattle.io/ips';

export const HARVESTER_NETWORK_STATUS = 'k8s.v1.cni.cncf.io/network-status';

export const HARVESTER_TEMPLATE_VERSION_CUSTOM_NAME = 'harvester.cattle.io/customName';

export const HOST_CUSTOM_NAME = 'harvester.cattle.io/host-custom-name';

export const HARVESTER_VOLUME_CREATEDBY = 'kubevirt.io/created-by';

export const HARVESTER_UPGRADESTATE = 'harvester.cattle.io/upgradeState';

// node role
export const NODE_ROLE_MASTER = 'node-role.kubernetes.io/master';
export const NODE_ROLE_CONTROL_PLANE = 'node-role.kubernetes.io/control-plane';
export const HARVESTER_PROMOTE_STATUS = 'harvester.cattle.io/promote-status';
export const HARVESTER_RESTORE_NAME = 'restore.harvester.io/name';

// backup
export const HARVESTER_BACKUP_TARGET = 'backup.harvester.io/backupTarget';
