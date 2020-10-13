<script>
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';
import FileSelector, { createOnSelected } from '@/components/form/FileSelector';

export default {
  name: 'EditSSH',

  components: {
    Footer,
    FileSelector
  },

  mixins: [CreateEditView],

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
  },

  methods: { onKeySelected: createOnSelected('publicKey') },
};
</script>

<template>
  <div>
    <a-card class="mt-20 keypair-card">
      <div class="header mb-20">
        <FileSelector v-if="isCreate" class="btn btn-sm bg-primary mt-10" label="Read From File" accept=".pub" @selected="onKeySelected" />
      </div>
      <a-form layout="vertical">
        <a-form-item v-if="mode!=='view'" label="Name" required>
          <a-input
            v-model="value.metadata.name"
          />
        </a-form-item>
        <a-form-item label="SSH-Key" :required="mode !== 'view'">
          <a-textarea
            v-model="publicKey"
            :auto-size="{ minRows: 5 }"
            :readonly="mode === 'view'"
          />
        </a-form-item>
      </a-form>
      <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
    </a-card>
  </div>
</template>

<style lang="scss">
.keypair-card {
  .header {
    display: flex;
    justify-content: flex-end;
  }

  .resize {
    resize: auto;
  }
  .row .labeled-input span {
    word-break: break-word;
  }
}
</style>
