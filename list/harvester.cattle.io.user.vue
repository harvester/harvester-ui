<script>
import { AGE, USERNAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
import { HARVESTER_USER, NORMAN, MANAGEMENT } from '@/config/types';

export default {
  name:       'LUsers',
  components: { SortableTable },

  props: {
    schema: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const store = this.$store;
    const isRancher = store.getters['auth/isRancher'];

    this.isRancher = isRancher;

    if (!isRancher) {
      this.harvesterUsers = await store.dispatch('cluster/findAll', { type: HARVESTER_USER });
    } else {
      const v3UsersPromise = store.dispatch('rancher/findAll', { type: NORMAN.USER });
      const managementUsersPromise = store.dispatch('management/findAll', { type: MANAGEMENT.USER });

      const [v3Users, managementUsers] = await Promise.all([v3UsersPromise, managementUsersPromise]);

      this.v3Users = v3Users;
      this.managementUsers = managementUsers;
    }
  },

  data() {
    return {
      v3Users:         [],
      harvesterUsers:  [],
      managementUsers: [],
      isRancher:       false
    };
  },

  computed: {
    headers() {
      return [
        USERNAME,
        AGE
      ];
    },

    rows() {
      if (this.isRancher) {
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
    :rows="rows"
    key-field="_key"
    v-on="$listeners"
  />
</template>
