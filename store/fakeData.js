export const fakeCurrentCluster = {
  id:    'local',
  type:  'management.cattle.io.cluster',
  links: {
    apps:      'https://localhost:9443/v1/management.cattle.io.clusters/local/apps',
    projects:  'https://localhost:9443/v1/management.cattle.io.clusters/local/projects',
    remove:    'https://localhost:9443/v1/management.cattle.io.clusters/local',
    schemas:   'https://localhost:9443/v1/management.cattle.io.clusters/local/schemas',
    self:      'https://localhost:9443/v1/management.cattle.io.clusters/local',
    subscribe: 'https://localhost:9443/v1/management.cattle.io.clusters/local/subscribe',
    update:    'https://localhost:9443/v1/management.cattle.io.clusters/local'
  },
  apiVersion: 'management.cattle.io/v3',
  kind:       'Cluster',
  metadata:   {
    annotations: {
      'authz.management.cattle.io/creator-role-bindings':            '{"created":["cluster-owner"],"required":["cluster-owner"]}',
      'field.cattle.io/creatorId':                                   'user-pq9v5',
      'lifecycle.cattle.io/create.cluster-agent-controller-cleanup': 'true',
      'lifecycle.cattle.io/create.cluster-scoped-gc':                'true',
      'lifecycle.cattle.io/create.mgmt-cluster-rbac-remove':         'true'
    },
    creationTimestamp: '2020-10-21T06:29:18Z',
    fields:            [
      'local',
      '30m'
    ],
    finalizers: [
      'controller.cattle.io/cluster-agent-controller-cleanup',
      'controller.cattle.io/cluster-scoped-gc',
      'controller.cattle.io/cluster-provisioner-controller',
      'controller.cattle.io/mgmt-cluster-rbac-remove'
    ],
    generation:      250,
    name:            'local',
    resourceVersion: '9771',
    selfLink:        '/apis/management.cattle.io/v3/clusters/local',
    uid:             'f25c6d83-3845-4a7f-b00c-4dc2844439ce'
  },
  spec: {
    agentImageOverride:       '',
    answers:                  {},
    description:              '',
    desiredAgentImage:        '',
    desiredAuthImage:         '',
    displayName:              'local',
    dockerRootDir:            '/var/lib/docker',
    enableClusterAlerting:    false,
    enableClusterMonitoring:  false,
    enableNetworkPolicy:      null,
    internal:                 true,
    localClusterAuthEndpoint: { enabled: false },
    windowsPreferedCluster:   false
  },
  status: {
    agentImage:  '',
    allocatable: {
      cpu:    '0',
      memory: '0',
      pods:   '0'
    },
    appliedEnableNetworkPolicy:         false,
    appliedPodSecurityPolicyTemplateId: '',
    appliedSpec:                        {
      agentImageOverride:       '',
      answers:                  {},
      description:              '',
      desiredAgentImage:        '',
      desiredAuthImage:         '',
      displayName:              '',
      enableClusterAlerting:    false,
      enableClusterMonitoring:  false,
      enableNetworkPolicy:      null,
      internal:                 false,
      localClusterAuthEndpoint: { enabled: false },
      windowsPreferedCluster:   false
    },
    authImage:    '',
    capabilities: { loadBalancerCapabilities: {} },
    capacity:     {
      cpu:    '0',
      memory: '0',
      pods:   '0'
    },
    componentStatuses: [
      {
        conditions: [
          {
            message: 'ok',
            status:  'True',
            type:    'Healthy'
          }
        ],
        name: 'controller-manager'
      },
      {
        conditions: [
          {
            message: '{"health":"true"}',
            status:  'True',
            type:    'Healthy'
          }
        ],
        name: 'etcd-0'
      },
      {
        conditions: [
          {
            message: 'ok',
            status:  'True',
            type:    'Healthy'
          }
        ],
        name: 'scheduler'
      }
    ],
    conditions: [
      {
        lastUpdateTime: '2020-10-21T06:29:18Z',
        status:         'True',
        type:           'BackingNamespaceCreated'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:18Z',
        status:         'True',
        type:           'DefaultProjectCreated'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:18Z',
        status:         'True',
        type:           'SystemProjectCreated'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:18Z',
        status:         'True',
        type:           'InitialRolesPopulated'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:18Z',
        status:         'True',
        type:           'CreatorMadeOwner'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:18Z',
        status:         'True',
        type:           'Pending'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:18Z',
        message:        'waiting for full cluster configuration',
        reason:         'Pending',
        status:         'True',
        type:           'Provisioned'
      },
      {
        lastUpdateTime: '2020-10-21T06:59:31Z',
        message:        'Waiting for API to be available',
        status:         'True',
        type:           'Waiting'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:18Z',
        status:         'True',
        type:           'NoDiskPressure'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:18Z',
        status:         'True',
        type:           'NoMemoryPressure'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:19Z',
        status:         'False',
        type:           'AlertingEnabled'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:19Z',
        status:         'True',
        type:           'GlobalAdminsSynced'
      },
      {
        lastUpdateTime: '2020-10-21T06:29:33Z',
        status:         'True',
        type:           'Ready'
      }
    ],
    driver: 'local',
    limits: {
      cpu:    '0',
      memory: '0',
      pods:   '0'
    },
    requested: {
      cpu:    '0',
      memory: '0',
      pods:   '0'
    },
    version: {
      buildDate:    '2020-01-27T18:09:26Z',
      compiler:     'gc',
      gitCommit:    'cdab19b09a84389ffbf57bebd33871c60b1d6b28',
      gitTreeState: 'clean',
      gitVersion:   'v1.17.2+k3s1',
      goVersion:    'go1.13.6',
      major:        '1',
      minor:        '17',
      platform:     'linux/amd64'
    }
  }
};

