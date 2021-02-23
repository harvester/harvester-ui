<script>
import Tag from '@/components/Tag';

export default {
  components: { Tag },

  props:      {
    value: {
      type:    [String, Object],
      default: () => {}
    },
    row: {
      type:    Object,
      default: () => {}
    }
  },

  computed: {
    message() {
      return this.row?.configuredCondition?.reason;
    },

    displayValue() {
      return this.row.displayValue || this.value;
    }
  }
};
</script>

<template>
  <div class="flex">
    <div>
      <template v-if="typeof displayValue === 'object'">
        <Tag v-for="(V, N) in displayValue" :key="N" class="ml-5">
          {{ `${N}:   ${V}` }}
        </Tag>
      </template>

      <span v-else>{{ displayValue }}</span>
    </div>

    <div class="text-error mt-5">
      {{ message }}
    </div>
  </div>
</template>
