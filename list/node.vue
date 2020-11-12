<script>
import ResourceTable from '@/components/ResourceTable';
import { STATE, NAME, AGE } from '@/config/table-headers';

const HOST_ROLES = {
  name:      'host-roles',
  labelKey:  'tableHeaders.roles',
  sort:      'host-roles',
  value:     `metadata.labels`,
  formatter: 'HostRoles'
};
const HOST_IP = {
  name:      'host-ip',
  labelKey:  'tableHeaders.hostIp',
  search:    ['internalIp'],
  sort:      ['internalIp'],
  value:     'internalIp',
  formatter: 'HostIp'
};

export default {
  name:       'ListNode',
  components: { ResourceTable },

  props: {
    schema: {
      type:     Object,
      required: true,
    },

    rows: {
      type:     Array,
      required: true,
    },
  },

  data() {
    return { headers: [STATE, NAME, HOST_ROLES, HOST_IP, AGE] };
  },

  typeDisplay() {
    return 'Hosts';
  },
};
</script>

<template>
  <ResourceTable
    v-bind="$attrs"
    :schema="schema"
    :headers="headers"
    :rows="[...rows]"
    key-field="_key"
    v-on="$listeners"
  >
  </ResourceTable>
</template>
