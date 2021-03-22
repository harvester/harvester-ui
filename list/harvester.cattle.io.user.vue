<script>
import { STATE, AGE, USERNAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
import { HARVESTER_USER, NORMAN, MANAGEMENT } from '@/config/types';

export default {
  name:       'ListUser',
  components: { SortableTable },

  props: {
    schema: {
      type:     Object,
      required: true,
    },

    // rows: {
    //   type:     Array,
    //   required: true,
    // },
  },

  async fetch() {
    let out = [];
    const store = this.$store;
    const isRancher = await store.dispatch('auth/getIsRancher');

    if (!isRancher) {
      const harvesterUsers = await store.dispatch('management/findAll', { type: HARVESTER_USER });

      out = harvesterUsers;
    } else {
      const v3UsersPromise = store.dispatch('management/findAll', { type: NORMAN.USER, opt: { url: '/v3/users' } });
      const managementUsersPromise = store.dispatch('management/findAll', { type: MANAGEMENT.USER });
      const [v3Users, managementUsers] = await Promise.all([v3UsersPromise, managementUsersPromise]);

      out = managementUsers.filter(mu => v3Users.find(vu => mu.id === vu.id));
    }

    this.rows = out;
  },

  data() {
    return { rows: [] };
  },

  computed: {
    headers() {
      return [
        { ...STATE },
        {
          ...USERNAME,
          formatter: 'LinkDetail',
        },
        AGE
      ];
    },
  },
};
</script>

<template>
  <SortableTable
    v-bind="$attrs"
    :headers="headers"
    default-sort-by="age"
    :rows="[...rows]"
    key-field="_key"
    v-on="$listeners"
  >
  </sortabletable>
</template>
