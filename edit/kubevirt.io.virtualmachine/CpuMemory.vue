<script>
import UnitInput from '@/components/form/UnitInput';

export default {
  name:       'CpuMemory',
  components: { UnitInput },

  props:      {
    cpu: {
      type:    [Number, String],
      default: null
    },

    memory: {
      type:    [Number, String],
      default: null
    }
  },

  data() {
    return {
      localCpu:    this.cpu,
      localMemory: this.memory
    };
  },

  watch: {
    cpu(neu) {
      this.localCpu = neu;
    },
    memory(neu) {
      if (!neu.includes('null')) {
        this.localMemory = neu;
      }
    }
  },

  methods: {
    change() {
      this.$emit('updateCpuMemory', this.localCpu, `${ this.localMemory }Gi`);
    }
  }
};
</script>

<template>
  <div class="row" @input="change">
    <div class="col span-6">
      <UnitInput
        v-model="localCpu"
        label="CPU"
        suffix="C"
        :increment="1"
        :input-exponent="0"
        required
        class="mb-20"
      />
    </div>

    <div class="col span-6">
      <UnitInput
        v-model="localMemory"
        label="Memory"
        suffix="iB"
        :input-exponent="3"
        :output-exponent="3"
        required
        class="mb-20"
      />
    </div>
  </div>
</template>
