import { CONFIG_MAP, HCI, NODE } from '@/config/types';

import { DSL } from '@/store/type-map';

export const NAME = 'virtual';

const TEMPLATE = HCI.VM_VERSION;

export function init(store) {
  const {
    product,
    basicType,
    configureType,
    virtualType,
  } = DSL(store, NAME);

  product({
    removable:           false,
    showNamespaceFilter: true,
    showClusterSwitcher: false,
    icon:                'compass'
  });

  basicType(['virtual-dashboard']);
  virtualType({
    ifHaveType:    NODE,
    group:        'Root',
    labelDisplay: 'harvester.nav.dashboard',
    namespaced:   true,
    name:         'virtual-dashboard',
    weight:       500,
    route:        { name: 'c-cluster-virtual' },
    exact:        true,
  });

  basicType([NODE]);
  virtualType({
    ifHaveType:    NODE,
    group:        'Root',
    name:         NODE,
    namespaced:  true,
    weight:       399,
    route:        {
      name:   'c-cluster-product-resource',
      params: { resource: NODE }
    },
    exact: false,
  });

  basicType(['projects-namespaces']);
  virtualType({
    ifHaveType:       NODE,
    label:            'Projects/Namespaces',
    group:            'cluster',
    // icon:             'globe',
    namespaced:  true,
    // ifRancherCluster: true,
    name:             'projects-namespaces',
    weight:           398,
    route:            { name: 'c-cluster-product-projectsnamespaces' },
    exact:            true,
  });

  basicType([HCI.VM]);
  virtualType({
    label:      'Virtual Machines',
    group:      'root',
    name:       HCI.VM,
    namespaced:  true,
    weight:     299,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HCI.VM }
    },
    exact: false,
  });

  basicType([HCI.DATA_VOLUME]);
  virtualType({
    label:      'Volumes',
    group:      'root',
    name:       HCI.DATA_VOLUME,
    namespaced:  true,
    weight:     199,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HCI.DATA_VOLUME }
    },
    exact: false,
  });

  basicType([HCI.IMAGE]);
  virtualType({
    label:      'Images',
    group:      'root',
    name:       HCI.IMAGE,
    namespaced:  true,
    weight:     99,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HCI.IMAGE }
    },
    exact: false,
  });

  basicType([
    TEMPLATE,
    HCI.NETWORK_ATTACHMENT,
    HCI.BACKUP,
    HCI.SSH,
    CONFIG_MAP,
    HCI.SETTING
  ], 'advanced');

  configureType(HCI.CLUSTER_NETWORK, { realResource: HCI.SETTING, showState: false });
  virtualType({
    label:      'VM Templates',
    group:      'root',
    name:       TEMPLATE,
    namespaced:  true,
    weight:     289,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: TEMPLATE }
    },
    exact: false,
  });

  configureType(HCI.BACKUP, {
    DisableEditInDetail: true,
    showListMasthead:    false
  });
  virtualType({
    name:       HCI.BACKUP,
    namespaced:  true,
    weight:     200,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HCI.BACKUP }
    },
    exact: false,
  });

  configureType(HCI.NETWORK_ATTACHMENT, { isEditable: false, showState: false });
  virtualType({
    name:       HCI.NETWORK_ATTACHMENT,
    namespaced:  true,
    weight:     189,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HCI.NETWORK_ATTACHMENT }
    },
    exact: false,
  });

  virtualType({
    label:      'SSH Keys',
    name:       HCI.SSH,
    namespaced:  true,
    weight:     170,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HCI.SSH }
    },
    exact: false,
  });

  virtualType({
    name:        CONFIG_MAP,
    namespaced:  true,
    weight:      87,
    route:       {
      name:      'c-cluster-product-resource',
      params:    { resource: CONFIG_MAP }
    },
    exact: false,
  });

  // settings
  configureType(HCI.SETTING, { isCreatable: false });
  virtualType({
    ifHaveType: HCI.SETTING,
    name:       HCI.SETTING,
    namespaced: true,
    weight:     -1,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HCI.SETTING }
    },
    exact: false
  });
}
