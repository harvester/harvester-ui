<script>
export default {
  name: 'Echarts',

  props: {
    width: {
      type:    String,
      default: '100%'
    },

    height: {
      type:    String,
      default: '200px'
    },

    options: {
      type:    Object,
      default: () => {}
    },

    title: {
      type:    String,
      default: ''
    }
  },

  data() {
    return { myChart: {} };
  },

  computed: {
    hasHeader() {
      return this.$slots?.header || this.title;
    }
  },

  watch: {
    options: {
      handler(neu) {
        this.echartsInit();
      },
      deep: true
    }
  },

  mounted() {
    this.echartsInit();
    window.addEventListener('resize', this.resize);
  },

  destroyed() {
    window.removeEventListener('resize', this.resize);
  },

  methods: {
    echartsInit() {
      this.myChart = this.$echarts.init(this.$refs.chart);
      this.myChart.setOption(this.options);
    },

    resize() {
      this.myChart.resize();
    }
  }
};
</script>

<template>
  <div>
    <div v-if="hasHeader" class="header">
      <slot name="header">
        <h4>{{ title }}</h4>
      </slot>
    </div>
    <div ref="chart" :style="{height: height, width: width}"></div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  font-size: 20px;
  color: #1a2736;
}
</style>
