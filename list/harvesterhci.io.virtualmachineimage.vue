<script>
import ResourceTable from '@/components/ResourceTable';
import { STATE, NAME, AGE } from '@/config/table-headers';

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
      // isAbnormal:  '',
      headers:     [
        STATE,
        {
          ...NAME,
          value: 'spec.displayName',
          width:     300
        },
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

  // watch: {
  //   isAbnormal(val, oldVal) {
  //     this.$store.commit('cluster/setConfig', {
  //       type: HCI.IMAGE,
  //       data: { disableCreateButton: val }
  //     });

  //     if (val !== oldVal) {
  //       this.minioPoller.immediatelyFetch = false;
  //       this.minioPoller.start();
  //     }
  //   }
  // },

  created() {
    this.schema.attributes.actuallyKind = 'Image';
  },

  mounted() {
    // this.minioPoller = new Poller(this.loadMinioStatus, 5000, 200 );
    // this.minioPoller.start();
  },
};
</script>

<template>
  <ResourceTable
    v-bind="$attrs"
    :headers="headers"
    :groupable="true"
    :rows="[...rows]"
    key-field="_key"
    v-on="$listeners"
  />
</template>