export const fakeCurrentClusterLocal = {
  type:         'collection',
  links:        { self: 'https://localhost:9443/v1/management.cattle.io.project/local' },
  createTypes:  { 'management.cattle.io.project': 'https://localhost:9443/v1/management.cattle.io.projects' },
  actions:      {},
  resourceType: 'management.cattle.io.project',
  revision:     '9819',
  data:         [
    {
      id:    'local/p-2kqcn',
      type:  'management.cattle.io.project',
      links: {
        remove: 'https://localhost:9443/v1/management.cattle.io.projects/local/p-2kqcn',
        self:   'https://localhost:9443/v1/management.cattle.io.projects/local/p-2kqcn',
        update: 'https://localhost:9443/v1/management.cattle.io.projects/local/p-2kqcn',
        view:   'https://localhost:9443/apis/management.cattle.io/v3/namespaces/local/projects/p-2kqcn'
      },
      apiVersion: 'management.cattle.io/v3',
      kind:       'Project',
      metadata:   {
        annotations: {
          'authz.management.cattle.io/creator-role-bindings':                 '{"created":["project-owner"],"required":["project-owner"]}',
          'field.cattle.io/creatorId':                                        'user-pq9v5',
          'field.cattle.io/systemImageVersion':                               '{"alerting":"system-library-rancher-monitoring-0.1.0","logging":"system-library-rancher-logging-0.2.0","pipeline":"bf23ad9"}',
          'lifecycle.cattle.io/create.mgmt-project-rbac-remove':              'true',
          'lifecycle.cattle.io/create.project-namespace-auth_local':          'true',
          'lifecycle.cattle.io/create.project-precan-alert-controller_local': 'true'
        },
        creationTimestamp: '2020-10-21T06:29:18Z',
        fields:            [
          'p-2kqcn',
          '30m'
        ],
        finalizers: [
          'controller.cattle.io/mgmt-project-rbac-remove',
          'clusterscoped.controller.cattle.io/project-precan-alert-controller_local',
          'clusterscoped.controller.cattle.io/project-namespace-auth_local'
        ],
        generateName:    'p-',
        generation:      4,
        labels:          { 'authz.management.cattle.io/system-project': 'true' },
        name:            'p-2kqcn',
        namespace:       'local',
        resourceVersion: '1871',
        selfLink:        '/apis/management.cattle.io/v3/namespaces/local/projects/p-2kqcn',
        state:           {
          error:         false,
          message:       '',
          name:          'active',
          transitioning: false
        },
        uid: '2f9d4f41-faac-429a-8fa0-8c65779b4659'
      },
      spec: {
        clusterName:             'local',
        description:             'System project created for the cluster',
        displayName:             'System',
        enableProjectMonitoring: false
      },
      status: {
        conditions: [
          {
            lastUpdateTime: '2020-10-21T06:29:18Z',
            status:         'True',
            type:           'BackingNamespaceCreated'
          },
          {
            lastUpdateTime: '2020-10-21T06:29:18Z',
            status:         'True',
            type:           'CreatorMadeOwner'
          },
          {
            lastUpdateTime: '2020-10-21T06:29:18Z',
            status:         'True',
            type:           'InitialRolesPopulated'
          },
          {
            lastUpdateTime: '2020-10-21T06:29:19Z',
            status:         'True',
            type:           'MetricExpressionDeployed'
          }
        ],
        podSecurityPolicyTemplateId: ''
      }
    },
    {
      id:    'local/p-9tsqm',
      type:  'management.cattle.io.project',
      links: {
        remove: 'https://localhost:9443/v1/management.cattle.io.projects/local/p-9tsqm',
        self:   'https://localhost:9443/v1/management.cattle.io.projects/local/p-9tsqm',
        update: 'https://localhost:9443/v1/management.cattle.io.projects/local/p-9tsqm',
        view:   'https://localhost:9443/apis/management.cattle.io/v3/namespaces/local/projects/p-9tsqm'
      },
      apiVersion: 'management.cattle.io/v3',
      kind:       'Project',
      metadata:   {
        annotations: {
          'authz.management.cattle.io/creator-role-bindings':                 '{"created":["project-owner"],"required":["project-owner"]}',
          'field.cattle.io/creatorId':                                        'user-pq9v5',
          'lifecycle.cattle.io/create.mgmt-project-rbac-remove':              'true',
          'lifecycle.cattle.io/create.project-namespace-auth_local':          'true',
          'lifecycle.cattle.io/create.project-precan-alert-controller_local': 'true'
        },
        creationTimestamp: '2020-10-21T06:29:18Z',
        fields:            [
          'p-9tsqm',
          '30m'
        ],
        finalizers: [
          'controller.cattle.io/mgmt-project-rbac-remove',
          'clusterscoped.controller.cattle.io/project-precan-alert-controller_local',
          'clusterscoped.controller.cattle.io/project-namespace-auth_local'
        ],
        generateName:    'p-',
        generation:      4,
        labels:          { 'authz.management.cattle.io/default-project': 'true' },
        name:            'p-9tsqm',
        namespace:       'local',
        resourceVersion: '1427',
        selfLink:        '/apis/management.cattle.io/v3/namespaces/local/projects/p-9tsqm',
        state:           {
          error:         false,
          message:       '',
          name:          'active',
          transitioning: false
        },
        uid: 'ccc6a7b4-e151-4178-a69e-c3a24ba9fff4'
      },
      spec: {
        clusterName:             'local',
        description:             'Default project created for the cluster',
        displayName:             'Default',
        enableProjectMonitoring: false
      },
      status: {
        conditions: [
          {
            lastUpdateTime: '2020-10-21T06:29:18Z',
            status:         'True',
            type:           'BackingNamespaceCreated'
          },
          {
            lastUpdateTime: '2020-10-21T06:29:18Z',
            status:         'True',
            type:           'CreatorMadeOwner'
          },
          {
            lastUpdateTime: '2020-10-21T06:29:18Z',
            status:         'True',
            type:           'InitialRolesPopulated'
          },
          {
            lastUpdateTime: '2020-10-21T06:29:19Z',
            status:         'True',
            type:           'MetricExpressionDeployed'
          }
        ],
        podSecurityPolicyTemplateId: ''
      }
    }
  ]
};

