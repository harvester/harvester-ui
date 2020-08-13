<script>
export default {
  props:      {
    value: {
      type:     Number,
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
    percentage() {
      return Number.parseFloat(this.value);
    }
  }
};
</script>

<template>
  <el-progress :text-inside="true" :stroke-width="14" :percentage="percentage" :status="percentage === 100 ? 'success' : 'warning'"></el-progress>
</template>
