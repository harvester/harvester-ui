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
    },
    state() {
      return this.row.stateDisplay;
    },
    errorMessage() {
      return this.row.getStatusConditionOfType('imported')?.reason;
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
    <div>
      <el-progress :stroke-width="10" :percentage="percentage" :color="customColorMethod"></el-progress>
    </div>
    <span v-if="state === 'Failed'" class="error">{{ errorMessage }}</span>
  </div>
</template>

<style lang="scss">
.parent {
  width: 80%;

  .el-progress-bar__outer {
    background-color: darken(#EBEEF5, 15%)
  }
}

.error {
  color: var(--error);
}
</style>
