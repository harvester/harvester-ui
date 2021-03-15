<script>
import { allHash } from '@/utils/promise';
import { LONGHORN_IO_ENGINE, HARVESTER_RESTORE } from '@/config/types';

export default {
  props:      {
    vm: {
      type:     Object,
      required: true
    }
  },

  async fetch() {
    await allHash({
      engines:  this.$store.dispatch('cluster/findAll', { type: LONGHORN_IO_ENGINE }),
      restores: this.$store.dispatch('cluster/findAll', { type: HARVESTER_RESTORE }),
    });
  },

  computed: {
    isShow() {
      return !!(this.vm.actualState === 'Restoring' && this.restoreName);
    },

    restoreName() {
      return this.vm.restoreName;
    },

    restoreResource() {
      const restores = this.$store.getters['cluster/all'](HARVESTER_RESTORE) || [];

      return restores.find( R => R?.metadata?.name === this.restoreName);
    },

    progress() {
      let out = 0;
      const engineList = this.restoreResource?.engineList || [];
      const engines = this.$store.getters['cluster/all'](LONGHORN_IO_ENGINE) || [];
      const AttachEngines = engines.filter( E => engineList.includes(E.spec.backupVolume));

      AttachEngines.map( (E) => {
        out += E.restoreProgress;
      });
      // console.log('---out', out, this.vm.actualState);

      return out;
    },
  },
};
</script>

<template>
  <div v-if="isShow">
    <span>{{ progress }}</span>
  </div>
</template>

<style lang="scss" scoped>

</style>
