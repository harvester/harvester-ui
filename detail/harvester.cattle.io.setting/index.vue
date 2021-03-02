<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabelValue from '@/components/LabelValue';
import NetworkSetting from './NetworkSetting';

export default {
  name: 'Detail',

  components: {
    Tab,
    Tabbed,
    NetworkSetting,
    LabelValue
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
            <LabelValue :name="t('generic.default')" :value="value.default" class="mb-20" />
          </div>
        </div>

        <div class="row">
          <div class="col span-12">
            <LabelValue :name="t('generic.value')" :value="value.value" class="mb-20" />
          </div>
        </div>
      </Tab>
    </Tabbed>
  </div>
</template>

<style lang="scss">

</style>
