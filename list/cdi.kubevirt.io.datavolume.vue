<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
import { DATA_VOLUME, VM, PV } from '@/config/types';
import { allHash } from '@/utils/promise';
import Loading from '@/components/Loading';

export default {
  name:       'ListPV',
  components: { Loading, SortableTable },

  props: {
    schema: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const hash = await allHash({
      pv:         this.$store.dispatch('cluster/findAll', { type: PV, opt: { url: `${ PV }s` } }),
      vm:         this.$store.dispatch('cluster/findAll', { type: VM, opt: { url: `${ VM }s` } }),
      dataVolume: this.$store.dispatch('cluster/findAll', { type: DATA_VOLUME, opt: { url: `${ DATA_VOLUME }s` } })
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
          labelKey:  'harvester.tableHeaders.size',
          value:     'spec.pvc.resources.requests.storage',
          sort:      'spec.pvc.resources.requests.storage',
        },
        // {
        //   name:      'accessMode',
        //   label:     'Access Mode',
        //   value:     "$['spec']['pvc']['accessModes'][0]",
        //   sort:      "$['spec']['pvc']['accessModes'][0]",
        // },
        {
          name:      'AttachedVM',
          labelKey:  'harvester.tableHeaders.attachedVM',
          type:      'attached',
          value:      'spec.claimRef',
          sort:      'name',
          formatter: 'volumesState'
        },
        {
          name:      'progress',
          labelKey:  'harvester.tableHeaders.progress',
          type:      'progress',
          value:      'status.progress',
          sort:      'progress',
        },
        {
          name:      'phase',
          labelKey:  'harvester.tableHeaders.phase',
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

};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <SortableTable
    v-else
    v-bind="$attrs"
    :headers="headers"
    :rows="[...rows]"
    key-field="_key"
    v-on="$listeners"
  />
</template>
