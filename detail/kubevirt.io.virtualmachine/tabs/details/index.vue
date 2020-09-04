<script>
import HStack from '@/components/Layout/Stack/HStack';
import VStack from '@/components/Layout/Stack/VStack';
import VmState from '@/components/formatter/vmState';
import SSHKeysBar from '@/components/form/SSHKeysBar';
import { getPrefix } from '@/utils/url';
import OverviewBasics from './basics';
import OverviewConfigurations from './configurations';
import OverviewEvents from './events';
import OverviewInventory from './inventory';

export default {
  name: 'Overview',

  components: {
    HStack,
    VStack,
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
    return { guestAgentInfo: {} };
  },

  computed: {
    isDown() {
      return this.isEmpty(this.resource);
    },
    isGuestAgentInstalled() {
      const conditions = this.getVMIConditionsByType('AgentConnected');

      return conditions && conditions.length > 0 && conditions[0].status === 'True';
    },
  },

  watch: {
    isGuestAgentInstalled(neu) {
      if (neu) {
        this.getOsInfo();
      }
    }
  },

  methods: {
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    },
    getUrl(type) {
      const prefix = getPrefix();

      if (!prefix) {
        return `/apis/subresources.kubevirt.io/v1alpha3/namespaces/${ this.value.metadata.namespace }/virtualmachineinstances/${ this.value.metadata.name }/${ type }`;
      } else {
        return `${ prefix }apis/subresources.kubevirt.io/v1alpha3/namespaces/${ this.value.metadata.namespace }/virtualmachineinstances/${ this.value.metadata.name }/${ type }`;
      }
    },
    async getOsInfo() {
      const data = await this.$store.dispatch('cluster/request', {
        method:  'GET',
        headers: {
          'content-type': 'application/json',
          accept:         'application/json',
        },
        url: this.getUrl('guestosinfo')
      });

      this.guestAgentInfo = data;
    },
    getVMIConditionsByType(type) {
      const conditions = this.value?.status?.conditions || [];

      return conditions.filter(cond => cond.type === type);
    },
  }
};
</script>

<template>
  <HStack class="vm-overview">
    <VStack class="vm-overview__left">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <div class="row">
            <div class="col span-6">
              <span>Basics</span>
            </div>
            <div class="col span-6 text-right">
              <VmState v-model="value.id" :row="value" />
            </div>
          </div>
        </div>
        <div>
          <OverviewBasics v-model="value" :resource="resource" :guest-agent-info="guestAgentInfo" mode="view" />
        </div>
      </el-card>
    </VStack>
    <VStack class="vm-overview__center">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Configurations</span>
        </div>
        <div>
          <OverviewConfigurations v-model="value" :resource="resource" :mode="mode" :guest-agent-info="guestAgentInfo" />
        </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header">
          <div class="row">
            <div class="col span-8">
              Inventory
            </div>
            <div class="col span-4 text-right">
              <SSHKeysBar :resource="resource" />
            </div>
          </div>
        </div>
        <div>
          <OverviewInventory v-model="value" />
        </div>
      </el-card>
    </VStack>
    <VStack class="vm-overview__right">
      <el-card class="box-card events-card">
        <div slot="header" class="clearfix">
          <span>Events</span>
        </div>
        <div class="">
          <OverviewEvents :events="events" />
        </div>
      </el-card>
    </VStack>
  </HStack>
</template>

<style lang="scss">
  .vm-overview {
    flex-wrap: wrap;
    justify-content: space-between;

    &__left, &__right {
      width: 25%;
    }

    &__center {
      width: 45%;
    }

    &__left, &__center, &__right {
      .el-card {
        margin-bottom: 15px;
      }
      &:last-child, .el-card:last-child {
        margin: 0;
      }
    }

    .el-card__header {
      font-size: 16px;
    }

    .events-card .el-card__body {
      max-height: 500px;
      overflow: auto;
    }

    &__left {
      .badge-state {
        font-size: 12px;
        padding: 2px 4px;
      }
    }
  }
</style>
