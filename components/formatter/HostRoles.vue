<script>
export default {
  props: {
    value: {
      type:    Object,
      default: () => {}
    }
  },

  data() {
    return { dialogVisible: false };
  },

  computed: {
    hostType() {
      const isMaster = this.value['node-role.kubernetes.io/master'] === 'true';

      return isMaster ? this.t('node.detail.type.management') : this.t('node.detail.type.compute');
    }
  },

  methods: {}
};
</script>

<template>
  <div>
    {{ hostType }}
  </div>
</template>
