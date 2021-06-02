<script>
import ResourceTable from '@/components/ResourceTable';
import { CONFIG_MAP, SCHEMA } from '@/config/types';
import { NAME, AGE, NAMESPACE } from '@/config/table-headers';
import { HARVESTER_CLOUD_INIT } from '@/config/labels-annotations';
import { allSettled } from '@/utils/promise';

const schema = {
  id:         'cloudTemplate',
  type:       SCHEMA,
  attributes: {
    kind:       'cloudTemplate',
    namespaced: true
  },
  metadata: { name: 'cloudTemplate' },
};

export default {
  name:       'ListConfigMap',
  components: { ResourceTable },

  async fetch() {
    const store = this.$store;
    const inStore = store.getters['currentStore']();

    const hash = { rows: store.dispatch(`${ inStore }/findAll`, { type: CONFIG_MAP }) };

    const res = await allSettled(hash);

    this.rows = res.rows;
  },

  data() {
    return {
      headers: [
        NAME,
        NAMESPACE,
        {
          name:          'type',
          labelKey:      'tableHeaders.type',
          value:         'metadata.labels',
          formatter:     'CloudInitType',
        },
        AGE
      ],
      rows: []
    };
  },

  computed: {
    filterdRows() {
      return this.rows.filter((r) => {
        return !!r.metadata?.labels?.[HARVESTER_CLOUD_INIT];
      });
    },

    schema() {
      return schema;
    }
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
  <ResourceTable
    v-bind="$attrs"
    :headers="headers"
    :groupable="true"
    :schema="schema"
    :rows="[...filterdRows]"
    key-field="_key"
    v-on="$listeners"
  />
</template>
