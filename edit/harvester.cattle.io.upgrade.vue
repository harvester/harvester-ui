<script>
import CruResource from '@/components/CruResource';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabeledSelect from '@/components/form/LabeledSelect';
import NameNsDescription from '@/components/form/NameNsDescription';
import CreateEditView from '@/mixins/create-edit-view';
import { allHash } from '@/utils/promise';
import { HARVESTER_SETTING } from '@/config/types';

export default {
  name: 'EditUpgrade',

  components: {
    CruResource,
    Tab,
    Tabbed,
    LabeledSelect,
    NameNsDescription
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const hash = await allHash({ upgradeVersion: this.$store.dispatch('cluster/find', { type: HARVESTER_SETTING, id: 'upgradable-versions' }) });

    const versionString = hash.upgradeVersion?.value;
    const versionArr = versionString.split(',') || [];
    const versionList = versionArr.sort((a, b) => {
      return a > b ? -1 : 1;
    }).map( (V) => {
      return {
        label: V,
        value: V
      };
    });

    this.versionOptions = versionList;
  },

  data() {
    let spec = this.value?.spec || undefined;

    if (!spec) {
      spec = { version: '' };
      this.$set(this.value, 'spec', spec);
      this.$set(this.value.metadata, 'namespace', 'harvester-system');
    }

    return { versionOptions: [] };
  },
};
</script>

<template>
  <CruResource
    :done-route="doneRoute"
    :resource="value"
    :mode="mode"
    :errors="errors"
    @apply-hooks="applyHooks"
    @finish="save"
  >
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab name="basic" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="3" class="bordered-table">
        <NameNsDescription
          ref="nd"
          v-model="value"
          :namespaced="false"
          :mode="mode"
          label="Name"
        />

        <LabeledSelect
          v-model="value.spec.version"
          :label="t('harvester.userPage.username')"
          :options="versionOptions"
          :clearable="true"
        />
      </Tab>
    </Tabbed>
  </CruResource>
</template>
