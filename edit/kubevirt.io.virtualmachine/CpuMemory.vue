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
    },
    mode: {
      type:     String,
      default: 'edit',
    },
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
      let memory = '';

      if (String(this.localMemory).includes('Gi')) {
        memory = this.localMemory;
      } else {
        memory = `${ this.localMemory }Gi`;
      }
      this.$emit('updateCpuMemory', this.localCpu, memory);
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
        :mode="mode"
        class="mb-20"
      />
    </div>

    <div class="col span-6">
      <UnitInput
        v-model="localMemory"
        label="Memory"
        suffix="iB"
        :mode="mode"
        :input-exponent="3"
        :output-exponent="3"
        required
        class="mb-20"
      />
    </div>
  </div>
</template>
