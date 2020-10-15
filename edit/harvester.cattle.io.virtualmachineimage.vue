<script>
import Footer from '@/components/form/Footer';
import ResourceTabs from '@/components/form/ResourceTabs';
import CreateEditView from '@/mixins/create-edit-view';
import { _CREATE } from '@/config/query-params';

const filesFormat = ['gz', 'qcow', 'qcow2', 'raw', 'img', 'xz', 'iso'];

export default {
  name: 'EditImage',

  components: {
    Footer,
    ResourceTabs
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

    return {
      displayName,
      url: this.value.spec.url
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
    }
  },

  created() {
    this.registerBeforeHook(this.validateBefore, 'validate');
  },

  methods: {
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
    <a-card>
      <a-form layout="vertical">
        <a-form-item required>
          <template v-slot:label>
            Enter Url
            <a-tooltip placement="right">
              <template slot="title">
                Protip: supports the <code>raw</code> and <code>qcow2</code> image formats which are supported by <a href="https://www.qemu.org/docs/master/system/images.html#disk-image-file-formats" target="_blank">qemu</a>.
                Bootable ISO images can also be used and are treated like <code>raw</code> images.
                Images may be compressed with either the <code>gz</code> or <code>xz</code> format.
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </template>
          <a-input v-model="url"></a-input>
        </a-form-item>

        <a-form-item label="Image Name" required>
          <a-input
            v-model="displayName"
          />
        </a-form-item>

        <a-form-item v-if="isCreate" label="Description">
          <a-textarea
            v-model="value.spec.description"
            :auto-size="{ minRows: 5 }"
          />
        </a-form-item>
      </a-form>

      <ResourceTabs v-model="value" :mode="mode" />
    </a-card>
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
