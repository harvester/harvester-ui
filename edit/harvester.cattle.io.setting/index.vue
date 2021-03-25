<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabeledInput from '@/components/form/LabeledInput';
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';
import NetworkSetting from './NetworkSetting';
import BackupTarget from './BackupTarget';
import RancherEnabled from './RancherEnabled';

export default {
  name: 'Networks',

  components: {
    Footer,
    NetworkSetting,
    BackupTarget,
    Tab,
    Tabbed,
    LabeledInput,
    RancherEnabled
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    const spec = this.value.spec;

    // if (!spec) {
    //   spec = { pvc: { resources: { requests: { storage: '' } } } };
    //   this.value.spec = spec;
    // }

    return {
      spec,
      randow: Math.random(),
      index:  0,
      errors: []
    };
  },

  computed: {
    isNetworkSetting() {
      return this.value.metadata.name === 'network-setting';
    },
    isBackupTarget() {
      return this.value.metadata.name === 'backup-target';
    },

    isRancherEnabled() {
      return this.value.metadata.name === 'rancher-enabled';
    }
  },
};
</script>

<template>
  <div>
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab v-if="isNetworkSetting" name="detail" :label="t('harvester.vmPage.detail.tabs.basics')" class="bordered-table">
        <NetworkSetting v-model="value" />
      </Tab>

      <Tab v-if="isBackupTarget" name="detail" :label="t('harvester.vmPage.detail.tabs.basics')" class="bordered-table">
        <BackupTarget v-model="value" />
      </Tab>

      <Tab v-if="isRancherEnabled" name="detail" :label="t('harvester.vmPage.detail.tabs.basics')" class="bordered-table">
        <RancherEnabled v-model="value" />
      </Tab>

      <Tab v-else name="basic" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="3" class="bordered-table">
        <div class="row mb-20">
          <div class="col span-12">
            <LabeledInput
              v-model="value.default"
              :label="t('generic.default')"
              class="mb-20"
              mode="view"
            />
          </div>
        </div>

        <div class="row">
          <div class="col span-12">
            <LabeledInput
              v-model="value.value"
              :mode="mode"
              :label="t('generic.value')"
            />
          </div>
        </div>
      </Tab>
    </Tabbed>
    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>
