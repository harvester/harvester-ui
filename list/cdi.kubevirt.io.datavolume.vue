<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import ResourceTable from '@/components/ResourceTable';
import { SCHEMA, DATA_VOLUME, VM, PV } from '@/config/types';
import { allHash } from '@/utils/promise';
import Loading from '@/components/Loading';

export default {
  name:       'ListPV',
  components: { Loading, ResourceTable },

  props: {
    schema: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const hash = await allHash({
      pv:         this.$store.dispatch('cluster/findAll', { type: PV }),
      vm:         this.$store.dispatch('cluster/findAll', { type: VM }),
      dataVolume: this.$store.dispatch('cluster/findAll', { type: DATA_VOLUME })
    });

    this.dataVolume = hash.dataVolume;
  },

  data() {
    return { dataVolume: [] };
  },

  computed: {
    rows() {
      return this.dataVolume;
    },
    headers() {
      return [
        STATE,
        {
          ...NAME,
          width: 300
        },
        {
          name:      'size',
          label:     'Size',
          value:     'spec.pvc.resources.requests.storage',
          sort:      'spec.pvc.resources.requests.storage',
        },
        {
          name:      'volumeMode',
          label:     'Volume Type',
          value:     'spec.pvc.volumeMode',
          sort:      'spec.pvc.volumeMode',
        },
        {
          name:      'accessMode',
          label:     'access Mode',
          value:     "$['spec']['pvc']['accessModes'][0]",
          sort:      "$['spec']['pvc']['accessModes'][0]",
        },
        {
          name:      'AttachedVM',
          label:     'Attached VM',
          type:      'attached',
          value:      'spec.claimRef',
          sort:      'name',
          formatter: 'volumesState'
        },
        {
          name:      'progress',
          label:     'Progress',
          type:      'progress',
          value:      'status.progress',
          sort:      'progress',
        },
        {
          name:      'phase',
          label:     'Phase',
          value:     'phaseStatus',
          sort:      ['stateSort', 'nameSort'],
          width:     130,
          default:   'unknown',
          state:     'phaseStatus',
          formatter: 'BadgeStatus',
        },
        AGE,
      ];
    },
  },

  // typeDisplay() {
  //   return 'Volumes';
  // },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <ResourceTable v-else :schema="schema" :rows="rows" :headers="headers" />
</template>
