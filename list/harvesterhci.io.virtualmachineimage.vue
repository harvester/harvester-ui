<script>
import SortableTable from '@/components/SortableTable';
// import Banner from '@/components/Banner';
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
  //       type: IMAGE,
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
  <div>
    <!-- <div v-if="isAbnormal">
      <Banner
        color="error"
      >
        Image storage service is not ready
      </Banner>
    </div> -->

    <SortableTable
      v-bind="$attrs"
      :headers="headers"
      :rows="[...rows]"
      key-field="_key"
      v-on="$listeners"
    />
  </div>
</template>
