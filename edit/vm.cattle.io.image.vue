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

    return { url: this.value.spec.url };
  },

  watch: {
    url(neu) {
      const suffixName = neu.split('/').pop();
      const fileSuffiic = suffixName.split('.').pop();

      this.value.spec.url = neu;
      if (filesFormat.includes(fileSuffiic)) {
        this.value.spec.displayName = suffixName;
        this.errors = [];
      } else {
        this.errors = ['The URL you have entered ends in an extension that we do not support. We only accept image files that end in gz, bz2, vmdk, vhdx, qcow, qcow2, vdi, raw, img, xz. (.zip is not supported).'];
      }
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
    <h5 class="mb-20">
      Supports the raw and qcow2 image formats which are supported by qemu.
      Bootable ISO images can also be used and are treated like raw images.
      Images may be compressed with either the gz or xz format.
    </h5>

    <div class="row mb-20">
      <div class="col span-12">
        <LabeledInput
          v-model="value.spec.displayName"
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
</style>
