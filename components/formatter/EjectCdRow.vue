<script>
import Checkbox from '@/components/form/Checkbox';

export default {
  components: { Checkbox },
  props:      {
    value: {
      type:     String,
      default: ''
    },
    row: {
      type:     Object,
      required: true
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },
};
</script>

<template>
  <Checkbox v-if="row.type === 'cd-rom'" v-model="row.isEjectCdRow" class="selection-checkbox" type="checkbox" />
</template>
