<script>
import Banner from '@/components/Banner';
import LabelValue from '@/components/LabelValue';

export default {
  name:       'Detail',
  components: { Banner, LabelValue },

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
    const type = this.value.getAnnotationValue('networks.harvester.cattle.io/type');

    return {
      type,
      parseDefaultValue
    };
  },

  computed: {
    statusText() {
      return this.value?.configuredCondition?.reason;
    }
  }
};
</script>

<template>
  <div>
    <div class="row mb-15">
      <div class="col span-4">
        <LabelValue :name="t('harvester.fields.type')" :value="type" />
      </div>

      <div class="col span-4">
        <LabelValue :name="t('harvester.fields.PhysicalNic')" :value="parseDefaultValue.NIC" />
      </div>
    </div>

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
