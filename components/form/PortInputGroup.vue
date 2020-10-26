<script>
import { isArray } from '@/utils/array';
import LabeledSelect from '@/components/form/LabeledSelect';
import PortInput from '@/components/form/PortInput';

export default {
  components: { LabeledSelect, PortInput },

  props: {
    value: {
      type:     Object,
      required: true
    },
    mode: {
      type:     String,
      required: false,
      default:  'edit'
    }
  },

  data() {
    return {
      protocolOption: [
        {
          label: 'TCP',
          value: 'TCP'
        },
        {
          label: 'UDP',
          value: 'UDP'
        }
      ]
    };
  },

  computed: {
    isView() {
      return this.mode === 'view';
    },
    namePlaceholder() {
      return this.isView ? '' : 'e.g. myport';
    }
  },

  methods: {
    addRows() {
      if (!isArray(this.value.ports)) {
        this.$set(this.value, 'ports', []);
      }

      this.value.ports.push({
        name:     '',
        port:     null,
        protocol: 'TCP'
      });
    },
    removeRows(index) {
      this.value.ports.splice(index, 1);
    },
    update() {
      this.$emit('update', this.rows);
    },
  }
};
</script>

<template>
  <div class="multiple-rows-input">
    <span v-if="!isView" class="title">Add Ports</span>
    <div class="label-group">
      <label>
        Port Name
      </label>
      <label>
        Port Number <span class="required">*</span>
      </label>
      <label>
        Protocol
      </label>
    </div>
    <div v-for="(row, index) in value.ports" :key="index" class="display-rows">
      <div class="input-group">
        <input v-model="row.name" type="text" :placeholder="namePlaceholder" :disabled="isView" />
        <PortInput :row="row" :mode="mode" />
        <div>
          <LabeledSelect
            v-model="row.protocol"
            :options="protocolOption"
            :disabled="isView"
          />
        </div>
      </div>
      <button v-if="!isView" class="btn bg-primary btn-sm" @click="removeRows(index)">
        <i class="el-icon-delete"></i>
      </button>
    </div>
    <button v-if="!isView" class="btn bg-primary btn-sm" @click="addRows()">
      Add Port
    </button>
  </div>
</template>

<style lang="scss">
  .multiple-rows-input {
    .title {
      display: block;
      margin-bottom: 10px;
      color: var(--input-label);
    }

    .required {
      color: red;
    }

    .display-rows {
      display: grid;
      grid-template-columns: auto 28px;
      grid-column-gap: 15px;
      align-items: center;
      margin-bottom: 15px;

      BUTTON {
        padding: 8px;
        height: 28px;
      }
    }

    .input-group, .label-group {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr;
      grid-column-gap: 15px;
      padding-left: 5px;
    }

    .label-group {
      grid-template-columns: 2fr 2fr 1fr 28px;

      LABEL {
        display: block;
        color: var(--input-label);
        margin-bottom: 5px;
      }
    }

    .input-group {
      .labeled-select {
        padding: 2px 10px;
      }
    }
  }
</style>
