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
    <slot name="title">
      <div class="advanced" @click="showAdvanced">
        <i v-if="open" class="icon icon-chevron-down"></i>
        <i v-else class="icon icon-chevron-right"></i>
        {{ title }}
      </div>
    </slot>

    <div v-if="open" class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.collapse {
  // border: 1px solid #ecf0f1;
}

.advanced {
  user-select: none;
  padding: 0 5px;
  color: #004080;
  cursor: pointer;
  line-height: 40px;
  font-size: 15px;
  font-weight: 500;
  background-color: #f2f5f5;
}

.content {
  background: var(--nav-active);
  padding: 10px;

  margin-top: 6px;
  border-radius: 4px;
}
</style>
