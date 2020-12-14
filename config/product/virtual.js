import {
  IMAGE, VM, SSH, VM_TEMPLATE, DATA_VOLUME, HARVESTER_USER, NODE, HARVESTER_SETTING, NETWORK_ATTACHMENT
} from '@/config/types';
import { DSL } from '@/store/type-map';

export const NAME = 'virtual';

const TEMPLATE = VM_TEMPLATE.version;

export function init(store) {
  const {
    product,
    basicType,
    virtualType,
    uncreatableType
  } = DSL(store, NAME);

  product({
    removable:           false,
    showNamespaceFilter: false,
    showClusterSwitcher: false,
    icon:                'compass'
  });

  basicType(['virtual-dashboard']);
  virtualType({
    label:        'Dashboard',
    group:        'Root',
    namespaced:   false,
    labelDisplay: 'harvester.nav.dashboard',
    name:         'virtual-dashboard',
    weight:       500,
    route:        { name: 'c-cluster-virtual' },
    // icon:        'icons icon-h-home',
    exact:        true,
  });

  basicType([NODE]);
  virtualType({
    label:        'Hosts',
    group:        'Root',
    namespaced:   false,
    name:         NODE,
    weight:       399,
    route:        {
      name:   'c-cluster-product-resource',
      params: { resource: NODE }
    },
    // icon:        'icons icon-h-host',
    exact: false,
  });

  basicType([VM]);
  virtualType({
    label:      'Virtual Machines',
    group:      'root',
    namespaced: true,
    name:       VM,
    weight:     299,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: VM }
    },
    // icon:       'icons icon-h-display',
    exact: false,
  });

  basicType([DATA_VOLUME]);
  virtualType({
    label:      'Volumes',
    group:      'root',
    namespaced: true,
    name:       DATA_VOLUME,
    weight:     199,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: DATA_VOLUME }
    },
    // icon:       'icons icon-h-database',
    exact: false,
  });

  basicType([IMAGE]);
  virtualType({
    label:      'Images',
    group:      'root',
    namespaced: true,
    name:       IMAGE,
    weight:     99,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: IMAGE }
    },
    // icon:       'icons icon-h-drawer',
    exact: false,
  });

  basicType([
    TEMPLATE,
    NETWORK_ATTACHMENT,
    SSH,
    HARVESTER_USER,
    HARVESTER_SETTING
  ], 'advanced');

  virtualType({
    label:      'VM Templates',
    group:      'root',
    namespaced: true,
    name:       TEMPLATE,
    weight:     289,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: TEMPLATE }
    },
    // icon:       'icons icon-h-copy',
    exact: false,
  });

  virtualType({
    label:      'Networks',
    group:      'root',
    namespaced: true,
    name:       NETWORK_ATTACHMENT,
    weight:     189,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: NETWORK_ATTACHMENT }
    },
    // icon:       'icons icon-h-network',
    exact: false,
  });

  virtualType({
    label:      'SSH Keys',
    group:      'root',
    namespaced: true,
    name:       SSH,
    weight:     89,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: SSH }
    },
    // icon:       'icons icon-h-key',
    exact: false,
  });

  virtualType({
    label:      'Users',
    group:      'root',
    namespaced:  true,
    name:       HARVESTER_USER,
    weight:     87,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HARVESTER_USER }
    },
    // icon:       'icons icon-h-user',
    exact: false,
  });

  uncreatableType(HARVESTER_SETTING);
  virtualType({
    label:      'Settings',
    group:      'root',
    namespaced:  true,
    name:       HARVESTER_SETTING,
    weight:     86,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HARVESTER_SETTING }
    },
    // icon:       'icons icon-h-setting',
    exact: false,
  });
}
