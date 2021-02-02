<script>
import { HARVESTER_UPGRADE } from '@/config/types';
import { HARVESTER_UPGRADESTATE } from '@/config/labels-annotations';
import { allHash } from '@/utils/promise';
import ProgressBarList from '@/components/ProgressBarList';

export default {
  name: 'UpgradeInfo',

  components: { ProgressBarList },

  async fetch() {
    const res = await allHash({ upgrade: this.$store.dispatch('cluster/findAll', { type: HARVESTER_UPGRADE }) });

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
      return !(this.currentResource?.getLabelValue(HARVESTER_UPGRADESTATE) === 'Succeeded');
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
  },

  methods: {}
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
        <span class="icon icon-dot-open"></span>
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
  margin-left: 40px;
  width: 38px;
  height: 55px;
  display: flex;
  align-items: center;

  .icon {
    font-size: 24px;
    color: #fff;
    margin-top: -4px;
    cursor: pointer;
  }
}
</style>
