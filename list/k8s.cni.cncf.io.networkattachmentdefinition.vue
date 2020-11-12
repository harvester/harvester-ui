<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';
import Banner from '@/components/Banner';

export default {
  name:       'ListNetwork',
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

  computed: {
    headers() {
      return [
        { ...STATE },
        { ...NAME },
        {
          name:      'type',
          value:     'spec.config',
          sort:      'spec.config',
          type:       'type',
          formatter: 'ParseNetworkConfig'
        },
        {
          name:      'vlan',
          value:     'spec.config',
          sort:      'spec.config',
          type:       'vlan',
          formatter:  'ParseNetworkConfig'
        },
        AGE
      ];
    },
  },

  customCreateFormName() {
    return 'Networks';
  },

  typeDisplay() {
    return 'Networks';
  },
};
</script>

<template>
  <div>
    <div>
      <Banner
        color="error"
      >
        please config the
        <nuxt-link to="harvester.cattle.io.setting/network-setting?mode=edit">
          cluster networks
        </nuxt-link>
        settings before creating a new L2 Vlan network.
      </Banner>
    </div>
    <SortableTable
      v-bind="$attrs"
      :headers="headers"
      default-sort-by="age"
      :rows="[...rows]"
      key-field="_key"
      v-on="$listeners"
    >
    </sortabletable>
  </div>
</template>