export const fakePrincipals = {
  type:       'collection',
  links:      { self: 'https://localhost:9443/v3/principals' },
  actions:    { search: 'https://localhost:9443/v3/principals?action=search' },
  pagination: { limit: 1000 },
  sort:       {
    order:   'asc',
    reverse: 'https://localhost:9443/v3/principals?order=desc',
    links:   {
      loginName:      'https://localhost:9443/v3/principals?sort=loginName',
      name:           'https://localhost:9443/v3/principals?sort=name',
      principalType:  'https://localhost:9443/v3/principals?sort=principalType',
      profilePicture: 'https://localhost:9443/v3/principals?sort=profilePicture',
      profileURL:     'https://localhost:9443/v3/principals?sort=profileURL',
      provider:       'https://localhost:9443/v3/principals?sort=provider',
      uuid:           'https://localhost:9443/v3/principals?sort=uuid'
    }
  },
  filters: {
    created:        null,
    creatorId:      null,
    id:             null,
    loginName:      null,
    me:             null,
    memberOf:       null,
    name:           null,
    principalType:  null,
    profilePicture: null,
    profileURL:     null,
    provider:       null,
    removed:        null,
    uuid:           null
  },
  resourceType: 'principal',
  data:         [
    {
      baseType:      'principal',
      created:       null,
      creatorId:     null,
      id:            'local://user-pq9v5',
      links:         { self: 'https://localhost:9443/v3/principals/local:%2F%2Fuser-pq9v5' },
      loginName:     'admin',
      me:            true,
      memberOf:      false,
      name:          'Default Admin',
      principalType: 'user',
      provider:      'local',
      type:          'principal'
    }
  ]
};
