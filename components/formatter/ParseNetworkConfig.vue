<script>
export default {
  props:      {
    value: {
      type:     String,
      default: ''
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },
  computed: {
    parseValue() {
      const config = JSON.parse(this.value);

      return config?.[this.col.type] || '';
    }
  }
};
</script>

<template>
  <div>
    {{ parseValue }}
  </div>
</template>
