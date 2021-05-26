<script>
import { allHash } from '@/utils/promise';
import { LONGHORN_IO_ENGINE, HCI, PVC } from '@/config/types';
import PercentageBar from '../PercentageBar';

export default {
  components: { PercentageBar },
  props:      {
    vm: {
      type:     Object,
      required: true
    }
  },

  async fetch() {
    await allHash({
      engines:         this.$store.dispatch('cluster/findAll', { type: LONGHORN_IO_ENGINE }),
      restores:        this.$store.dispatch('cluster/findAll', { type: HCI.RESTORE }),
      PVC:      this.$store.dispatch('cluster/findAll', { type: PVC }),
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
      const restores = this.$store.getters['cluster/all'](HCI.RESTORE) || [];

      return restores.find( R => R?.metadata?.name === this.restoreName);
    },

    progress() {
      let out = 0;
      const pvcNamesList = this.restoreResource?.pvcNames || [];

      const pvcs = this.$store.getters['cluster/all'](PVC);
      const engines = this.$store.getters['cluster/all'](LONGHORN_IO_ENGINE) || [];

      const AttachPVCVolumeName = pvcs.filter( (V) => {
        return pvcNamesList.includes(V?.metadata.name);
      }).map( V => V.spec.volumeName);

      const AttachEngines = engines.filter( E => AttachPVCVolumeName.includes(E.metadata.labels.longhornvolume));

      AttachEngines.map( (E) => {
        out += E.restoreProgress;
      });

      return out === 0 ? out : parseInt(out / pvcNamesList.length);
    },
  },
};
</script>

<template>
  <div v-if="isShow" class="bar">
    <PercentageBar v-model="progress" :height="6" preferred-direction="MORE" :tooltip="true" />
  </div>
</template>

<style lang="scss" scoped>
.bar {
  margin-bottom: 4px;
}
</style>
