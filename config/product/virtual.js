import { HCI, NODE, CONFIG_MAP } from '@/config/types';
import {
  STATE, NAME as NAME_COL, AGE, NAMESPACE, IMAGE_DOWNLOAD_SIZE
} from '@/config/table-headers';

import { DSL } from '@/store/type-map';

export const NAME = 'virtual';

const TEMPLATE = HCI.VM_VERSION;
const CLOUD_TEMPLATE = 'cloudTemplate';
const HOST = 'host';

export function init(store) {
  const {
    product,
    basicType,
    headers,
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

  configureType(HOST, {
    location:    {
      name:    'c-cluster-product-resource',
      params:  { resource: HOST },
    },
    resource:          NODE,
    useCustomInImport: true
  });

  configureType(HOST, { isCreatable: false, isEditable: true });
  basicType([HOST]);
  virtualType({
    ifHaveType:    NODE,
    group:        'Root',
    labelDisplay: 'harvester.typeLabel.host',
    name:         HOST,
    label:        'Hosts',
    namespaced:   true,
    weight:       399,
    route:        {
      name:   'c-cluster-product-resource',
      params: { resource: HOST }
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
  headers(HCI.IMAGE, [STATE, NAME_COL, NAMESPACE, /* IMAGE_PROGRESS, IMAGE_MESSAGE, */IMAGE_DOWNLOAD_SIZE, AGE]);
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
    CLOUD_TEMPLATE,
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

  configureType(CLOUD_TEMPLATE, {
    location:    {
      name:    'c-cluster-product-resource',
      params:  { resource: CLOUD_TEMPLATE },
    },
    resource:          CONFIG_MAP,
    useCustomInImport: true
  });
  virtualType({
    name:         CLOUD_TEMPLATE,
    label:        'Cloud config Templates',
    labelDisplay: 'harvester.typeLabel.cloudTemplate',
    namespaced:   true,
    weight:       87,
    route:        {
      name:      'c-cluster-product-resource',
      params:    { resource: CLOUD_TEMPLATE }
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
