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
  },
  methods: {
    customColorMethod(percentage) {
      if (percentage < 30) {
        return '#909399';
      } else if (percentage < 70) {
        return '#e6a23c';
      } else {
        return '#67c23a';
      }
    },
  }
};
</script>

<template>
  <div class="parent">
    <el-progress :stroke-width="10" :percentage="percentage" :color="customColorMethod"></el-progress>
  </div>
</template>

<style lang="scss" scoped>
.parent {
  width: 80%;
}
</style>
