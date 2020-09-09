<script>
import LabeledInput from '@/components/form/LabeledInput';
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';
import ResourceTabs from '@/components/form/ResourceTabs';
import { _CREATE } from '@/config/query-params';

const filesFormat = ['gz', 'qcow', 'qcow2', 'raw', 'img', 'xz', 'iso'];

export default {
  name: 'EditImage',

  components: {
    Footer,
    LabeledInput,
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
      this.value.metadata.generateName = 'image-';
    }

    return {
      url:         this.value.spec.url,
      displayName: this.value?.spec?.displayName || ''
    };
  },

  watch: {
    url(neu) {
      const suffixName = neu.split('/').pop();
      const fileSuffiic = suffixName.split('.').pop();

      this.value.spec.url = neu;
      if (filesFormat.includes(fileSuffiic)) {
        this.displayName = suffixName;
        this.errors = [];
      } else {
        this.errors = ['The URL you have entered ends in an extension that we do not support. We only accept image files that end in .img, .iso, .qcow2, .raw, and compressed (.tar, .gz, .xz) of the above formats).'];
      }
    },
    displayName(neu) {
      this.value.spec.displayName = neu;
    }
  },

  methods: {
    saveImage(buttonCb) {
      const isPass = this.verifyBefSave(buttonCb);

      if (!isPass) {
        return;
      }

      if (this.value.metadata.namespace && this.mode === 'create') {
        this.$delete(this.value.metadata, 'namespace');
      }
      this.save(buttonCb);
    },
    verifyBefSave(buttonCb) {
      if (!this.value.spec.url || this.value.spec.url.trim() === '') {
        this.errors = ['Please input image url!'];
        buttonCb(false);

        return false;
      } else {
        return true;
      }
    }
  }
};
</script>

<template>
  <form>
    <el-card class="box-card mb-20">
      <div class="row mb-20">
        <div class="col span-12">
          <LabeledInput
            v-model="url"
            :mode="mode"
            class="labeled-input--tooltip"
          >
            <template v-slot:label>
              <div>
                <span class="label">Enter Url</span>
                <el-tooltip v-if="isCreate" placement="top" effect="dark">
                  <div slot="content">
                    Protip: supports the <code>raw</code> and <code>qcow2</code> image formats which are supported by <a href="https://www.qemu.org/docs/master/system/images.html#disk-image-file-formats" target="_blank">qemu</a>.
                    Bootable ISO images can also be used and are treated like <code>raw</code> images.
                    Images may be compressed with either the <code>gz</code> or <code>xz</code> format.
                  </div>
                  <span><i class="el-icon-info"></i></span>
                </el-tooltip>
              </div>
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
          />
        </div>
      </div>

      <div v-if="isCreate" class="row mb-20">
        <div class="col span-12">
          <LabeledInput
            v-model="value.spec.description"
            type="multiline"
            :is-resize="true"
            label="Description"
          />
        </div>
      </div>

      <ResourceTabs v-model="value" :mode="mode" />
    </el-card>
    <Footer :mode="mode" :errors="errors" @save="saveImage" @done="done" />
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
