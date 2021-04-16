<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabelValue from '@/components/LabelValue';
import BackupTargetSetting from './BackupTargetSetting';

export default {
  name: 'Detail',

  components: {
    Tab,
    Tabbed,
    BackupTargetSetting,
    LabelValue
  },

  props: {
    mode: {
      type:     String,
      required: true,
    },
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    return {};
  },

  computed: {
    isBackupTargetSetting() {
      return this.value.metadata.name === 'backup-target';
    }
  },
};
</script>

<template>
  <div>
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab v-if="isBackupTargetSetting" name="detail" :label="t('harvester.vmPage.detail.tabs.basics')" class="bordered-table">
        <BackupTargetSetting v-model="value" />
      </Tab>
      <Tab v-else name="basic" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="3" class="bordered-table">
        <div class="row mb-20">
          <div class="col span-12">
            <LabelValue :name="t('generic.default')" :value="value.default" class="mb-20" />
          </div>
        </div>

        <div class="row">
          <div class="col span-12">
            <LabelValue :name="t('generic.value')" :value="value.value" class="mb-20" />
          </div>
        </div>
      </Tab>
    </Tabbed>
  </div>
</template>
