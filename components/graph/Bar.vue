<script>
export default {
  props: {
    percentage: {
      type:     Number,
      required: true
    },
    primaryColor: {
      type:    String,
      default: '--primary'
    },
    secondaryColor: {
      type:    String,
      default: '--border'
    },
    height: {
      type:    Number,
      default: 15
    }
  },
  computed: {
    indicatorStyle() {
      return {
        width:           `${ this.percentage }%`,
        backgroundColor: `var(${ this.primaryColor })`
      };
    },
    barStyle() {
      return {
        backgroundColor: `var(${ this.secondaryColor })`,
        height:          `${ this.height }px`,
        borderRadius:    `${ this.height / 2 }px`,
      };
    }
  }
};
</script>

<template>
  <div class="bar" :style="barStyle">
    <div class="indicator" :style="indicatorStyle" />
  </div>
</template>

<style lang="scss" scoped>
.bar {
    width: 100%;
    overflow: hidden;

    .indicator {
      height: 100%;
    }
}
</style>
