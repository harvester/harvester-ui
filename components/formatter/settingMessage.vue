<script>
export default {
  props:      {
    value: {
      type:    [String, Object],
      default: () => {}
    },
    row: {
      type:    Object,
      default: () => {}
    }
  },

  computed: {
    message() {
      return this.row?.configuredCondition?.reason;
    },
  }
};
</script>

<template>
  <div class="flex">
    <span>
      {{ value }}
    </span>
    <span class="banner error">
      {{ message }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.banner {
  margin-left: 20px;
}
</style>
