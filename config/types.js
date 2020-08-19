// --------------------------------------
// 1. Provided by Steve and always potentialy available
// --------------------------------------

// Standalone steve
// Base: /v1
export const STEVE = {
  PREFERENCE: 'userpreference',
  CLUSTER:    'cluster',
};

// Auth (via Norman)
// Base: /v3
export const NORMAN = {
  AUTH_CONFIG: 'authconfig',
  PRINCIPAL:   'principal',
  SETTING:     'setting',
};

// Public (via Norman)
// Base: /v3-public
export const PUBLIC = { AUTH_PROVIDER: 'authprovider' };

// Common native k8s types (via Steve)
// Base: /k8s/clusters/<id>/v1/
export const API_GROUP = 'apiGroups';
export const CONFIG_MAP = 'configmap';
export const COUNT = 'count';
export const EVENT = 'event';
export const HPA = 'autoscaling.horizontalpodautoscaler';
export const INGRESS = 'networking.k8s.io.ingress';
export const NAMESPACE = 'namespace';
export const NODE = 'node';
export const NETWORK_POLICY = 'networking.k8s.io.networkpolicy';
export const POD = 'pod';
export const PV = 'persistentvolume';
export const PVC = 'persistentvolumeclaim';
export const RESOURCE_QUOTA = 'resourcequota';
export const SCHEMA = 'schema';
export const SERVICE = 'service';
export const SECRET = 'secret';
export const SERVICE_ACCOUNT = 'serviceaccount';
export const STORAGE_CLASS = 'storage.k8s.io.storageclass';

export const RBAC = {
  ROLE:                 'rbac.authorization.k8s.io.role',
  CLUSTER_ROLE:         'rbac.authorization.k8s.io.clusterrole',
  ROLE_BINDING:         'rbac.authorization.k8s.io.rolebinding',
  CLUSTER_ROLE_BINDING: 'rbac.authorization.k8s.io.clusterrolebinding',
};

export const WORKLOAD = 'workload';

// The types that are aggregated into a "workload"
export const WORKLOAD_TYPES = {
  DEPLOYMENT:             'apps.deployment',
  DAEMON_SET:             'apps.daemonset',
  STATEFUL_SET:           'apps.statefulset',
  CRON_JOB:               'batch.cronjob',
  JOB:                    'batch.job',
  REPLICA_SET:            'apps.replicaset',
  REPLICATION_CONTROLLER: 'replicationcontroller'
};

export const METRIC = {
  NODE: 'metrics.k8s.io.nodemetrics',
  POD:  'metrics.k8s.io.podmetrics',
};

export const CATALOG = {
  CLUSTER_REPO: 'catalog.cattle.io.clusterrepo',
  OPERATION:    'catalog.cattle.io.operation',
  RELEASE:      'catalog.cattle.io.release',
  REPO:         'catalog.cattle.io.repo',
};

// --------------------------------------
// 2. Only if Rancher is installed
// --------------------------------------

// Rancher Management API (via Steve)
// Base: /v1
export const MANAGEMENT = {
  CATALOG_TEMPLATE: 'management.cattle.io.catalogtemplate',
  CATALOG:          'management.cattle.io.catalog',
  CLUSTER:          'management.cattle.io.cluster',
  GROUP:            'management.cattle.io.group',
  NODE_POOL:        'management.cattle.io.nodepool',
  NODE_TEMPLATE:    'management.cattle.io.nodetemplate',
  PROJECT:          'management.cattle.io.project',
  USER:             'management.cattle.io.user',
};

// Rancher cluster-scoped things that actually live in management plane
// Base: /v1/management.cattle.io.clusters/<id>/
export const EXTERNAL = {
  PROJECT: 'project',
  APP:     'app',
};

// --------------------------------------
// 3. Optional add-on packages in a cluster
// --------------------------------------
// Base: /k8s/clusters/<id>/v1/

export const RIO = {
  CLUSTER_DOMAIN:   'admin.rio.cattle.io.clusterdomain',
  FEATURE:          'admin.rio.cattle.io.feature',
  INFO:             'admin.rio.cattle.io.rioinfo',
  PUBLIC_DOMAIN:    'admin.rio.cattle.io.publicdomain',

  APP:              'rio.cattle.io.app',
  EXTERNAL_SERVICE: 'rio.cattle.io.externalservice',
  STACK:            'rio.cattle.io.stack',
  ROUTER:           'rio.cattle.io.router',
  SERVICE:          'rio.cattle.io.service',

  SYSTEM_NAMESPACE: 'rio-system',
};

export const GATEKEEPER = { CONSTRAINT_TEMPLATE: 'templates.gatekeeper.sh.constrainttemplate' };

// rancher vm

export const VM_TEMPLATE = {
  template: 'harvester.cattle.io.virtualmachinetemplate',
  version:  'harvester.cattle.io.virtualmachinetemplateversion'
};

export const VMI = 'kubevirt.io.virtualmachineinstance';
export const VM = 'kubevirt.io.virtualmachine';
export const IMAGE = 'harvester.cattle.io.virtualmachineimage';
export const SSH = 'harvester.cattle.io.keypair';
export const NETWORK_ATTACHMENT = 'k8s.cni.cncf.io.networkattachmentdefinition';
export const DATA_VOLUME = 'cdi.kubevirt.io.datavolume';
