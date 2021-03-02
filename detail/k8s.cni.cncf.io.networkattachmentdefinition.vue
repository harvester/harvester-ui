<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabelValue from '@/components/LabelValue';

export default {
  name: 'Detail',

  components: {
    Tab,
    Tabbed,
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
    return { config: {} };
  },

  computed: {
    name() {
      return this.config.name || '-';
    },

    type() {
      return this.value.getLabelValue('networks.harvester.cattle.io/type') || '-';
    },

    vlanId() {
      return this.config.vlan || '--';
    }
  },

  watch: {
    value: {
      handler(neu) {
        this.config = JSON.parse(neu.spec.config);
      },
      deep:      true,
      immediate: true
    }
  }
};
</script>

<template>
  <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
    <Tab name="basics" :label="t('harvester.vmPage.detail.tabs.basics')" class="bordered-table">
      <div class="row mb-15">
        <div class="col span-4">
          <LabelValue :name="t('harvester.fields.name')" :value="name" class="mb-20" />
        </div>

        <div class="col span-4">
          <LabelValue :name="t('harvester.fields.type')" :value="type" class="mb-20" />
        </div>

        <div class="col span-4">
          <LabelValue name="Vlan Id" :value="vlanId" class="mb-20" />
        </div>
      </div>
    </Tab>
  </Tabbed>
</template>

<style lang="scss">

</style>
