<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabelValue from '@/components/LabelValue';
import RadioGroup from '@/components/form/RadioGroup';

export default {
  name: 'Detail',

  components: {
    Tab,
    Tabbed,
    LabelValue,
    RadioGroup
  },

  props: {
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    return {};
  },
};
</script>

<template>
  <Tabbed id="clusterNetworkDetail" v-bind="$attrs" class="mt-15" :side-tabs="true">
    <Tab name="basics" :label="t('harvester.vmPage.detail.tabs.basics')" class="bordered-table">
      <RadioGroup
        v-model="value.enable"
        :disabled="true"
        class="mb-20"
        name="model"
        :options="[true,false]"
        :labels="['Enable', 'Disable']"
      />

      <LabelValue v-if="value.enable" name="DefaultPhysicalNIC" :value="value.config.defaultPhysicalNIC" />
    </Tab>
  </Tabbed>
</template>

<style lang="scss">
#clusterNetworkDetail {
  .radio-group {
    display: flex;
    .radio-container {
      margin-right: 30px;
    }
  }
}
</style>
