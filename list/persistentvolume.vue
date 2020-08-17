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

    this.pv = hash.pv;
  },

  data() {
    return { pv: [] };
  },

  computed: {
    rows() {
      return this.pv;
    },
    headers() {
      return [
        {
          name:      'state',
          label:     'State',
          type:      'state',
          sort:      'name',
          value:     'spec.claimRef',
          formatter: 'volumesState'
        },
        {
          ...NAME,
          width: 300
        },
        {
          name:      'size',
          label:     'Size',
          value:     'spec.capacity.storage',
          sort:      'spec.capacity.storage',
        },
        {
          name:      'volumeMode',
          label:     'Volume Type',
          value:     'spec.volumeMode',
          sort:      'spec.volumeMode',
        },
        {
          name:      'accessMode',
          label:     'access Mode',
          value:     "$['spec']['accessModes'][0]",
          sort:      'spec.accessModes',
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
          name:      'Status',
          label:     'Status',
          type:      'status',
          value:     'spec.claimRef',
          sort:      'Status',
          formatter: 'volumesState'
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
