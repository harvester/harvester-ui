<script>
import UnitInput from '@/components/form/UnitInput';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';

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
    }
  },

  data() {
    return {};
  },

  methods: {
    update() {
      this.$emit('update');
    }
  }
};
</script>

<template>
  <div @input="update">
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput
          v-model="value.name"
          label="Name"
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
          :mode="mode"
          @input="update"
        />
      </div>
    </div>

    <div class="row">
      <div class="col span-6">
        <UnitInput v-model="value.size" :mode="mode" label="Size" suffix="GiB" />
      </div>

      <div class="col span-3">
        <LabeledSelect
          v-model="value.bus"
          label="Bus"
          class="mb-20"
          :mode="mode"
          :options="interfaceOption"
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
          :options="bootOrderOption"
          @input="update"
        />
      </div>
    </div>

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
    </div>
  </div>
</template>
