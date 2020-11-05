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
    icon:        'icons icon-h-home',
    exact:       true,
  });

  basicType(['virtual-node']);
  virtualType({
    label:       'Host',
    group:      'Root',
    namespaced:  false,
    name:        'virtual-node',
    weight:      399,
    route:       {
      name:   'c-cluster-product-resource',
      params: { resource: 'node' }
    },
    icon:        'icons icon-h-home',
    exact:       false,
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
    icon:       'icons icon-h-display',
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
    icon:       'icons icon-h-drawer',
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
    icon:       'icons icon-h-key',
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
    icon:       'icons icon-h-copy',
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
    icon:       'icons icon-h-database',
    exact: false,
  });
}
