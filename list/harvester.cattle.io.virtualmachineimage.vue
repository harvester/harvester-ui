<script>
import SortableTable from '@/components/SortableTable';
import Banner from '@/components/Banner';
import { STATE, NAME, AGE } from '@/config/table-headers';
import Poller from '@/utils/poller';
import { IMAGE } from '@/config/types';

export default {
  name:       'ListImage',
  components: { SortableTable, Banner },

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
      isAbnormal:  '',
      minioPoller: null,
      headers:     [
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

  watch: {
    isAbnormal(val, oldVal) {
      this.$store.commit('cluster/setConfig', {
        type: IMAGE,
        data: { disableCreateButton: val }
      });

      if (val !== oldVal) {
        this.minioPoller.immediatelyFetch = false;
        this.minioPoller.start();
      }
    }
  },

  created() {
    this.schema.attributes.actuallyKind = 'Image';
  },

  mounted() {
    this.minioPoller = new Poller(this.loadMinioStatus, 5000, 200 );
    this.minioPoller.start();
  },

  methods: {
    async loadMinioStatus() {
      const resources = await this.$store.dispatch('cluster/request', {
        url:           '/api/v1/namespaces/harvester-system/services/minio:http/proxy/minio/health/cluster',
        method:        'GET',
        headers:       { 'Content-Type': 'application/json' }
      });

      if (resources._status === 200) {
        this.minioPoller.pollRateMs = 60000;
        this.isAbnormal = false;
      } else {
        this.isAbnormal = true;
        this.minioPoller.pollRateMs = 5000;
      }
    },
  }
};
</script>

<template>
  <div>
    <div v-if="isAbnormal">
      <Banner
        color="error"
      >
        Image storage service is not ready
      </Banner>
    </div>

    <SortableTable
      v-bind="$attrs"
      :headers="headers"
      :rows="[...rows]"
      key-field="_key"
      v-on="$listeners"
    />
  </div>
</template>
