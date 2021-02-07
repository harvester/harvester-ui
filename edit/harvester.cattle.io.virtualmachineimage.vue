<script>
import VueUploadComponent from 'vue-upload-component';
import CruResource from '@/components/CruResource';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import RadioGroup from '@/components/form/RadioGroup';
import LabeledInput from '@/components/form/LabeledInput';
import KeyValue from '@/components/form/KeyValue';
import NameNsDescription from '@/components/form/NameNsDescription';
import CreateEditView from '@/mixins/create-edit-view';
import Cookie from 'js-cookie';

const filesFormat = ['gz', 'qcow', 'qcow2', 'raw', 'img', 'xz', 'iso'];

export default {
  name: 'EditImage',

  components: {
    Tab,
    Tabbed,
    CruResource,
    LabeledInput,
    NameNsDescription,
    KeyValue,
    RadioGroup,
    fileLoad: VueUploadComponent
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

      this.$set(this.value, 'spec', spec);
    }

    if ( this.value.metadata ) {
      this.value.metadata.generateName = 'image-'; // backend needs
    }

    return {
      url:         this.value.spec.url,
      uploadMode:  'url',
      files:       [],
      displayName: '',
      resource:    '',
      headers:     {},
      fileUrl:     '',
      fileSize:        { 'File-Size': '' }
    };
  },

  computed: {
    uploadFileName() {
      return this.files[0]?.name || '';
    }
  },

  watch: {
    url(neu) {
      const url = neu.trim();
      const suffixName = url.split('/').pop();
      const fileSuffiic = suffixName.split('.').pop().toLowerCase();

      this.value.spec.url = url;
      if (filesFormat.includes(fileSuffiic)) {
        if (!this.value.spec.displayName) {
          this.$refs.nd.changeNameAndNamespace({ text: suffixName });
        }
      }
    },
    'value.spec.displayName'(neu) {
      this.displayName = neu;
    },
    uploadMode(neu) {
      this.$set(this, 'files', []);
      this.url = '';
    }
  },

  methods: {
    inputFile(newFile, oldFile) {
      const file = newFile || oldFile;
      const csrf = Cookie.get('CSRF');
      const header = { 'X-Api-Csrf': csrf, 'File-Size': file.size };

      file.headers = header;
    },

    inputFilter(newFile, oldFile, prevent) {
      if (!/\.(gz|qcow|qcow2|raw|img|xz|iso)$/i.test(newFile.name.toLowerCase())) {
        return prevent();
      }
    },

    async saveImage(buttonCb) {
      const displayName = this.value.spec.displayName;

      if (!displayName) {
        this.errors = ['Name is required!'];
        buttonCb(false);

        return ;
      }

      if (this.uploadMode === 'url' && !this.value.spec?.url) {
        this.errors = ['URL is required!'];
        buttonCb(false);

        return ;
      }

      if (this.uploadMode !== 'url') {
        if (!this.files.length) {
          this.errors = ['File is required!'];
          buttonCb(false);

          return ;
        }

        try {
          const res = await this.value.save({ extend: { isRes: true } });

          const fileUrl = `v1/harvester.cattle.io.virtualmachineimages/${ res.id }?action=upload` || '';

          this.files[0].postAction = fileUrl;
          this.$refs.upload.active = true;
          buttonCb(true);
          this.done();
        } catch (err) {
          this.errors = [err?.message];
          buttonCb(false);
        }
      } else {
        this.save(buttonCb);
      }
    }
  },

};
</script>

<template>
  <div id="vmImage">
    <CruResource
      :done-route="doneRoute"
      :resource="value"
      :mode="mode"
      :errors="errors"
      @apply-hooks="applyHooks"
      @finish="saveImage"
    >
      <NameNsDescription
        ref="nd"
        v-model="value"
        :namespaced="false"
        :mode="mode"
        label="Name"
        name-key="spec.displayName"
      />

      <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
        <Tab name="basic" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="3" class="bordered-table">
          <RadioGroup
            v-if="isCreate"
            v-model="uploadMode"
            name="model"
            :options="['url','file']"
            :labels="['URL', 'File']"
            :mode="mode"
          />
          <div class="row mb-20 mt-20">
            <div class="col span-12">
              <LabeledInput
                v-if="uploadMode === 'url'"
                v-model="url"
                :mode="mode"
                class="labeled-input--tooltip"
                required
              >
                <template #label>
                  <label class="has-tooltip" :style="{'color':'var(--input-label)'}">
                    {{ t('harvester.imagePage.url') }}
                    <i v-tooltip="t('harvester.imagePage.urlTip', {}, raw=true)" class="icon icon-info" style="font-size: 14px" />
                  </label>
                </template>
              </LabeledInput>

              <div v-else>
                <fileLoad
                  ref="upload"
                  v-model="files"
                  class="btn bg-primary"
                  :drop="true"
                  :multiple="false"
                  post-action="v1/harvester.cattle.io.virtualmachineimages/default/image-7bv9j?action=upload"
                  :headers="headers"
                  @input-filter="inputFilter"
                  @input-file="inputFile"
                >
                  Upload
                </fileLoad>

                <div v-if="uploadFileName" class="fileName">
                  <span class="icon icon-file"></span> {{ uploadFileName }}
                </div>
              </div>
            </div>
          </div>
        </Tab>
        <Tab name="labels" :label="t('labels.labels.title')" :weight="2" class="bordered-table">
          <KeyValue
            key="labels"
            :value="value.labels"
            :add-label="t('labels.addLabel')"
            :mode="mode"
            :title="t('labels.labels.title')"
            :pad-left="false"
            :read-allowed="false"
            @input="value.setLabels"
          />
        </Tab>
      </Tabbed>
    </CruResource>
  </div>
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

<style lang="scss">
#vmImage {
  .radio-group {
    display: flex;
    .radio-container {
      margin-right: 30px;
    }
  }

  .fileName {
    color: #606266;
    display: block;
    margin-right: 40px;
    overflow: hidden;
    padding-left: 4px;
    text-overflow: ellipsis;
    transition: color .3s;
    white-space: nowrap;
    margin-top: 10px;

    span.icon {
      font-size: 16px;
    }
  }
}

</style>
