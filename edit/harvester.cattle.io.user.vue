<script>
import Footer from '@/components/form/Footer';
import LabeledInput from '@/components/form/LabeledInput';
import CreateEditView from '@/mixins/create-edit-view';

export default {
  name: 'EditUser',

  components: {
    Footer,
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
      :mode="mode"
      class="mb-20"
      required
    />

    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </form>
</template>
