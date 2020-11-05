<script>
import LabeledInput from '@/components/form/LabeledInput';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';

export default {
  name: 'ViewSSH',

  components: {
    LabeledInput,
    Tab,
    Tabbed
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
  <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
    <Tab name="detail" :label="t('vm.detail.tabs.details')" class="bordered-table">
      <div class="row">
        <div class="col span-12 keypair-card">
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
    </Tab>
  </Tabbed>
</template>

<style lang="scss">
  .keypair-card DIV {
    word-break: break-all;
  }
</style>
