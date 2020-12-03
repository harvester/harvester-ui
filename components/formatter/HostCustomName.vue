<script>
import { HOST_CUSTOM_NAME } from '@/config/labels-annotations.js';

export default {
  props: {
    value: {
      type:    Object,
      default: () => {}
    }
  },

  data() {
    return {};
  },

  computed: {
    customName() {
      return this.value[HOST_CUSTOM_NAME];
    }
  },
};
</script>

<template>
  <div>
    {{ customName }}
  </div>
</template>
