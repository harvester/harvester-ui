<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import { EVENT, VMI } from '@/config/types';
import CreateEditView from '@/mixins/create-edit-view';
import Details from './tabs/details/';
import Events from './tabs/events/';
import Migration from './tabs/migration';

export default {
  name: 'VMIDetailsPage',

  components: {
    Tab,
    Tabbed,
    Events,
    Details,
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
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab name="detail" :label="t('vm.detail.tabs.details')" class="bordered-table">
        <Details v-model="value" :resource="vmi" :events="events" mode="edit" />
      </Tab>

      <Tab name="event" :label="t('vm.detail.tabs.events')">
        <Events :resource="vmi" :events="events" />
      </Tab>

      <Tab name="migration" :label="t('vm.detail.tabs.migration')">
        <Migration v-model="value" :vmi-resource="vmi" />
      </Tab>
    </Tabbed>
  </div>
</template>
