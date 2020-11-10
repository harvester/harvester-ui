<script>
export default {
  props:      {
    value: {
      type:     [String, Object],
      default: ''
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },
  computed: {
    parseValue() {
      let config = {};

      try {
        config = JSON.parse(this.value);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('waiting...');
      }

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
