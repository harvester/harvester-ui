<script>
import Banner from '@/components/Banner';

export default {
  name:       'Detail',
  components: { Banner },

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
        <div class="labeled-input view">
          <label>
            {{ t('harvester.fields.type') }}
          </label>
          <div>
            {{ type }}
          </div>
        </div>
      </div>

      <div class="col span-4">
        <div class="labeled-input view">
          <label>
            {{ t('harvester.fields.PhysicalNic') }}
          </label>
          <div>
            {{ parseDefaultValue.NIC }}
          </div>
        </div>
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
