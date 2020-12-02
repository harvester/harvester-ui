<script>
import SortableTable from '@/components/SortableTable';
import VM_MIXIN from '@/mixins/vm';
import Checkbox from '@/components/form/Checkbox';

export default {
  name: 'CDROMS',

  components: {
    Checkbox,
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
    return {
      spec:       this.value.spec,
      cdrowName:  [],
      nameString: '',
      rows:       [],
      hasChecked: false
    };
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
        name:  'bootOrder',
        label: 'Boot Order',
        value: 'bootOrder',
      }];

      out.unshift({
        name:  '',
        label: '',
        value: '',
        width: 50,
        align: 'center'
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
    diskRows: {
      handler(neu) {
        this.rows = neu.filter(d => d.type === 'cd-rom');
      },
      deep: true
    },
    rows: {
      handler(neu) {
        this.$emit('change', this.getCheckCdrow());
      },
      deep: true
    },
  },

  methods: {
    getCheckCdrow() {
      const diskNames = [];

      this.hasChecked = false;

      for (let i = 0; i < this.diskRows.length; i++) {
        if (this.diskRows[i]?.isEjectCdRow) {
          this.hasChecked = true;
          diskNames.push(this.diskRows[i].name);
        }
      }

      return diskNames;
    },

  }
};
</script>

<template>
  <SortableTable
    class="mb-20"
    key-field="id"
    :rows="rows"
    :search="false"
    :headers="headers"
    :row-actions-width="160"
    :row-actions="false"
    :table-actions="false"
  >
    <template slot="cell:" slot-scope="scope" class="state-col">
      <div class="state">
        <Checkbox v-if="scope.row.type === 'cd-rom'" v-model="scope.row.isEjectCdRow" class="selection-checkbox" type="checkbox" />
      </div>
    </template>
  </SortableTable>
</template>
