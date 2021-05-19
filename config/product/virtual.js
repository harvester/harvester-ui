import {
  IMAGE, VM, SSH, CONFIG_MAP, VM_TEMPLATE, DATA_VOLUME, NODE,
  HARVESTER_SETTING, NETWORK_ATTACHMENT, HARVESTER_BACKUP,
  HARVESTER_CLUSTER_NETWORK, NAMESPACE, RBAC
} from '@/config/types';
import { DSL } from '@/store/type-map';

export const NAME = 'virtual';

const TEMPLATE = VM_TEMPLATE.version;
const MEMBER = 'member';

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
    label:        'Dashboard',
    group:        'Root',
    labelDisplay: 'harvester.nav.dashboard',
    namespaced:   false,
    name:         'virtual-dashboard',
    weight:       500,
    route:        { name: 'c-cluster-virtual' },
    exact:        true,
  });

  basicType([NODE]);
  virtualType({
    ifHaveType:    NODE,
    label:        'Hosts',
    group:        'Root',
    name:         NODE,
    namespaced:  false,
    weight:       399,
    route:        {
      name:   'c-cluster-product-resource',
      params: { resource: NODE }
    },
    exact: false,
  });

  basicType([NAMESPACE]);
  virtualType({
    ifHaveType:    NODE,
    label:        'Namespace',
    name:         NAMESPACE,
    namespaced:  true,
    weight:       389,
    route:        {
      name:   'c-cluster-product-resource',
      params: { resource: NAMESPACE }
    },
    exact: false,
  });

  basicType([VM]);
  virtualType({
    label:      'Virtual Machines',
    group:      'root',
    name:       VM,
    namespaced:  true,
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
    name:       DATA_VOLUME,
    namespaced:  true,
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
    name:       IMAGE,
    namespaced:  true,
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
    MEMBER,
    SSH,
    CONFIG_MAP,
    HARVESTER_SETTING
  ], 'advanced');

  configureType(HARVESTER_CLUSTER_NETWORK, { realResource: HARVESTER_SETTING, showState: false });
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

  configureType(HARVESTER_BACKUP, {
    customCreateText:    'harvester.backUpPage.createText',
    DisableEditInDetail: true,
  });

  virtualType({
    label:      'Backup',
    group:      'root',
    name:       HARVESTER_BACKUP,
    namespaced:  false,
    weight:     200,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: HARVESTER_BACKUP }
    },
    exact: false,
  });

  configureType(MEMBER, {
    displayName: 'Member',
    location:    {
      name:    'c-cluster-product-resource',
      params:  { resource: MEMBER },
    },
    resource:          RBAC.ROLE_BINDING,
    useCustomInImport: true
  });
  virtualType({
    label:          'Member',
    group:      'root',
    name:           MEMBER,
    weight:         199,
    route:          {
      name:     'c-cluster-product-resource',
      params:   { resource: MEMBER }
    },
  });

  configureType(NETWORK_ATTACHMENT, { isEditable: false, showState: false });
  virtualType({
    label:      'Networks',
    group:      'root',
    name:       NETWORK_ATTACHMENT,
    namespaced:  true,
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
    name:       SSH,
    namespaced:  true,
    weight:     170,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: SSH }
    },
    exact: false,
  });

  virtualType({
    label:      'Cloud Init Templates',
    group:      'root',
    namespaced:  true,
    name:       CONFIG_MAP,
    weight:     87,
    route:      {
      name:     'c-cluster-product-resource',
      params:   { resource: CONFIG_MAP }
    },
    exact: false,
  });

  virtualType({
    ifHaveType: HARVESTER_SETTING,
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
  configureType(HARVESTER_SETTING, { isCreatable: false, showState: false });
}
