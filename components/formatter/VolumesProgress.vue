<script>
export default {
  props: {
    value: {
      type:    [String, Object],
      default: () => {}
    },
  },

  computed: {
    realValue() {
      return this.value.replace('N/A', '');
    }
  }
};
</script>

<template>
  <div>
    {{ realValue }}
  </div>
</template>
