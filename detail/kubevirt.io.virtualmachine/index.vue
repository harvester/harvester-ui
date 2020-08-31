<script>
import { EVENT, VMI } from '@/config/types';
import CreateEditView from '@/mixins/create-edit-view';
import ResourceTabs from '@/components/form/ResourceTabs';
import Tab from '@/components/Tabbed/Tab';
import Details from './tabs/details/';
import Events from './tabs/events/';

export default {
  name: 'VMIDetailsPage',

  components: {
    Events,
    Details,
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
        return e?.involvedObject?.name === this.value?.metadata?.name;
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
        <Tab name="details" :label="t('vm.detail.tabs.details')" :weight="1">
          <Details v-model="value" :resource="vmi" :events="events" mode="edit" />
        </Tab>
        <Tab name="events" :label="t('vm.detail.tabs.events')" :weight="4">
          <Events :resource="vmi" :events="events" />
        </Tab>
      </template>
    </ResourceTabs>
  </div>
</template>
