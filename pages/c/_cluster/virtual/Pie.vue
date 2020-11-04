<script>
import BaseChart from '@/components/BaseChart';
import { formatSi } from '@/utils/units';

export default {
  name:       'Pie',
  components: { BaseChart },

  props: {
    value: {
      type:     [Number, String],
      default: 0
    },

    suffix: {
      type:    String,
      default: '%'
    },

    title: {
      type:    String,
      default: ''
    }
  },

  data() {
    return {};
  },

  computed: {
    options() {
      const { value, suffix } = this;

      return {
        title: {
          text:      value + suffix,
          x:         'center',
          y:         'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize:   '16'
          }
        },
        color:  ['#ccc'],
        legend: { show: false },

        series: [{
          type:      'pie',
          clockWise: true,
          radius:    ['70%', '76%'],
          itemStyle: {
            normal: {
              label:     { show: false },
              labelLine: { show: false }
            }
          },
          hoverAnimation: false,
          data:           [{
            value,
            name:      '',
            itemStyle: {
              normal: {
                color:     {
                  colorStops: [{
                    offset: 0,
                    color:  '#02d6fc'
                  }, {
                    offset: 1,
                    color:  '#367bec'
                  }]
                },
                label:     { show: false },
                labelLine: { show: false }
              }
            }
          }, {
            name:  '',
            value: 100 - value
          }]
        }]
      };
    }
  },

  methods: {
    formatSi(val, format) {
      return formatSi(val, { ...format });
    },
  }
};
</script>

<template>
  <div class="pie">
    <div class="chart">
      <BaseChart ref="chart" :options="options" :title="title" />
    </div>
    <div class="info">
      <slot>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pie {
  display: flex;
  align-items: center;
}
.chart {
  width: 50%;
}
.info {
  width: 50%;
}
</style>
