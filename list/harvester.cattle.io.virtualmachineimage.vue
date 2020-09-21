<script>
import SortableTable from '@/components/SortableTable';
import { STATE, NAME, AGE } from '@/config/table-headers';

export default {
  name:       'ListImage',
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

  data() {
    return {
      headers: [
        STATE,
        {
          ...NAME,
          value: 'spec.displayName',
          width:     300
        },
        {
          name:      'Uploaded',
          label:     'Progress',
          value:     'status.progress',
          sort:      'status.progress',
          formatter: 'ImagePercentageBar',
        },
        {
          name:      'downloadedBytes',
          label:     'Size',
          value:     'status.downloadedBytes',
          sort:      'status.downloadedBytes',
          formatter: 'ByteFormat',
          width:     120
        },
        AGE
      ],
    };
  },

  customCreateFormName() {
    return 'Image';
  },

  typeDisplay() {
    return 'Images';
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
