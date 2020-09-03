<script>
export default {
  props: {
    resource: {
      type:    Object,
      default: () => {
        return {};
      }
    }
  },

  data() {
    return { versionResource: {} };
  },
  watch: {
    resource: {
      async handler(neu) {
        const proxyResource = await this.$store.dispatch('cluster/create', neu);

        this.$set(this, 'versionResource', proxyResource);
      },
      deep:      true,
      immediate: true
    }
  },
  methods: {
    showActions() {
      this.$store.commit('action-menu/show', {
        resources: this.versionResource,
        elem:      this.$refs.actions,
      });
    },
  }
};
</script>

<template>
  <div>
    <button
      ref="actions"
      aria-haspopup="true"
      type="button"
      class="btn btn-sm role-multi-action actions"
      @click="showActions"
    >
      Actions
    </button>
  </div>
</template>

<style lang="scss" scoped>
.actions {
  padding: 15px;
}
</style>
