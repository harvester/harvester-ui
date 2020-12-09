<script>
import CruResource from '@/components/CruResource';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabeledInput from '@/components/form/LabeledInput';
import KeyValue from '@/components/form/KeyValue';
import NameNsDescription from '@/components/form/NameNsDescription';
import CreateEditView from '@/mixins/create-edit-view';
import { DESCRIPTION } from '@/config/labels-annotations';

const filesFormat = ['gz', 'qcow', 'qcow2', 'raw', 'img', 'xz', 'iso'];

export default {
  name: 'EditImage',

  components: {
    Tab,
    Tabbed,
    CruResource,
    LabeledInput,
    NameNsDescription,
    KeyValue
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
    const description = this.value.metadata?.annotations?.[DESCRIPTION];

    if ( !this.value.spec ) {
      spec = {};

      this.$set(this.value, 'spec', spec);
    }

    if ( this.value.metadata ) {
      this.value.metadata.generateName = 'image-'; // back end needs
    }

    if (description) {
      // if description exist, copy it, then remove it from annotations
      this.$set(this.value.spec, 'description', description);
      this.value.setAnnotation(DESCRIPTION, null);
    }

    return { url: this.value.spec.url };
  },

  watch: {
    url(neu) {
      const url = neu.trim();
      const suffixName = url.split('/').pop();
      const fileSuffiic = suffixName.split('.').pop();

      this.value.spec.url = url;
      if (filesFormat.includes(fileSuffiic)) {
        if (!this.value.spec.displayName) {
          this.$refs.nd.changeNameAndNamespace({ text: suffixName });
        }
      }
    },
  },

  created() {
    this.registerBeforeHook(this.willSave, 'willSave');
    this.registerFailureHook(this.handleError, 'save');
  },

  methods: {
    willSave() {
      // before save image, save description in annotations.
      this.value.setAnnotation(DESCRIPTION, this.value.spec.description);
      this.value.spec.description = undefined;
    },

    handleError() {
      this.value.spec.description = this.value.getAnnotationValue(DESCRIPTION);
    },

  }
};
</script>

<template>
  <div>
    <CruResource
      :done-route="doneRoute"
      :resource="value"
      :mode="mode"
      :errors="errors"
      @apply-hooks="applyHooks"
      @finish="save"
    >
      <NameNsDescription
        ref="nd"
        v-model="value"
        :namespaced="false"
        :mode="mode"
        label="Name"
        name-key="spec.displayName"
        description-key="spec.description"
      />

      <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
        <Tab name="basic" :label="t('vm.detail.tabs.basics')" :weight="3" class="bordered-table">
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
                    URL
                    <i v-tooltip="t('vmimage.urlTip', {}, raw=true)" class="icon icon-info" style="font-size: 14px" />
                  </label>
                </template>
              </LabeledInput>
            </div>
          </div>
        </Tab>
        <Tab name="labels" :label="t('labels.label.title')" :weight="2" class="bordered-table">
          <KeyValue
            key="labels"
            :value="value.labels"
            :add-label="t('labels.addLabel')"
            :mode="mode"
            :title="t('labels.label.title')"
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
