<script>
import HStack from '@/components/Layout/Stack/HStack';
import VStack from '@/components/Layout/Stack/VStack';
import VmState from '@/components/formatter/vmState';
import OverviewDetails from './details';
import OverviewUtilization from './utilization';
import OverviewEvents from './events';

export default {
  name: 'Overview',

  components: {
    HStack,
    VStack,
    VmState,
    OverviewDetails,
    OverviewUtilization,
    OverviewEvents,
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
    nics() {
      const count = this.value?.spec?.template?.spec?.domain?.devices?.interfaces?.length || 0;
      const unit = count > 1 ? 'NICs' : 'NIC';

      return `${ count } ${ unit }`;
    },
    disks() {
      const count = this.value?.spec?.template?.spec?.domain?.devices?.disks?.length || 0;
      const unit = count > 1 ? 'DISKs' : 'DISK';

      return `${ count } ${ unit }`;
    },
    isDown() {
      return this.isEmpty(this.resource);
    },
  },

  methods: {
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    }
  }
};
</script>

<template>
  <HStack class="vm-overview">
    <VStack class="vm-overview__left">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Details</span>
        </div>
        <div>
          <OverviewDetails v-model="value" :resource="resource" mode="view" />
        </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Inventory</span>
        </div>
        <div class="inventory__body">
          <div>{{ nics }}</div>
          <div>{{ disks }}</div>
        </div>
      </el-card>
    </VStack>
    <VStack class="vm-overview__center">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Status</span>
        </div>
        <div>
          <VmState v-model="value.id" :row="value" />
        </div>
      </el-card>
      <el-card v-if="!isDown" class="box-card">
        <div slot="header" class="clearfix">
          <span>Utilization</span>
        </div>
        <div>
          <OverviewUtilization :resource="{}" />
        </div>
      </el-card>
    </VStack>
    <VStack v-if="!isDown" class="vm-overview__right">
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
    &__left, &__right {
      width: 25%;
    }

    &__center {
      flex: 1;
    }

    &__left, &__center, &__right {
        margin-right: 15px;
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

    .inventory__body {
      font-size: 16px;

      div {
        &:first-child {
          margin-bottom: 15px;
        }
      }
    }

    .events-card .el-card__body {
      max-height: 500px;
      overflow: auto;
    }
  }
</style>
