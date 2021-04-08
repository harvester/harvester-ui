<script>
import LabeledSelect from '@/components/form/LabeledSelect';

export default {
  name:       'LogLevel',
  components: { LabeledSelect },

  props:      {
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    const logLevel = this.value.value || this.value.default;

    return { logLevel };
  },

  computed: {
    logOption() {
      return [{
        label: 'Info',
        value: 'info'
      }, {
        label: 'Debug',
        value: 'debug'
      }, {
        label: 'Trace',
        value: 'trace'
      }];
    }
  },

  methods: {
    update() {
      this.$set(this.value, 'value', this.logLevel);
    }
  }
};
</script>

<template>
  <div>
    <LabeledSelect v-model="logLevel" class="mb-20" :label="t('generic.value')" :options="logOption" @input="update" />
  </div>
</template>
