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
          labelKey:  'harvester.tableHeaders.progress',
          value:     'status.progress',
          sort:      'status.progress',
          formatter: 'ImagePercentageBar',
        },
        {
          name:      'downloadedBytes',
          labelKey:  'harvester.tableHeaders.size',
          value:     'status.downloadedBytes',
          sort:      'status.downloadedBytes',
          formatter: 'ByteFormat',
          width:     120
        },
        AGE
      ],
    };
  },

  created() {
    this.schema.attributes.actuallyKind = 'Image';
  },

};
</script>

<template>
  <SortableTable
    v-bind="$attrs"
    :headers="headers"
    :rows="[...rows]"
    key-field="_key"
    v-on="$listeners"
  />
</template>
