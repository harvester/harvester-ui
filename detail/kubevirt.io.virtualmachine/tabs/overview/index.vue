<script>
import HStack from '@/components/Layout/Stack/HStack';
import VStack from '@/components/Layout/Stack/VStack';
// import VmState from '@/components/formatter/vmState';
import OverviewDetails from './details';
import OverviewUtilization from './utilization';
import OverviewEvents from './events';

export default {
  name:       'Overview',
  components: {
    HStack,
    VStack,
    // VmState,
    OverviewDetails,
    OverviewUtilization,
    OverviewEvents,
  },
  props:      {
    resource: {
      type:     Object,
      required: true,
    },
    events: {
      type:     Array,
      required: true
    },
    mode: {
      type:     String,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    nics() {
      const count = this.resource?.spec?.domain?.devices?.interfaces?.length || 0;
      const unit = count > 1 ? 'NICs' : 'NIC';

      return `${ count } ${ unit }`;
    },
    disks() {
      const count = this.resource?.spec?.domain?.devices?.disks?.length || 0;
      const unit = count > 1 ? 'DISKs' : 'DISK';

      return `${ count } ${ unit }`;
    },
  },
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
          <OverviewDetails :resource="resource" mode="view" />
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
          {{ resource.status.phase }}
          <!-- <VmState :row="resource" /> -->
        </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Utilization</span>
        </div>
        <div>
          <OverviewUtilization :resource="{}" />
        </div>
      </el-card>
    </VStack>
    <VStack class="vm-overview__right">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Events</span>
        </div>
        <div>
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
  }
</style>
