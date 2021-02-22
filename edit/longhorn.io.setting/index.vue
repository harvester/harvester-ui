<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabeledInput from '@/components/form/LabeledInput';
import Footer from '@/components/form/Footer';
import { HARVESTER_SETTING } from '@/config/types';
import CreateEditView from '@/mixins/create-edit-view';

export default {
  name: 'LonghornEdit',

  components: {
    Footer,
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
    return {
      randow: Math.random(),
      errors: []
    };
  },

  watch: {
    'value.value'(neu) {
      if (!neu) {
        delete this.value.value;
      }
    },
  },

  methods: {
    done() {
      if ( this.doneLocationOverride) {
        return this.$router.replace(this.doneLocationOverride);
      }

      if ( !this.doneRoute ) {
        return;
      }

      this.$router.push({
        name:   this.doneRoute,
        params: { ...this.doneParams, resource: HARVESTER_SETTING } || { resource: HARVESTER_SETTING }
      });
    },
  },
};
</script>

<template>
  <div>
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab name="basic" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="3" class="bordered-table">
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
