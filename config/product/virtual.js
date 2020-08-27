import {
  CONFIG_MAP, HELM_RELEASE,
  NAMESPACE, NODE, SECRET, INGRESS,
  WORKLOAD, WORKLOAD_TYPES, SERVICE, HPA, NETWORK_POLICY, PV, PVC, STORAGE_CLASS, POD,
  RBAC, IMAGE, VM, SSH, VM_TEMPLATE, DATA_VOLUME
} from '@/config/types';

import {
  STATE, NAME as NAME_COL, NAMESPACE_NAME, NAMESPACE as NAMESPACE_COL, AGE, KEYS,
  INGRESS_TARGET, ROLES, VERSION, INTERNAL_EXTERNAL_IP, CPU, RAM,
  SPEC_TYPE, TARGET_PORT, SELECTOR
} from '@/config/table-headers';

import { DSL } from '@/store/type-map';

export const NAME = 'virtual';

const TEMPLATE = VM_TEMPLATE.template;

export function init(store) {
  const {
    product,
    basicType,
    ignoreType,
    mapGroup,
    weightGroup,
    headers,
    virtualType,
    componentForType,
    uncreatableType,
    immutableType
  } = DSL(store, NAME);

  product({
    removable:           false,
    showNamespaceFilter: true,
    icon:                'compass'
  });

  basicType([VM]);
  virtualType({
    label:      'Virtual Machine',
    group:      'root',
    namespaced: true,
    name:       VM,
    weight:     299,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: VM }
    },
    exact: true,
  });

  basicType([IMAGE]);
  virtualType({
    label:      'Image',
    group:      'root',
    namespaced: true,
    name:       IMAGE,
    weight:     199,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: IMAGE }
    },
    exact: true,
  });

  basicType([SSH]);
  virtualType({
    label:      'SSH Keys',
    group:      'root',
    namespaced: true,
    name:       SSH,
    weight:     99,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: SSH }
    },
    exact: true,
  });

  basicType([TEMPLATE]);
  virtualType({
    label:      'Templates',
    group:      'root',
    namespaced: true,
    name:       TEMPLATE,
    weight:     89,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: TEMPLATE }
    },
    exact: true,
  });

  basicType([DATA_VOLUME]);
  virtualType({
    label:      'Volumes',
    group:      'root',
    namespaced: true,
    name:       DATA_VOLUME,
    weight:     88,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: DATA_VOLUME }
    },
    exact: true,
  });

  // basicType([
  //   PV,
  //   PVC,
  //   SECRET,
  //   STORAGE_CLASS,
  //   CONFIG_MAP
  // ], 'storage');

  // basicType([
  //   RBAC.ROLE,
  //   RBAC.CLUSTER_ROLE,
  //   RBAC.ROLE_BINDING,
  //   RBAC.CLUSTER_ROLE_BINDING,
  // ], 'rbac');

  weightGroup('storage', 96, true);
  weightGroup('rbac', 95, true);

  mapGroup('rbac.authorization.k8s.io', 'RBAC');

  uncreatableType(NODE);
  immutableType(NODE);

  headers(CONFIG_MAP, [NAMESPACE_NAME, KEYS, AGE]);
  headers(SECRET, [
    STATE,
    NAMESPACE_NAME,
    {
      name:      'type',
      label:     'Type',
      value:     'tableTypeDisplay',
      sort:      ['typeDisplay', 'nameSort'],
      width:     100,
      formatter: 'SecretType'
    },
    {
      name:      'data',
      label:     'Data',
      value:     'dataPreview',
      formatter: 'SecretData'
    },
    AGE
  ]);

  headers(VM, [
    {
      ...STATE,
      value:     'id',
      formatter: 'vmState',
    },
    NAME_COL,
    NAMESPACE_COL,
    {
      name:      'node',
      label:     'Node',
      value:     'id',
      formatter: 'nodeName'
    },
    {
      name:      'ip',
      label:     'IP Address',
      value:     'id',
      formatter: 'ipAddress'
    },
    AGE
  ]);

  headers(TEMPLATE, [
    NAME_COL,
    NAMESPACE_COL,
    {
      name:      'default',
      label:     'Default version',
      value:     'status.defaultVersion',
    },
    {
      name:      'latest',
      label:     'Latest version',
      value:     'status.latestVersion',
    },
    AGE
  ]);
}
