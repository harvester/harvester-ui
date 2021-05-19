<script>
/* eslint-disable */
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import { RBAC } from '@/config/types';
import { HARVESTER_ROLE_CONTEXT } from '@/config/labels-annotations';
import ResourceTable from '@/components/ResourceTable';
import Loading from '@/components/Loading';
import { NAME } from '@/config/product/auth';

import {
  GROUP_NAME, GROUP_ROLE_NAME,
  RBAC_BUILTIN, RBAC_DEFAULT, STATE, NAME as HEADER_NAME, AGE, SIMPLE_NAME
} from '@/config/table-headers';

const DISPLAY_NAME = {
  ...HEADER_NAME,
  name:          'displayName',
  value:         'displayName',
  labelKey: 'tableHeaders.nameDisplay',
};

export default {
  components: {
    Tab, Tabbed, ResourceTable, Loading
  },

  async fetch() {
    const RoleSchema = this.$store.getters['cluster/schemaFor'](RBAC.CLUSTER_ROLE);
    const rows = await this.$store.dispatch('cluster/findAll', { type: RBAC.CLUSTER_ROLE }) || [];

    this.allRoles = rows;
  },

  data() {
    const schema = this.$store.getters[`cluster/schemaFor`](RBAC.CLUSTER_ROLE);
    return { 
      allRoles: [],
      schema,
      tabName: ''
    };
  },

  computed: {
    headers() {
      return [
        STATE,
        DISPLAY_NAME,
        SIMPLE_NAME,
        RBAC_BUILTIN,
        AGE
      ]
    },

    clusterResources() {
      return this.allRoles.filter( R  => {
        return R.clusterRole
      })
    },

    namespaceResources() {
      return this.allRoles.filter( R  => {
        return R.namespaceRole
      })
    },

    createLabel() {
      return this.t(`rbac.roletemplate.subtypes.${ this.tabName }.createButton`);
    },

    createLocation() {
      return {
        name:   'c-cluster-product-resource-create',
        params: {
          cluster:  'local',
          product:  NAME,
          resource: RBAC.CLUSTER_ROLE,
        },
        query: { 
          roleContext: this.tabName
        }
      }
    }
  },

  methods: {
    tabChanged({ tab }) {
      this.tabName = tab.name;
    },
  }
};
</script>

<template>
  <div>
    <header>
      <div class="title">
        <h1 class="m-0">
          {{ t('rbac.roletemplate.label') }}
        </h1>
      </div>
      <div class="actions-container">
        <div class="actions">
          <n-link
            :to="createLocation"
            class="btn role-primary"
          >
            {{ createLabel }}
          </n-link>
        </div>
      </div>
    </header>

    <Tabbed @changed="tabChanged($event)">
      <Tab name="CLUSTER" :weight="2" label="Cluster">
        <ResourceTable :schema="schema" :headers="headers" :rows="clusterResources" />
      </Tab>

      <Tab name="NAMESPACE" :weight="1" label="Namespace">
        <ResourceTable :schema="schema" :headers="headers" :rows="namespaceResources" />
      </Tab>
    </Tabbed>
  </div>
</template>
