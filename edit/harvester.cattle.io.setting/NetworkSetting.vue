<script>
import Banner from '@/components/Banner';
import LabeledSelect from '@/components/form/LabeledSelect';
import LabeledInput from '@/components/form/LabeledInput';

export default {
  name:       'NetworkSetting',
  components: {
    LabeledSelect, LabeledInput, Banner
  },

  props:      {
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    let parseDefaultValue = {};

    try {
      parseDefaultValue = JSON.parse(this.value.value);
    } catch (error) {
      parseDefaultValue = JSON.parse(this.value.default);
    }

    return {
      type: 'L2VlanNetwork',
      parseDefaultValue
    };
  },

  computed: {
    typeOption() {
      return [{
        value: 'L2VlanNetwork',
        label: 'L2VlanNetwork'
      }];
    },

    statusText() {
      return this.value?.configuredCondition?.reason;
    }
  },

  methods: {
    update() {
      this.value.setAnnotation('networks.harvester.cattle.io/type', this.type);
      const value = JSON.stringify(this.parseDefaultValue);

      this.$set(this.value, 'value', value);
    }
  }
};
</script>

<template>
  <div @input="update">
    <LabeledSelect v-model="type" class="mb-20" label="Type" :options="typeOption" :disabled="true" />

    <LabeledInput v-model="parseDefaultValue.NIC" label="Physical NIC" />

    <Banner
      v-if="statusText"
      color="error"
    >
      {{ statusText }}
    </Banner>
  </div>
</template>

<style lang="scss" scoped>

</style>
