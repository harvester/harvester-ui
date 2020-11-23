<script>
import VmState from '@/components/formatter/BadgeStateFormatter';
import BaseCard from '@/components/BaseCard';
import SSHKeysBar from '@/components/form/SSHKeysBar';
import OverviewBasics from './basics';
import OverviewConfigurations from './configurations';
import OverviewEvents from './events';
import OverviewInventory from './inventory';

export default {
  name: 'Overview',

  components: {
    BaseCard,
    VmState,
    OverviewBasics,
    OverviewConfigurations,
    OverviewEvents,
    OverviewInventory,
    SSHKeysBar,
  },

  props: {
    resource: {
      type:     Object,
      required: true,
      default:  () => {
        return {};
      }
    },
    events: {
      type:     Array,
      required: true
    },
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
    isDown() {
      return this.isEmpty(this.resource);
    }
  },

  methods: {
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    }
  }
};
</script>

<template>
  <div>
    <div class="row mb-20">
      <div class="col span-8">
        <BaseCard class="mb-20">
          <template #title>
            <div class="col span-8">
              <h4>Basics</h4>
            </div>
            <div class="col span-4 text-right">
              <VmState :row="value" />
            </div>
          </template>
          <template #body>
            <OverviewBasics v-model="value" :resource="resource" mode="view" />
          </template>
        </BaseCard>

        <BaseCard title="Configurations" class="mb-20">
          <template #body>
            <OverviewConfigurations v-model="value" :resource="resource" :mode="mode" />
          </template>
        </BaseCard>

        <BaseCard class="mb-20">
          <template #title>
            <div class="col span-8">
              <h4>Inventory</h4>
            </div>
            <div class="col span-4 text-right">
              <SSHKeysBar v-model="value" />
            </div>
          </template>
          <template #body>
            <OverviewInventory v-model="value" />
          </template>
        </BaseCard>
      </div>

      <div class="col span-4">
        <BaseCard title="Events">
          <template #body>
            <OverviewEvents :events="events" />
          </template>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
