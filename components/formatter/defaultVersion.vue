<script>
export default {
  props:      {
    value: {
      type:     String,
      default: ''
    },
    row: {
      type:     Object,
      required: true
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },

  computed: {
    isDefaultVersion() {
      return this.col.defaultVersion === this.row.status.version ? 'Yes' : 'No';
    }
  }
};
</script>

<template>
  <div>{{ isDefaultVersion }}</div>
</template>
