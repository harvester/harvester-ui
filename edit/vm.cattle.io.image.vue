<script>
import LabeledInput from '@/components/form/LabeledInput';
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';
import ResourceTabs from '@/components/form/ResourceTabs';

const filesFormat = ['gz', 'bz2', 'vmdk', 'vhdx', 'qcow', 'qcow2', 'vdi', 'raw', 'img', 'xz'];

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
        this.errors = ['The URL you have entered ends in an extension that we do not support. We only accept image files that end in gz, bz2, vmdk, vhdx, qcow, qcow2, vdi, raw, img, xz. (.zip is not supported).'];
      }
    },
    displayName(neu) {
      this.value.spec.displayName = neu;
    }
  }
};
</script>

<template>
  <form>
    <div class="row mb-6">
      <div class="col span-12">
        <LabeledInput
          v-model="url"
          :mode="mode"
          label="Enter URL"
        />
      </div>
    </div>
    <h5 class="mb-20 tip">
      Protip: CDI supports the <code>raw</code> and <code>qcow2</code> image formats which are supported by <a href="https://www.qemu.org/docs/master/system/images.html#disk-image-file-formats" target="_blank">qemu</a>.
      Bootable ISO images can also be used and are treated like <code>raw</code> images.
      Images may be compressed with either the <code>gz</code> or <code>xz</code> format.
    </h5>

    <div class="row mb-20">
      <div class="col span-12">
        <LabeledInput
          v-model="displayName"
          :mode="mode"
          label="Image Name"
        />
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-12">
        <LabeledInput
          v-model="value.spec.description"
          type="multiline"
          :is-resize="true"
          label="Notes"
        />
      </div>
    </div>

    <ResourceTabs v-model="value" :mode="mode" />

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
</style>
