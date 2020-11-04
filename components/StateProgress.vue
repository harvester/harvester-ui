<script>
export default {
  props: {
    barData: {
      type:    Array,
      default: () => {
        return [];
      }
    }
  },

  data() {
    return {};
  },

  computed: {
    totalNumber() {
      return this.barData.reduce((total, item) => total + item.number, 0);
    },

    filterData() {
      return this.barData.filter(item => item.number !== 0);
    }
  }
};
</script>

<template>
  <div>
    <div class="data-bar">
      <div v-for="(item, index) in filterData" :key="item.text" :class="{'state-bar': true, [item.color]: true, 'first-bar': index === 0, 'last-bar': index === filterData.length - 1 }" :style="{ 'width': `${(item.number / totalNumber)*100}%`}">
      </div>
    </div>

    <div class="data-text">
      <div v-for="item in filterData" :key="item.text" :class="{'state-body': true, [item.color.replace('bg-', 'text-')]: true}" :style="{ 'width': `${(item.number / totalNumber)*100}%`}">
        <span>{{ item.text }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-text {
  display: flex;
}

.data-bar {
  display: flex;
  margin-bottom: 6px;

  .state-bar {
    width: 100%;
    height: 6px;
  }
}

.first-bar {
  border-radius: 3px 0 0 3px;
}

.last-bar {
  border-radius: 0 3px 3px 0;
}

.first-bar.last-bar {
  border-radius: 3px !important;
}

</style>
