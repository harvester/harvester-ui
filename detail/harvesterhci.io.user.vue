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
    return {};
  },

  computed: {
    username() {
      return this.value.username;
    },
  }
};
</script>

<template>
  <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
    <Tab name="basics" :label="t('harvester.vmPage.detail.tabs.basics')" class="bordered-table">
      <div class="row mb-15">
        <div class="col span-4">
          <LabelValue :name="t('harvester.userPage.username')" :value="username" class="mb-20" />
        </div>
      </div>
    </Tab>
  </Tabbed>
</template>

<style lang="scss">

</style>
