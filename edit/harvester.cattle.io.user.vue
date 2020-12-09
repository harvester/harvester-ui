<script>
import CruResource from '@/components/CruResource';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabeledInput from '@/components/form/LabeledInput';
import CreateEditView from '@/mixins/create-edit-view';

export default {
  name: 'EditUser',

  components: {
    CruResource,
    Tab,
    Tabbed,
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
    this.value.isAdmin = true;

    return {};
  },
};
</script>

<template>
  <CruResource
    :done-route="doneRoute"
    :resource="value"
    :mode="mode"
    :errors="errors"
    @apply-hooks="applyHooks"
    @finish="save"
  >
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab name="basic" :label="t('vm.detail.tabs.basics')" :weight="3" class="bordered-table">
        <LabeledInput
          v-model="value.username"
          label="Username"
          :disabled="isEdit"
          :mode="mode"
          class="mb-20"
          required
        />

        <LabeledInput
          v-model="value.password"
          label="Password"
          type="password"
          :mode="mode"
          class="mb-20"
          required
        />
      </Tab>
    </Tabbed>
  </CruResource>
</template>
