<script>
import { SCHEMA, RBAC } from '@/config/types';
import { NAME, AGE } from '@/config/table-headers';
import { HARVESTER_MANAGED } from '@/config/labels-annotations';

import Loading from '@/components/Loading';
import SortableTable from '@/components/SortableTable';

const schema = {
  id:         'member',
  type:       SCHEMA,
  attributes: {
    kind:       'Member',
    namespaced: true
  },
  metadata: { name: 'member' },
};

export default {
  name:       'ListMember',
  components: { Loading, SortableTable },

  async fetch() {
    const resources = await this.$store.dispatch('cluster/findAll', { type: RBAC.ROLE_BINDING });

    this.resources = resources;
  },

  data() {
    return { resources: [] };
  },

  computed: {
    schema() {
      return schema;
    },

    headers() {
      return [
        NAME,
        {
          name:          'role',
          labelKey:      'tableHeaders.role',
          value:         'roleName',
          sort:          ['roleName'],
        },
        AGE
      ];
    },

    rows() {
      return this.resources.filter( (role) => {
        return role.getLabelValue(HARVESTER_MANAGED) === 'true';
      });
    },
  },

  typeDisplay() {
    const { params:{ resource: type } } = this.$route;
    let paramSchema = schema;

    if (type !== schema.id) {
      paramSchema = this.$store.getters['cluster/schemaFor'](type);
    }

    return this.$store.getters['type-map/labelFor'](paramSchema, 99);
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <SortableTable v-else :rows="rows" :headers="headers" />
</template>
