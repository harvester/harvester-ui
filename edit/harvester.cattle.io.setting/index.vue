<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import CruResource from '@/components/CruResource';
import LabeledInput from '@/components/form/LabeledInput';
import CreateEditView from '@/mixins/create-edit-view';

export default {
  name: 'ENetworks',

  components: {
    Tab,
    Tabbed,
    CruResource,
    LabeledInput,
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
      errors:             [],
      hasCustomComponent: false,
      customComponent:    null
    };
  },

  created() {
    let customComponent = false;

    const resource = this.$route.params.resource;
    const name = this.value.metadata.name;
    const path = `${ resource }/${ name }`;

    const hasCustomComponent = this.$store.getters['type-map/haveComponent'](path);

    if ( hasCustomComponent ) {
      customComponent = this.$store.getters['type-map/importComponent'](path);
    }
    this.hasCustomComponent = hasCustomComponent;
    this.customComponent = customComponent;
  },
};
</script>

<template>
  <CruResource
    :done-route="doneRoute"
    :resource="value"
    :mode="mode"
    :errors="errors"
    :can-yaml="false"
    @apply-hooks="applyHooks"
    @finish="save"
  >
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab name="basic" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="3" class="bordered-table">
        <component
          :is="customComponent"
          v-if="hasCustomComponent"
          v-model="value"
        />

        <template v-else>
          <LabeledInput
            v-model="value.default"
            :label="t('generic.default')"
            class="mb-20"
            mode="view"
          />

          <LabeledInput
            v-model="value.value"
            :mode="mode"
            :label="t('generic.value')"
          />
        </template>
      </Tab>
    </Tabbed>
  </CruResource>
</template>
