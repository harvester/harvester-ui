import {
  IMAGE, VM, SSH, VM_TEMPLATE, DATA_VOLUME, HARVESTER_COMBINE_USER, NODE,
  HARVESTER_SETTING, NETWORK_ATTACHMENT, HARVESTER_BACKUP, HARVESTER_CLUSTER_NETWORK, NORMAN, HARVESTER_USER, MANAGEMENT
} from '@/config/types';
import { DSL } from '@/store/type-map';
import { copyResourceValues } from '@/models/harvester.combine.user';

export const NAME = 'virtual';

const TEMPLATE = VM_TEMPLATE.version;

export function init(store) {
  const {
    product,
    basicType,
    configureType,
    virtualType,
    spoofedType,
    mapType,
    componentForType
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
    // HARVESTER_COMBINE_USER,
    HARVESTER_USER,
    HARVESTER_SETTING
  ], 'advanced');

  configureType(HARVESTER_CLUSTER_NETWORK, { realResource: HARVESTER_SETTING });
  // componentForType(HARVESTER_COMBINE_USER, HARVESTER_USER);
  // configureType(MANAGEMENT.USER, { realResource: HARVESTER_COMBINE_USER });
  configureType(MANAGEMENT.USER, { realResource: HARVESTER_USER });
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
    // name:       HARVESTER_COMBINE_USER,
    name:       HARVESTER_USER,
    weight:     87,
    route:      {
      name:     'c-cluster-product-resource',
      // params:   { resource: HARVESTER_COMBINE_USER }
      params:   { resource: HARVESTER_USER }
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

  spoofedType({
    label:             'User',
    type:              HARVESTER_COMBINE_USER,
    collectionMethods: ['POST'],
    schemas:           [
      {
        id:                HARVESTER_COMBINE_USER,
        type:              'schema',
        resourceFields:    { filters: { type: 'string' } },
        collectionMethods: ['POST'],
      }
    ],
    getInstances: async() => {
      await store.dispatch('auth/getAuthModes');
      const isRancher = store.getters['auth/isRancher'];

      if (!isRancher) {
        const harvesterUsers = store.dispatch('management/findAll', { type: HARVESTER_USER });

        return harvesterUsers;
      }

      const v3UsersPromise = store.dispatch('management/findAll', { type: NORMAN.USER, opt: { url: '/v3/users' } });
      const managementUsersPromise = store.dispatch('management/findAll', { type: MANAGEMENT.USER });
      const [v3Users, managementUsers] = await Promise.all([v3UsersPromise, managementUsersPromise]);

      return managementUsers.filter(mu => v3Users.find(vu => mu.id === vu.id));

      // return v3Users.map((v) => {
      //   const template = managementUsers.find(m => m.id === v.id);
      //   const instance = {
      //     id:              v.id,
      //     type:            HARVESTER_COMBINE_USER,
      //     status:          v.status,
      //     links:           { self: template.links.self },
      //     template
      //   };

      //   copyResourceValues(template, instance);

      //   return instance;
      // });
    }
  });

  // mapType(HARVESTER_COMBINE_USER, 'User');
}
