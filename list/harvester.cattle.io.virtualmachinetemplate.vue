<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
import { SCHEMA, DATA_VOLUME, VM, PV } from '@/config/types';
import { allHash } from '@/utils/promise';
import Loading from '@/components/Loading';

export default {
  name:       'ListPV',
  components: { SortableTable },

  props: {
    schema: {
      type:     Object,
      required: true,
    },

    rows: {
      type:     Array,
      required: true,
    },
  },

  computed: {
    headers() {
      return [
        STATE,
        NAME,
        {
          name:      'default',
          label:     'Default Version',
          value:     'status.defaultVersion',
        },
        {
          name:      'latest',
          label:     'Latest Version',
          value:     'status.latestVersion',
        },
        AGE
      ];
    },
  },

  typeDisplay() {
    return 'Templates';
  },
};
</script>

<template>
  <el-card class="box-card">
    <SortableTable
      v-bind="$attrs"
      :headers="headers"
      :rows="[...rows]"
      key-field="_key"
      v-on="$listeners"
    />
  </el-card>
</template>
