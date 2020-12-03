<script>
import UnitInput from '@/components/form/UnitInput';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import { _EDIT } from '@/config/query-params';

export default {
  name:       'Volume',
  components: {
    UnitInput, LabeledInput, LabeledSelect
  },
  props: {
    mode: {
      type:    String,
      default: 'create'
    },
    value: {
      type:    Object,
      default: () => {
        return {};
      }
    },

    typeOption: {
      type:    Array,
      default: () => {
        return [];
      }
    },

    storageOption: {
      type:    Array,
      default: () => {
        return [];
      }
    },

    interfaceOption: {
      type:    Array,
      default: () => {
        return [];
      }
    },

    bootOrderOption: {
      type:    Array,
      default: () => {
        return [];
      }
    },
    accessModeOption: {
      type:    Array,
      default: () => {
        return [];
      }
    },
    volumeModeOption: {
      type:    Array,
      default: () => {
        return [];
      }
    },
  },

  data() {
    return {};
  },

  computed: {
    isDisabled() {
      return !this.value.newCreateId && this.mode === _EDIT;
    }
  },

  watch: {
    'value.type'(neu) {
      if (neu === 'cd-rom') {
        this.$set(this.value, 'bus', 'sata');
        this.update();
      }
    },
  },

  methods: {
    update() {
      this.$emit('update');
    }
  },
};
</script>

<template>
  <div @input="update">
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput
          v-model="value.name"
          label="Name"
          :disabled="isDisabled"
          :mode="mode"
          required
        />
      </div>

      <div class="col span-6">
        <LabeledSelect
          v-model="value.type"
          label="Type"
          :options="typeOption"
          required
          :disabled="isDisabled"
          :mode="mode"
          @input="update"
        />
      </div>
    </div>

    <div class="row">
      <div class="col span-6">
        <UnitInput v-model="value.size" :mode="mode" label="Size" suffix="GiB" :disabled="isDisabled" />
      </div>

      <div class="col span-3">
        <LabeledSelect
          v-model="value.bus"
          label="Bus"
          class="mb-20"
          :mode="mode"
          :options="interfaceOption"
          :disabled="isDisabled"
          required
          @input="update"
        />
      </div>

      <div class="col span-3">
        <LabeledSelect
          v-model="value.bootOrder"
          label="Boot Order"
          class="mb-20"
          :mode="mode"
          :clearable="true"
          :searchable="false"
          :disabled="isDisabled"
          :options="bootOrderOption"
          @input="update"
        />
      </div>
    </div>
    <!--
    <div class="row">
      <div class="col span-6">
        <LabeledSelect
          v-model="value.volumeMode"
          :mode="mode"
          label="Volume Mode"
          class="mb-20"
          :options="volumeModeOption"
          @input="update"
        />
      </div>

      <div class="col span-3">
        <LabeledSelect
          v-model="value.accessMode"
          :mode="mode"
          label="Access Mode"
          class="mb-20"
          :options="accessModeOption"
          @input="update"
        />
      </div>

      <div class="col span-3">
        <LabeledSelect
          v-model="value.storageClassName"
          label="Storage Class"
          :options="storageOption"
          :mode="mode"
          required
          @input="update"
        />
      </div>
    </div> -->
  </div>
</template>
