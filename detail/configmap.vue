<script>
import DetailText from '@/components/DetailText';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabelValue from '@/components/LabelValue';
import { HARVESTER_CLOUD_INIT_NETWORK } from '@/config/labels-annotations';

export default {
  components: {
    DetailText,
    Tabbed,
    Tab,
    LabelValue,
  },

  props: {
    value: {
      type:    Object,
      default: () => {
        return {};
      }
    }
  },

  computed:   {
    type() {
      let out = 'User Data';

      if (!!this.value.metadata?.labels?.[HARVESTER_CLOUD_INIT_NETWORK]) {
        out = 'Netwrok Data';
      }

      return out;
    },

    template() {
      const { data = {} } = this.value;
      const key = 'cloudInit';

      return {
        key,
        value:  data[key],
        binary: false
      };
    },
  },
};
</script>

<template>
  <Tabbed :side-tabs="true">
    <Tab name="basics" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="2">
      <div class="mb-20">
        <LabelValue :name="t('harvester.cloudInitPage.templateType')" :value="type" />
      </div>
      <div class="resource-yaml">
        <DetailText :value="template.value" :label="template.key" :binary="template.binary" />
      </div>
    </Tab>
  </Tabbed>
</template>
