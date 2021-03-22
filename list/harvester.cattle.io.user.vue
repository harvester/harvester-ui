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
    const store = this.$store;
    const isRancher = await store.dispatch('auth/getIsRancher');

    if (!isRancher) {
      this.harvesterUsers = await store.dispatch('cluster/findAll', { type: HARVESTER_USER });
    } else {
      const v3UsersPromise = store.dispatch('rancher/findAll', { type: NORMAN.USER, opt: { url: `/v3/${ NORMAN.USER }s` } });
      const managementUsersPromise = store.dispatch('management/findAll', { type: MANAGEMENT.USER, opt: { url: `/v1/${ MANAGEMENT.USER }s` } });
      const [v3Users, managementUsers] = await Promise.all([v3UsersPromise, managementUsersPromise]);

      this.v3Users = v3Users;
      this.managementUsers = managementUsers;
    }
  },

  data() {
    return {
      harvesterUsers:  [],
      v3Users:         [],
      managementUsers: []
    };
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

    rows() {
      const isRancher = this.$store.dispatch('auth/getIsRancher');

      if (isRancher) {
        return this.managementUsers.filter(mu => this.v3Users.find(vu => mu.id === vu.id));
      } else {
        return this.harvesterUsers;
      }
    }
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
