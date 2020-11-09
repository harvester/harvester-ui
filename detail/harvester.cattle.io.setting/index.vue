<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import { defaultAsyncData } from '@/components/ResourceDetail';
import NetworkSetting from './NetworkSetting';

export default {
  name: 'Detail',

  components: {
    Tab,
    Tabbed,
    NetworkSetting,
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

  async asyncData(ctx) {
    const out = await defaultAsyncData(ctx);

    const name = out.originalModel.metadata.name;

    if (name === 'network-setting') {
      return out;
    } else {
      out.asYamlInit = true;

      return out;
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
      <Tab name="detail" :label="t('vm.detail.tabs.details')" class="bordered-table">
        <NetworkSetting v-if="isNetworkSetting" v-model="value" />
      </Tab>
    </Tabbed>
  </div>
</template>

<style lang="scss">

</style>
