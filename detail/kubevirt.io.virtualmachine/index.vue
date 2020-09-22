<script>
import { EVENT, VMI } from '@/config/types';
import CreateEditView from '@/mixins/create-edit-view';
import ResourceTabs from '@/components/form/ResourceTabs';
import Tab from '@/components/Tabbed/Tab';
import Details from './tabs/details/';
import Events from './tabs/events/';
import Migration from './tabs/migration';

export default {
  name: 'VMIDetailsPage',

  components: {
    Events,
    Details,
    ResourceTabs,
    Tab,
    Migration,
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  fetch() {
    this.getEvents();
  },

  data() {
    return {};
  },

  computed: {
    vmi() {
      const vmiList = this.$store.getters['cluster/all'](VMI) || [];
      const vmi = vmiList.find( (VMI) => {
        return VMI?.metadata?.ownerReferences?.[0]?.uid === this.value?.metadata?.uid;
      });

      return vmi;
    },
    allEvents() {
      return this.$store.getters['cluster/all'](EVENT);
    },
    events() {
      return this.allEvents.filter((e) => {
        return e?.involvedObject?.name === this.value?.metadata?.name;
      }).reverse();
    },
  },

  methods: {
    getEvents() {
      this.$store.dispatch('cluster/findAll', { type: EVENT });
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
        <Tab name="Migration" :label="t('vm.detail.tabs.migration')" :weight="5">
          <Migration :vmi-resource="vmi" />
        </Tab>
      </template>
    </ResourceTabs>
  </div>
</template>
