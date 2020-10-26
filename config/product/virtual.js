/* eslint-disable */
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

  basicType(['virtual-dashboard']);
  virtualType({
    label:       'Home',
    group:      'Root',
    namespaced:  false,
    name:        'virtual-dashboard',
    weight:      500,
    route:       { name: 'c-cluster-virtual' },
    exact:       true,
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

  weightGroup('storage', 96, true);
  weightGroup('rbac', 95, true);

  mapGroup('rbac.authorization.k8s.io', 'RBAC');

  uncreatableType(NODE);
  immutableType(NODE);
}
