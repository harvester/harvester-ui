<script>
import VMState from '@/components/formatter/BadgeStateFormatter';
// import RestoreProgress from '@/components/formatter/restoreProgress';

export default {
  components: { VMState },
  props:      {
    value: {
      type:     String,
      default: ''
    },
    row: {
      type:     Object,
      required: true
    }
  },
};
</script>

<template>
  <span>
    <!-- <RestoreProgress :vm="row" /> -->
    <VMState :row="row" />
  </span>
</template>

<style lang="scss" scoped>

</style>
