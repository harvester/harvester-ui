<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabeledInput from '@/components/form/LabeledInput';
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';
import NetworkSetting from './NetworkSetting';

export default {
  name: 'Networks',

  components: {
    Footer,
    NetworkSetting,
    Tab,
    Tabbed,
    LabeledInput
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    const spec = this.value.spec;

    // if (!spec) {
    //   spec = { pvc: { resources: { requests: { storage: '' } } } };
    //   this.value.spec = spec;
    // }

    return {
      spec,
      randow: Math.random(),
      index:  0,
      errors: []
    };
  },

  computed: {
    isNetworkSetting() {
      return this.value.metadata.name === 'network-setting';
    }
  },

  watch: {
    'value.value'(neu) {
      if (!neu) {
        delete this.value.value;
      }
    },
  },

  methods: {},
};
</script>

<template>
  <div>
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab v-if="isNetworkSetting" name="detail" :label="t('vm.detail.tabs.details')" class="bordered-table">
        <NetworkSetting v-model="value" />
      </Tab>
      <Tab v-else name="basic" :label="t('vm.detail.tabs.details')" :weight="3" class="bordered-table">
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
    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>
