<script>
import CruResource from '@/components/CruResource';
import LabeledInput from '@/components/form/LabeledInput';
import CreateEditView from '@/mixins/create-edit-view';

export default {
  name: 'EditUser',

  components: {
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
    <form>
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
    </form>
  </CruResource>
</template>
