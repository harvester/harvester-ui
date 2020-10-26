<script>
export default {
  props: {
    open: {
      type:    Boolean,
      default: true
    },
    title: {
      type:     String,
      default: 'Advanced Configuration'
    }
  },
  methods: {
    showAdvanced() {
      this.$emit('update:open', !this.open);
    }
  }
};
</script>

<template>
  <div class="collapse">
    <div class="advanced" @click="showAdvanced">
      <i v-if="open" class="el-icon-arrow-down"></i>
      <i v-else class="el-icon-arrow-right"></i>
      {{ title }}
    </div>

    <div v-if="open" class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.collapse {
  border: 1px solid #ecf0f1;
}

.advanced {
  padding: 0 5px;
  color: #004080;
  cursor: pointer;
  line-height: 40px;
  font-size: 15px;
  font-weight: 500;
  background-color: #f2f5f5;
}

.content {
  padding: 10px;
}
</style>
