<script>
import { allHash } from '@/utils/promise';
import { LONGHORN_SETTING } from '@/config/types';

export default {
  props: {
    value: {
      type:    String,
      default: ''
    }
  },

  async fetch() {
    const hash = await allHash({ longhornSettings: this.$store.dispatch('cluster/findAll', { type: LONGHORN_SETTING }) });

    this.longhornSettings = hash.longhornSettings;
  },

  data() {
    return { longhornSettings: [] };
  },

  computed: {
    isMatch() {
      const longhornSettings = this.$store.getters['cluster/all'](LONGHORN_SETTING) || [];
      const resource = longhornSettings.find( V => V.id === 'longhorn-system/backup-target');

      return this.value === resource?.value;
    }
  }
};
</script>

<template>
  <div v-if="isMatch">
    {{ value }}
  </div>
  <div v-else>
    {{ value }}
    <p v-if="value" class="text-error">
      {{ t('harvester.backUpPage.matchTarget') }}
    </p>
  </div>
</template>
