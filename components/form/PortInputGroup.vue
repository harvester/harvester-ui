<script>
import { isArray } from '@/utils/array';
import LabeledSelect from '@/components/form/LabeledSelect';
import LabeledInput from '@/components/form/LabeledInput';
import PortInput from '@/components/form/PortInput';

export default {
  components: {
    LabeledSelect, PortInput, LabeledInput
  },

  props: {
    value: {
      type:     Object,
      required: true
    },
    mode: {
      type:     String,
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
  <div :style="{'width':'100%'}" class="multiple-rows-input">
    <div v-for="(row, index) in value.ports" :key="index" class="display-rows">
      <LabeledInput
        ref="name"
        v-model="row.name"
        label="Name"
        :placeholder="namePlaceholder"
        :disabled="isView"
        :mode="mode"
      />

      <PortInput :row="row" :mode="mode" />

      <LabeledSelect
        v-model="row.protocol"
        :options="protocolOption"
        :style="{'height':'50px'}"
        :multiple="false"
        label="Protocol"
        :mode="mode"
        :disabled="isView"
      />

      <button v-if="!isView" type="button" class="btn bg-transparent role-link" @click.prevent="removeRows(index)">
        REMOVE
      </button>
    </div>

    <button v-if="!isView" class="btn btn-sm role-secondary" @click.prevent="addRows()">
      Add Port
    </button>
  </div>
</template>

<style lang="scss">
  .multiple-rows-input {
    .display-rows {
      display: grid;
      grid-template-columns: 28% 28% 28% 75px;
      grid-column-gap: $column-gutter;
      margin-bottom: 10px;
      align-items: center;
    }

    .input-group, .label-group {
      display: grid;
    }

    .label-group {
      grid-template-columns: 2fr 2fr 1fr 28px;

      LABEL {
        display: block;
        color: var(--input-label);
        margin-bottom: 5px;
      }
    }
  }
</style>
