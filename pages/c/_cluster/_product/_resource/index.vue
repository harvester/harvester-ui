<script>
import ResourceList from '@/components/ResourceList';

export default {
  name:       'ClusterResourcedList',
  components: { ResourceList },

  fetch() {
    const store = this.$store;
    const params = { ...this.$route.params };
    const resource = params.resource;
    const inStore = store.getters['currentProduct'].inStore;
    const schema = store.getters[`${ inStore }/schemaFor`](resource);

    if (schema) {
      this.hasResource = true;
    }
  },

  data() {
    return { hasResource: false };
  }
};
</script>

<template>
  <ResourceList v-if="hasResource" />
  <div v-else></div>
</template>
