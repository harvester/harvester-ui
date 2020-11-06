<script>
import LabeledSelect from '@/components/form/LabeledSelect';
import LabeledInput from '@/components/form/LabeledInput';

export default {
  name:       'NetworkSetting',
  components: { LabeledSelect, LabeledInput },

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
      type: 'VLAN',
      parseDefaultValue
    };
  },

  computed: {
    typeOption() {
      return [{
        value: 'VLAN',
        label: 'VLAN'
      }];
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
  <div>
    <div class="row" @input="update">
      <div class="col span-6">
        <LabeledSelect v-model="type" label="Type" :options="typeOption" :disabled="true" />
      </div>

      <div class="col span-6">
        <LabeledInput v-model="parseDefaultValue.NIC" label="Physical NIC" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
