<script>
import Footer from '@/components/form/Footer';
import LabeledInput from '@/components/form/LabeledInput';
import LabelAndAnnoTabs from '@/components/form/LabelAndAnnoTabs';
import CreateEditView from '@/mixins/create-edit-view';
import { DESCRIPTION } from '@/config/labels-annotations';

const filesFormat = ['gz', 'qcow', 'qcow2', 'raw', 'img', 'xz', 'iso'];

export default {
  name: 'EditImage',

  components: {
    Footer,
    LabeledInput,
    LabelAndAnnoTabs,
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

    if ( this.value.metadata ) {
      this.value.metadata.generateName = 'image-'; // back end needs
    }

    const displayName = this.value?.spec?.displayName || '';
    const description = this.value?.metadata?.annotations?.[DESCRIPTION];

    return {
      displayName,
      url: this.value.spec.url,
      description,
    };
  },

  watch: {
    url(neu) {
      const url = neu.trim();
      const suffixName = url.split('/').pop();
      const fileSuffiic = suffixName.split('.').pop();

      this.value.spec.url = url;
      if (filesFormat.includes(fileSuffiic)) {
        if (!this.displayName) {
          this.displayName = suffixName;
        }
        this.errors = [];
      } else {
        this.errors = ['The URL you have entered ends in an extension that we do not support. We only accept image files that end in .img, .iso, .qcow2, .raw, and compressed (.tar, .gz, .xz) of the above formats).'];
      }
    },
    displayName(neu) {
      this.value.spec.displayName = neu;
    },
  },

  created() {
    this.registerBeforeHook(this.validateBefore, 'validate');
    this.registerBeforeHook(this.willSave, 'willSave');
  },

  methods: {
    willSave() {
      this.$set(this.value.metadata, 'annotations', {
        ...this.value.metadata.annotations,
        [DESCRIPTION]: this.description
      });
    },
    validateBefore() {
      if (!this.value.spec.url || this.value.spec.url.trim() === '') {
        this.errors = ['Please input image url!'];

        return false;
      }
    }
  }
};
</script>

<template>
  <form>
    <div class="row mb-20">
      <div class="col span-12">
        <LabeledInput
          v-model="url"
          :mode="mode"
          class="labeled-input--tooltip"
          required
        >
          <template #label>
            <label class="has-tooltip" :style="{'color':'var(--input-label)'}">
              Enter URL
              <i v-tooltip="t('vmimage.urlTip', {}, raw=true)" class="icon icon-info" style="font-size: 14px" />
            </label>
          </template>
        </LabeledInput>
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-12">
        <LabeledInput
          v-model="displayName"
          :mode="mode"
          label="Image Name"
          required
        />
      </div>
    </div>

    <div v-if="isCreate" class="row mb-20">
      <div class="col span-12">
        <LabeledInput
          v-model="description"
          type="multiline"
          :is-resize="true"
          label="Description"
        />
      </div>
    </div>

    <LabelAndAnnoTabs v-model="value" :mode="mode" />
    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </form>
</template>

<style lang="scss" scoped>
.resize {
  resize: auto;
}
.tip {
  font-size: 13px;
  font-style: italic;
}
code {
  border-radius: 2px;
  color: #e96900;
  font-size: .8rem;
  margin: 0 2px;
  padding: 3px 5px;
  white-space: pre-wrap;
}
.label {
  color: var(--input-label);
}
</style>
