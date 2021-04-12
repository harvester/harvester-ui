import {
  IMAGE, VM, SSH, CONFIG_MAP, VM_TEMPLATE, DATA_VOLUME, NODE,
  HARVESTER_SETTING, NETWORK_ATTACHMENT, HARVESTER_BACKUP, HARVESTER_CLUSTER_NETWORK, HARVESTER_USER, MANAGEMENT
} from '@/config/types';
import { DSL } from '@/store/type-map';

export const NAME = 'virtual';

const TEMPLATE = VM_TEMPLATE.version;

export function init(store) {
  const {
    product,
    basicType,
    configureType,
    virtualType,
    componentForType
  } = DSL(store, NAME);

  product({
    removable:           false,
    showNamespaceFilter: false,
    showClusterSwitcher: false,
    icon:                'compass'
  });

  configureType(HARVESTER_SETTING, { isCreatable: false, showState: false });

  basicType(['virtual-dashboard']);
  virtualType({
    label:        'Dashboard',
    group:        'Root',
    namespaced:   false,
    labelDisplay: 'harvester.nav.dashboard',
    name:         'virtual-dashboard',
    weight:       500,
    route:        { name: 'c-cluster-virtual' },
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
    exact: false,
  });

  basicType([
    TEMPLATE,
    NETWORK_ATTACHMENT,
    HARVESTER_BACKUP,
    SSH,
    CONFIG_MAP,
    HARVESTER_USER,
    HARVESTER_SETTING
  ], 'advanced');

  configureType(HARVESTER_CLUSTER_NETWORK, { realResource: HARVESTER_SETTING, showState: false });
  configureType(MANAGEMENT.USER, { realResource: HARVESTER_USER, showState: false });
  componentForType(MANAGEMENT.USER, HARVESTER_USER);
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
    exact: false,
  });

  configureType(HARVESTER_BACKUP, {
    customCreateText:    'harvester.backUpPage.createText',
    DisableEditInDetail: true,
  });
  virtualType({
    label:      'Backup',
    group:      'root',
    namespaced: false,
    name:       HARVESTER_BACKUP,
    weight:     200,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HARVESTER_BACKUP }
    },
    exact: false,
  });

  configureType(NETWORK_ATTACHMENT, { isEditable: false, showState: false });
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
    exact: false,
  });

  virtualType({
    label:      'SSH Keys',
    group:      'root',
    namespaced: true,
    name:       SSH,
    weight:     170,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: SSH }
    },
    exact: false,
  });

  virtualType({
    label:      'Users',
    group:      'root',
    namespaced:  false,
    name:       HARVESTER_USER,
    weight:     150,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HARVESTER_USER }
    },
    exact: false,
  });

  virtualType({
    label:      'Cloud Init Templates',
    group:      'root',
    namespaced: true,
    name:       CONFIG_MAP,
    weight:     87,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: CONFIG_MAP }
    },
    exact: false,
  });

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
    exact: false,
  });
}
