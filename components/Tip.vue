<script>
export default {
  props: {
    icon: {
      type:    String,
      default: ''
    },
    text: {
      type:    String,
      default: ''
    }
  }
};
</script>

<template>
  <div class="tip">
    <span class="my-icon" :class="icon"></span>
    <span>{{ text }}</span>
  </div>
</template>

<style lang="scss" scoped>
.tip {
  color: var(--disabled-text);
}

.my-icon {
  font-size: 15px;
}
</style>
