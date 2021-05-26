<script>
import { HCI } from '@/config/types';
import { HARVESTER_UPGRADESTATE } from '@/config/labels-annotations';
import { allHash } from '@/utils/promise';
import ProgressBarList from '@/components/ProgressBarList';
import GraphCircle from '@/components/graph/Circle';

export default {
  name: 'UpgradeInfo',

  components: { ProgressBarList, GraphCircle },

  async fetch() {
    const res = await allHash({ upgrade: this.$store.dispatch('cluster/findAll', { type: HCI.UPGRADE }) });

    this.upgrade = res.upgrade;
  },

  data() {
    return { upgrade: [] };
  },

  computed: {
    currentResource() {
      return this.upgrade.find( U => U.isCurrentUpgrade);
    },

    isShow() {
      return !(this.currentResource?.getLabelValue(HARVESTER_UPGRADESTATE) === 'Succeeded') && this.currentResource;
    },

    nodesStatus() {
      return this.currentResource?.nodeUpgradeMessage;
    },

    sysServiceUpgradeMessage() {
      return this.currentResource?.sysServiceUpgradeMessage;
    },

    sysServiceTotal() {
      return this.sysServiceUpgradeMessage?.[0].percent || 0;
    },

    nodesPercent() {
      return this.currentResource?.nodeTotalPercent || 0;
    },

    totalPercent() {
      return (this.currentResource?.totalPercent / 100) || 0;
    }
  }
};
</script>

<template>
  <div v-if="isShow">
    <v-popover
      v-tooltip="{
        placement: 'bottom-left',
      }"
    >
      <div class="upgrade tooltip-target">
        <GraphCircle :stroke-width="14" primary-stroke-color="#ffeb01" secondary-stroke-color="white" :percentage="totalPercent" />
      </div>

      <template slot="popover">
        <div class="upgrade-info">
          <ProgressBarList :title="t('harvester.upgradePage.upgradeNode')" :precent="nodesPercent" :list="nodesStatus" />
          <p class="bordered-section"></p>
          <ProgressBarList :title="t('harvester.upgradePage.upgradeSysService')" :precent="sysServiceTotal" :list="sysServiceUpgradeMessage" />
        </div>
      </template>
    </v-popover>
  </div>
</template>

<style lang="scss" scoped>
.upgrade-info {
  width: 300px;
  min-height: 100px;
  margin-bottom: 30px;
}

.upgrade {
  margin: 5px 0px 0px 30px;
  width: 22px;
  height: 22px;
  cursor: pointer;
}
</style>
