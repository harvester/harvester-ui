<script>
import Footer from '@/components/form/Footer';
import LabeledInput from '@/components/form/LabeledInput';
import CreateEditView from '@/mixins/create-edit-view';
import Checkbox from '@/components/form/Checkbox';

export default {
  name: 'EditUser',

  components: {
    Footer,
    Checkbox,
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
    return {};
  },
};
</script>

<template>
  <form>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput
          v-model="value.username"
          label="Username"
          :disabled="isEdit"
          :mode="mode"
          required
        />
      </div>

      <div class="col span-6">
        <LabeledInput
          v-model="value.password"
          label="Password"
          :disabled="isEdit"
          :mode="mode"
          required
        />
      </div>
    </div>

    <div class="row">
      <div class="col span-6">
        <Checkbox v-model="value.isAdmin" class="check" type="checkbox" label="Isadmin:" />
      </div>
    </div>

    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </form>
</template>
