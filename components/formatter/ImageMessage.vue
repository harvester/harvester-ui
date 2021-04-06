<script>
export default {
  props:      {
    value: {
      type:     [String, Number, Array],
      default: 0
    },
    row: {
      type:     Object,
      default: () => {}
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },
  computed: {
    errorMessage() {
      return this.row.getStatusConditionOfType('Initialized')?.message;
    }
  },
};
</script>

<template>
  <div class="text-error">
    {{ errorMessage }}
  </div>
</template>
