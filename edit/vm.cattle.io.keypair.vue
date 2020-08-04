<script>
import LabeledInput from '@/components/form/LabeledInput';
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';

export default {
  name: 'EditSSH',

  components: {
    Footer,
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
    let spec = this.value.spec;

    if ( !this.value.spec ) {
      spec = {};
      this.value.spec = spec;
    }

    return {};
  },
};
</script>

<template>
  <form>
    <LabeledInput
      v-model="value.metadata.name"
      label="Name"
      class="mb-20"
      required
    />

    <div class="row">
      <div class="col span-12">
        <LabeledInput
          v-model="value.spec.publicKey"
          type="multiline"
          label="SSH-Key"
          :min-height="160"
          required
        />
      </div>
    </div>

    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </form>
</template>

<style lang="scss" scoped>
.resize {
  resize: auto;
}
</style>
