<script>
import LabeledInput from '@/components/form/LabeledInput';
import Card from '@/components/Card';

export default {
  name: 'ViewSSH',

  components: {
    LabeledInput,
    Card
  },

  props: {
    value: {
      type:     Object,
      required: true,
    }
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
};
</script>

<template>
  <Card class="mt-20 keypair-card">
    <template #body>
      <div class="row">
        <div class="col span-12">
          <LabeledInput
            v-model="publicKey"
            type="multiline"
            mode="view"
            :min-height="160"
            label="SSH-Key"
            required
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style lang="scss">
  .keypair-card DIV {
    word-break: break-all;
  }
</style>
