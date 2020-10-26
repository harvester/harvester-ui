import {
  IMAGE, VM, SSH, VM_TEMPLATE, DATA_VOLUME
} from '@/config/types';

import { DSL } from '@/store/type-map';

export const NAME = 'virtual';

const TEMPLATE = VM_TEMPLATE.template;

export function init(store) {
  const {
    product,
    basicType,
    virtualType,
  } = DSL(store, NAME);

  product({
    removable:           false,
    showNamespaceFilter: false,
    showClusterSwitcher: false,
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
    exact: false,
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
    exact: false,
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
    exact: false,
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
    exact: false,
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
    exact: false,
  });
}
