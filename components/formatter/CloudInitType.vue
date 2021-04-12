<script>
import { HARVESTER_CLOUD_INIT } from '@/config/labels-annotations';

export default {
  props: {
    value: {
      type:    Object,
      default: () => {
        return {};
      }
    },
  },

  data() {
    return { };
  },

  computed: {
    displayLabel() {
      if (this.value?.[HARVESTER_CLOUD_INIT] === 'user') {
        return 'User Data';
      } else {
        return 'Network Data';
      }
    }
  },
};
</script>

<template>
  <span> {{ displayLabel }} </span>
</template>
