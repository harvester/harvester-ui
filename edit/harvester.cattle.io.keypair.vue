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
      this.value.metadata = { name: '' };
    }

    return { publicKey: this.value.spec.publicKey || '' };
  },

  watch: {
    publicKey(neu) {
      this.value.spec.publicKey = neu;

      const splitSSH = neu.split(/\s+/);

      if (splitSSH.length === 3) {
        if (splitSSH[2].includes('@')) {
          if (splitSSH[2].split('@')) {
            this.value.metadata.name = splitSSH[2].split('@')[0];
          }
        }
      }
    }
  }
};
</script>

<template>
  <div>
    <LabeledInput
      v-model="value.metadata.name"
      label="Name"
      class="mb-20"
      :mode="mode"
      required
    />

    <div class="row">
      <div class="col span-12">
        <LabeledInput
          v-model="publicKey"
          type="multiline"
          :mode="mode"
          :min-height="160"
          label="SSH-Key"
          required
        />
      </div>
    </div>

    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>

<style lang="scss" scoped>
.resize {
  resize: auto;
}
</style>
