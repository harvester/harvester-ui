<script>
import { clone } from '@/utils/object';
import VMModal from '@/components/form/VMModal';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';

export default {
  components: {
    VMModal,
    LabeledInput,
    LabeledSelect
  },

  props: {
    value: {
      type:    Array,
      default: () => {
        return {};
      }
    }
  },

  data() {
    return {
      rows:       clone(this.value),
      type:       'add',
      rowIndex:   0,
      errors:     [],
      currentRow: {}
    };
  },

  computed: {
    headers() {
      return [{
        name:     'name',
        label:    'Name',
        value:    'name',
        width:    100,
      },
      {
        name:     'model',
        label:    'Model',
        value:    'model',
        width:    100,
      },
      {
        name:     'network',
        label:    'Network',
        value:    'networkName',
        width:    120,
      },
      {
        name:     'type',
        label:    'Type',
        value:    'type',
        width:    100,
      },
      {
        name:     'macAddress',
        label:    'MAC Address',
        value:    'macAddress',
        width:    120,
      }];
    },

    modelOption() {
      return [{
        label: 'virtio',
        value: 'virtio'
      },
      {
        label: 'e1000',
        value: 'e1000'
      },
      {
        label: 'e1000e',
        value: 'e1000e'
      },
      {
        label: 'ne2k_pci',
        value: 'ne2k_pci'
      },
      {
        label: 'pcnet',
        value: 'pcnet'
      },
      {
        label: 'rtl8139',
        value: 'rtl8139'
      }];
    },

    networkOption() {
      return [{
        label: 'macvlan',
        value: 'macvlan'
      }];
    },

    typeOpton() {
      return [{
        label: 'bridge',
        value: 'bridge'
      },
      {
        label: 'sriov',
        value: 'sriov'
      }];
    },
  },

  methods: {
    updateAdd() {
      if (this.type === 'add') {
        this.rows.splice(this.rowIndex, 0, this.currentRow);
      } else if (this.type === 'delete') {
        this.rows.splice(this.rowIndex, 1);
      } else {
        this.rows.splice(this.rowIndex, 1, this.currentRow);
      }

      this.$emit('input', this.rows);
    },
    beforeCancel() {
      this.$set(this, 'errors', []);
    },
    updateIndex(index, type) {
      this.rowIndex = index;
      this.type = type;
      this.currentRow = clone(this.rows[this.rowIndex]) || { name: `nic-${ index }` };
    },

    validateError() {
      if (
        this.currentRow.macAddress &&
        this.currentRow.model &&
        this.currentRow.name &&
        this.currentRow.networkName &&
        this.currentRow.type
      ) {
        this.$set(this, 'errors', []);
      } else {
        this.errors.splice(0, 1, 'Please fill in all required fields.');
      }
    }
  }
};
</script>

<template>
  <div>
    <VMModal
      modal-name="network"
      title="Add Networking Interface"
      :rows="rows"
      :headers="headers"
      :errors="errors"
      @update:cancel="beforeCancel"
      @update:add="updateAdd"
      @update:index="updateIndex"
      @validateError="validateError"
    >
      <template v-slot:content>
        <LabeledInput
          v-model="currentRow.name"
          label="Name"
          class="mb-20"
          required
        />

        <LabeledSelect
          v-model="currentRow.model"
          label="Model"
          :options="modelOption"
          class="mb-20"
          required
        />

        <LabeledSelect
          v-model="currentRow.networkName"
          label="Network"
          :options="networkOption"
          class="mb-20"
          required
        />

        <LabeledSelect
          v-model="currentRow.type"
          label="Type"
          :options="typeOpton"
          class="mb-20"
          required
        />

        <LabeledInput
          v-model="currentRow.macAddress"
          label="Mac Address"
          required
        />
        <h5>MAC address as seen inside the guest system.</h5>
      </template>
    </VMModal>
  </div>
</template>
