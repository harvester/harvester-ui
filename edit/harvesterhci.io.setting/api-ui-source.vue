<script>
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';

export default {
  name:       'SourceMode',
  components: { LabeledSelect, LabeledInput },

  props:      {
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    const sourceMode = this.value.value || this.value.default;

    return { sourceMode };
  },

  computed: {
    sourceOptions() {
      return [{
        label: 'Auto',
        value: 'auto'
      }, {
        label: 'External',
        value: 'external'
      }, {
        label: 'Bundled',
        value: 'bundled'
      }];
    }
  },

  methods: {
    update() {
      this.$set(this.value, 'value', this.sourceMode);
    }
  }
};
</script>

<template>
  <div>
    <LabeledInput
      v-model="value.default"
      :label="t('generic.default')"
      class="mb-20"
      mode="view"
    />

    <LabeledSelect v-model="sourceMode" class="mb-20" :label="t('generic.value')" :options="sourceOptions" @input="update" />
  </div>
</template>
