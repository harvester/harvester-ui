<script>
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import { MemoryUnit } from '@/config/map';

export default {
  components: {
    LabeledInput,
    LabeledSelect
  },

  props: {
    value: {
      type:    String,
      default: ''
    }
  },

  data() {
    return {
      MemoryUnit,
      memoryValue: this.value
    };
  },

  computed: {
    size: {
      get() {
        const arr = this.value.split(/(?=[A-Z])+/);

        if (arr.length === 2) {
          return arr[0];
        } else {
          return '';
        }
      },

      set(neu) {
        this.memoryValue = `${ neu }${ this.unit }`;
      }
    },

    unit: {
      get() {
        const arr = this.value.split(/(?=[A-Z])+/);

        return arr[1] || arr[0] || 'Gi';
      },

      set(neu) {
        this.memoryValue = `${ this.size }${ neu }`;
      }
    }
  },

  watch: {
    value() {
      this.memoryValue = this.value;
    }
  },

  methods: {
    update() {
      this.$emit('input', this.memoryValue);
    },

    updateUnit(unit) {
      this.unit = unit;
      this.update();
    }
  }
};
</script>

<template>
  <div class="row" @input="update">
    <div class="col span-6">
      <LabeledInput v-model.number="size" v-int-number label="Size" required />
    </div>

    <div class="col span-6">
      <LabeledSelect v-model="unit" label="Unit" :options="MemoryUnit" required @input="updateUnit" />
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
