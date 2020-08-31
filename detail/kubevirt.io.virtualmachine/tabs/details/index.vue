<script>
import HStack from '@/components/Layout/Stack/HStack';
import VStack from '@/components/Layout/Stack/VStack';
import VmState from '@/components/formatter/vmState';
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
    },
  },

  methods: {
    showKeyModal() {
      this.$refs['overviewInventory'].toggleModal(true);
    },
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
          <span>Basics</span>
        </div>
        <div>
          <OverviewBasics v-model="value" :resource="resource" mode="view" />
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
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Configurations</span>
        </div>
        <div>
          <OverviewConfigurations v-model="value" :resource="resource" :mode="mode" />
        </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-view" @click="showKeyModal()">
            SSH-keys
          </el-button>
          <span>Inventory</span>
        </div>
        <div>
          <OverviewInventory ref="overviewInventory" v-model="value" />
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

    .events-card .el-card__body {
      max-height: 500px;
      overflow: auto;
    }
  }
</style>
