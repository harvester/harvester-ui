<script>
import LabeledInput from '@/components/form/LabeledInput';
import ConsumptionGauge from '@/components/ConsumptionGauge';
import { formatSi, exponentNeeded, UNITS } from '@/utils/units';

export default {
  name: 'BasicNode',

  components: { LabeledInput, ConsumptionGauge },

  props: {
    value: {
      type:     Object,
      required: true,
    },

    mode: {
      type:     String,
      required: false,
      default:  'view'
    }
  },

  data() {
    return {};
  },

  computed: {
    memoryUnits() {
      const exponent = exponentNeeded(this.value.ramCapacity, 1024);

      return `${ UNITS[exponent] }iB`;
    },

    nodeType() {
      const isMaster = this.value.metadata?.labels?.['node-role.kubernetes.io/master'] === 'true';

      return isMaster ? this.t('node.detail.type.management') : this.t('node.detail.type.compute');
    },

    lastUpdateTime() {
      return this.value.status?.conditions?.[0]?.lastHeartbeatTime;
    }
  },

  methods: {
    memoryFormatter(value) {
      const formatOptions = {
        addSuffix:  false,
        increment:  1024,
      };

      return formatSi(value, formatOptions);
    },
  }
};
</script>

<template>
  <div class="host-detail">
    <h3>Overview</h3>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput v-model="value.internalIp" :label="t('node.detail.basic.hostIP')" :mode="mode" />
      </div>
      <div class="col span-6">
        <LabeledInput v-model="value.status.nodeInfo.osImage" :label="t('node.detail.basic.os')" :mode="mode" />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput v-model="nodeType" :label="t('node.detail.basic.role')" :mode="mode" />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput v-model="value.metadata.creationTimestamp" :label="t('node.detail.basic.create')" :mode="mode" />
      </div>
      <div class="col span-6">
        <LabeledInput v-model="lastUpdateTime" :label="t('node.detail.basic.update')" :mode="mode" />
      </div>
    </div>
    <hr class="divider" />
    <h3>Configurations</h3>
    <div class="row mb-20">
      <div class="col span-4">
        <ConsumptionGauge :resource-name="t('node.detail.glance.consumptionGauge.cpu')" :capacity="value.cpuCapacity" :used="value.cpuUsage" />
      </div>
      <div class="col span-4">
        <ConsumptionGauge :resource-name="t('node.detail.glance.consumptionGauge.memory')" :capacity="value.ramCapacity" :used="value.ramUsage" :units="memoryUnits" :number-formatter="memoryFormatter" />
      </div>
      <div class="col span-4">
        <ConsumptionGauge :resource-name="t('node.detail.glance.consumptionGauge.pods')" :capacity="value.podCapacity" :used="value.podConsumed" />
      </div>
    </div>
    <hr class="divider" />
    <h3>More Information</h3>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput v-model="value.status.nodeInfo.systemUUID" :label="t('node.detail.more.uuid')" :mode="mode" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.host-detail {
  .consumption-gauge {
    margin-top: 25px;
    min-height: auto;

    .consumption {
      margin-bottom: 15px;
    }
  }
}

</style>
