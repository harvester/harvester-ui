<script>
import randomstring from 'randomstring';
import CruResource from '@/components/CruResource';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import NameNsDescription from '@/components/form/NameNsDescription';
import LabeledInput from '@/components/form/LabeledInput';
import CreateEditView from '@/mixins/create-edit-view';
import FileSelector, { createOnSelected } from '@/components/form/FileSelector';

export default {
  name: 'EditSSH',

  components: {
    Tab,
    Tabbed,
    CruResource,
    LabeledInput,
    FileSelector,
    NameNsDescription
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

    return {
      publicKey:    this.value.spec.publicKey || '',
      randomString: '',
    };
  },

  watch: {
    publicKey(neu) {
      this.value.spec.publicKey = neu;

      const splitSSH = neu.split(/\s+/);

      if (splitSSH.length === 3) {
        if (splitSSH[2].includes('@')) {
          if (splitSSH[2].split('@')) {
            if (!this.value.metadata.name) {
              this.value.metadata.name = splitSSH[2].split('@')[0];
              this.randomString = randomstring.generate(10).toLowerCase();
            }
          }
        }
      }
    }
  },

  methods: { onKeySelected: createOnSelected('publicKey') },
};
</script>

<template>
  <div class="keypair-card">
    <CruResource
      :done-route="doneRoute"
      :resource="value"
      :mode="mode"
      :errors="errors"
      @apply-hooks="applyHooks"
      @finish="save"
    >
      <div class="header mb-20">
        <FileSelector v-if="isCreate" class="btn btn-sm bg-primary mt-10" :label="t('generic.readFromFile')" accept=".pub" @selected="onKeySelected" />
      </div>

      <NameNsDescription
        ref="nd"
        :key="randomString"
        v-model="value"
        :mode="mode"
        label="Name"
      />
      {{ randomString }}

      <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
        <Tab name="basic" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="3" class="bordered-table">
          <div class="row">
            <div class="col span-12">
              <LabeledInput
                v-model="publicKey"
                type="multiline"
                :mode="mode"
                :min-height="160"
                :label="t('harvester.keypairPage.keypair')"
                required
              />
            </div>
          </div>
        </Tab>
      </Tabbed>
    </CruResource>
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
