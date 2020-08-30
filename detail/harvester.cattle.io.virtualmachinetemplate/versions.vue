<script>
import { NAME, STATE } from '@/config/table-headers';
import SortableTable from '@/components/SortableTable';

export default {
  components: { SortableTable },
  props:      {
    value: {
      type:    Array,
      default: () => {
        return [];
      }
    },

    defaultVersion: {
      type:    Number,
      default: null
    }
  },

  computed: {
    headers() {
      return [
        {
          name:       'Version',
          label:      'Version',
          value:      'status.version',
        },
        {
          name:           'defaultVersion',
          label:          'Default version',
          value:          'id',
          defaultVersion: this.defaultVersion,
          formatter:      'defaultVersion',
        },
        {
          name:           'Created by',
          label:          'createBy',
          value:          'metadata.creationTimestamp',
        }
      ];
    },
  }
};
</script>

<template>
  <div>
    <SortableTable
      v-bind="$attrs"
      :search="false"
      :table-actions="true"
      :row-actions="false"
      :headers="headers"
      :rows="[...value]"
      key-field="id"
      v-on="$listeners"
    >
    </SortableTable>
  </div>
</template>

<style lang="scss" scoped>

</style>
