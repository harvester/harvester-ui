<script>
export default {
  props: {
    value: {
      type:     [String, Number],
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
  }
};
</script>

<template>
  <span>
    {{ row.size }}{{ row.unit }}B
  </span>
</template>
