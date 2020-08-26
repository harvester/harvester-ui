export const DESCRIPTION = 'cattle.io/description';
export const HOSTNAME = 'kubernetes.io/hostname';
export const TIMESTAMP = 'cattle.io/timestamp';
export const SYSTEM_NAMESPACE = 'cattle.io/system';
export const PROJECT = 'field.cattle.io/projectId';
export const SYSTEM_PROJECT = 'authz.management.cattle.io/system-project';
export const CONTAINER_DEFAULT_RESOURCE_LIMIT = 'field.cattle.io/containerDefaultResourceLimit';

export const KUBERNETES = {
  SERVICE_ACCOUNT_UID:  'kubernetes.io/service-account.uid',
  SERVICE_ACCOUNT_NAME: 'kubernetes.io/service-account.name'
};

export const RIO = { STACK: 'rio.cattle.io/stack' };

export const CERTMANAGER = { ISSUER: 'cert-manager.io/issuer-name' };

export const STORAGE_CLASS_LABEL = { DEFAULT_CALSS: 'storageclass.kubernetes.io/is-default-class' };

export const NODE_ROLES = {
  CONTROL_PLANE: 'node-role.kubernetes.io/controlplane',
  WORKER:        'node-role.kubernetes.io/worker',
  ETCD:          'node-role.kubernetes.io/etcd',
};

export const CATALOG = {
  CERTIFIED:     'catalog.rancher.io/certified',
  _RANCHER:      'rancher',
  _PARTNER:      'partner',
  _OTHER:         'other',
  EXPERIMENTAL:  'catalog.rancher.io/experimental',
  NAMESPACE:     'catalog.rancher.io/namespace',
  RELEASE_NAME:  'catalog.rancher.io/release-name',
};

export const RKE = { EXTERNAL_IP: 'rke.cattle.io/external-ip' };

// TODO consult w/ backend about what labels & annotations to hide from editing
export const LABEL_PREFIX_TO_IGNORE = [
];

export const ANNOTATIONS_TO_IGNORE_CONTAINS = [
];

export const ANNOTATIONS_TO_IGNORE_PREFIX = [
  DESCRIPTION
];

export const ANNOTATIONS_TO_FOLD = [
  /^kubectl\.kubernetes\.io\/.*$/,
  /^objectset\.rio\.cattle\.io\/.*$/,
];

export const LABEL_IMAGE = {
  'harvester.cattle.io/format': 'raw',
  'harvester.cattle.io/os':     'linux'
};
