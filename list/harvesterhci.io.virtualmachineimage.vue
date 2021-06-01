<script>
import ResourceTable from '@/components/ResourceTable';
import { STATE, NAME, AGE, NAMESPACE } from '@/config/table-headers';

export default {
  name:       'ListImage',
  components: { ResourceTable },

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
      headers:     [
        STATE,
        {
          ...NAME,
          value: 'spec.displayName',
          width:     300
        },
        NAMESPACE,
        // {
        //   name:      'Uploaded',
        //   labelKey:  'harvester.tableHeaders.progress',
        //   value:     'status.progress',
        //   sort:      'status.progress',
        //   formatter: 'ImagePercentageBar',
        // },
        // {
        //   name:      'Message',
        //   labelKey:  'harvester.tableHeaders.message',
        //   value:     'status.conditions',
        //   sort:      'status.conditions',
        //   formatter: 'ImageMessage',
        // },
        {
          name:      'downloadedBytes',
          labelKey:  'harvester.tableHeaders.size',
          value:     'status.size',
          sort:      'status.size',
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
  <ResourceTable
    v-bind="$attrs"
    :headers="headers"
    :groupable="true"
    :rows="[...rows]"
    :schema="schema"
    key-field="_key"
    v-on="$listeners"
  />
</template>
