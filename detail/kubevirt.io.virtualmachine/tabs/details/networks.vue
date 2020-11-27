<script>
import NetworkModal from '@/components/form/NetworkModal';
import SortableTable from '@/components/SortableTable';
import VM_MIXIN from '@/mixins/vm';

export default {
  name: 'Networks',

  components: {
    NetworkModal,
    SortableTable,
  },

  mixins: [VM_MIXIN],

  props: {
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    return { spec: this.value.spec };
  },

  computed: {
    headers() {
      const out = [{
        name:  'name',
        label: 'Name',
        value: 'name',
      },
      {
        name:  'Source',
        label: 'Source',
        value: 'source',
      },
      {
        name:      'Size',
        label:     'Size',
        value:     'size',
      },
      {
        name:  'Interface',
        label: 'Bus',
        value: 'bus',
      },
      {
        name:  'Storage Class',
        label: 'Storage Class',
        value: 'storageClassName',
      }, {
        name:  'bootOrder',
        label: 'Boot Order',
        value: 'bootOrder',
      }];

      out.unshift({
        name:      '',
        label:     '',
        value:     '',
        width:      30,
      });

      return out;
    },
  },
  watch: {
    value: {
      handler(neu) {
        this.$set(this, 'spec', this.value.spec);
      },
      deep: true
    },
  },
};
</script>

<template>
  <div class="vm-inventory">
    <NetworkModal v-model="networkRows" :row-actions="false" />
  </div>
</template>
