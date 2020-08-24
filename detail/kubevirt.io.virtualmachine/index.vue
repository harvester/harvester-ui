<script>
import { EVENT, VMI } from '@/config/types';
import CreateEditView from '@/mixins/create-edit-view';
import ResourceTabs from '@/components/form/ResourceTabs';
import Tab from '@/components/Tabbed/Tab';
import Console from '@/components/form/Console';
import Overview from './tabs/overview/';
import Details from './tabs/details/';
import Events from './tabs/events/';

export default {
  name: 'Novnc',

  components: {
    Console,
    Details,
    Events,
    Overview,
    ResourceTabs,
    Tab,
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    return { allEvents: [] };
  },

  computed: {
    vmi() {
      const vmiList = this.$store.getters['cluster/all'](VMI) || [];
      const vmi = vmiList.find( (VMI) => {
        return VMI?.metadata?.ownerReferences?.[0]?.uid === this.value?.metadata?.uid;
      });

      return vmi;
    },
    events() {
      return this.allEvents.filter((e) => {
        return e?.involvedObject?.name === this.vmi?.metadata?.name;
      }).reverse();
    },
  },

  created() {
    this.getEvents();
  },

  methods: {
    async getEvents() {
      const choices = await this.$store.dispatch('cluster/findAll', { type: EVENT });

      this.allEvents = choices || [];
    }
  }
};
</script>

<template>
  <div>
    <ResourceTabs v-model="value" :mode="mode">
      <template #before>
        <Tab name="overview" :label="t('vm.detail.tabs.overview')" :weight="1">
          <Overview :resource="vmi" :events="events" mode="view" />
        </Tab>
        <Tab name="details" :label="t('vm.detail.tabs.details')" :weight="2">
          <Details v-model="value" :resource="vmi" mode="edit" />
        </Tab>
        <Tab name="environment" :label="t('vm.detail.tabs.environment')" :weight="3">
        </Tab>
        <Tab name="events" :label="t('vm.detail.tabs.events')" :weight="4">
          <Events :events="events" />
        </Tab>
        <Tab name="console" :label="t('vm.detail.tabs.console')" :weight="5">
          <Console v-model="vmi" />
        </Tab>
        <Tab name="networkInterfaces" :label="t('vm.detail.tabs.networkInterfaces')" :weight="6">
        </Tab>
        <Tab name="disks" :label="t('vm.detail.tabs.disks')" :weight="7">
        </Tab>
      </template>
    </ResourceTabs>
  </div>
</template>
