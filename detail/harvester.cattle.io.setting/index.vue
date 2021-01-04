<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabeledInput from '@/components/form/LabeledInput';
import NetworkSetting from './NetworkSetting';

export default {
  name: 'Detail',

  components: {
    Tab,
    Tabbed,
    NetworkSetting,
    LabeledInput
  },

  props: {
    mode: {
      type:     String,
      required: true,
    },
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    return {};
  },

  computed: {
    isNetworkSetting() {
      return this.value.metadata.name === 'network-setting';
    }
  },
};
</script>

<template>
  <div>
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab v-if="isNetworkSetting" name="detail" :label="t('harvester.vmPage.detail.tabs.basics')" class="bordered-table">
        <NetworkSetting v-model="value" />
      </Tab>
      <Tab v-else name="basic" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="3" class="bordered-table">
        <div class="row mb-20">
          <div class="col span-12">
            <LabeledInput
              v-model="value.default"
              :label="t('generic.default')"
              class="mb-20"
              mode="view"
            />
          </div>
        </div>

        <div class="row">
          <div class="col span-12">
            <LabeledInput
              v-model="value.value"
              :mode="mode"
              :label="t('generic.value')"
            />
          </div>
        </div>
      </Tab>
    </Tabbed>
  </div>
</template>

<style lang="scss">

</style>
