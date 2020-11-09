<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';

export default {
  name: 'Detail',

  components: {
    Tab,
    Tabbed
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
    <Tab name="detail" :label="t('vm.detail.tabs.details')" class="bordered-table">
      <div class="row mb-15">
        <div class="col span-4">
          <div class="labeled-input view">
            <label>
              Name
            </label>
            <div>
              {{ name }}
            </div>
          </div>
        </div>

        <div class="col span-4">
          <div class="labeled-input view">
            <label>
              Type
            </label>
            <div>
              {{ type }}
            </div>
          </div>
        </div>

        <div class="col span-4">
          <div class="labeled-input view">
            <label>
              Vlan Id
            </label>
            <div>
              {{ vlanId }}
            </div>
          </div>
        </div>
      </div>
    </Tab>
  </Tabbed>
</template>

<style lang="scss">

</style>
