<script>
import LabeledSelect from '@/components/form/LabeledSelect';
import { IMAGE } from '@/config/types';
const TIP = 'An external URL to the .iso, .img, .qcow2 or .raw that the virtual machine should be created from.';

export default {
  components: { LabeledSelect },

  props: {
    value: {
      type:    String,
      default: ''
    },
    disabled: {
      type:    Boolean,
      default: false
    },
    required: {
      type:    Boolean,
      default: true
    }
  },

  data() {
    return {
      tip:        TIP,
      image:      this.value,
    };
  },

  computed: {
    ImageOption() {
      const choise = this.$store.getters['cluster/all'](IMAGE);

      return choise
        .filter( I => I.isReady)
        .map((I) => {
          return {
            label: I.spec.displayName,
            value: I.spec.displayName
          };
        });
    },
  },

  watch: {
    value(neu) {
      this.image = neu;
    }
  },

  methods: {
    update() {
      this.$emit('input', this.image);
    }
  }
};
</script>

<template>
  <LabeledSelect
    v-model="image"
    :disabled="disabled"
    label="Image"
    :required="required"
    :options="ImageOption"
    :tooltip="tip"
    :hover-tooltip="true"
    @input="update"
  />
</template>
