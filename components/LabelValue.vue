<script>
export default {
  props: {
    name: {
      type:     String,
      required: true
    },
    value: {
      type:     String,
      required: true
    }
  }
};
</script>

<template>
  <div class="label">
    <div class="name">
      <slot name="name">
        {{ name }}
      </slot>
    </div>

    <div class="value">
      <slot name="value">
        {{ value }}
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.label {
  display: flex;
  flex-direction: column;

  .name {
    color: var(--input-label);
    font-size: 14px;
    line-height: 18px;
  }

  .value {
    font-size: 14px;
    line-height: 18px;
  }
}
</style>
