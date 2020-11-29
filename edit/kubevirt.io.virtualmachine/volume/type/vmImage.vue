<script>
import UnitInput from '@/components/form/UnitInput';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import { IMAGE } from '@/config/types';
import { _CREATE } from '@/config/query-params';

export default {
  name:       'VmImage',
  components: {
    UnitInput, LabeledInput, LabeledSelect
  },
  props: {
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
    mode: {
      type:    String,
      default: 'create'
    },
    idx: {
      type:     Number,
      required: true
    }
  },

  computed: {
    isCreate() {
      return this.mode === _CREATE;
    },
    disabledImageVolume() {
      return this.idx === 0;
    },
    imagesOption() {
      const choise = this.$store.getters['cluster/all'](IMAGE);

      return choise.map( (I) => {
        return {
          label: I.spec.displayName,
          value: I.spec.displayName
        };
      });
    },

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
        <LabeledInput v-model="value.name" label="Name" required :mode="mode" />
      </div>

      <div class="col span-6">
        <LabeledSelect v-model="value.type" label="Type" :options="typeOption" :mode="mode" @input="update" />
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model="value.image"
          :disabled="disabledImageVolume"
          label="Image"
          :options="imagesOption"
          :mode="mode"
          @input="update"
        />
      </div>

      <div class="col span-6">
        <UnitInput v-model="value.size" label="Size" :mode="mode" suffix="GiB" />
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-3">
        <LabeledSelect v-model="value.bus" label="Bus" :mode="mode" :options="interfaceOption" @input="update" />
      </div>

      <div class="col span-3">
        <LabeledSelect
          v-model="value.bootOrder"
          label="Boot Order"
          :mode="mode"
          :searchable="false"
          :options="bootOrderOption"
          @input="update"
        />
      </div>

      <div class="col span-6">
        <LabeledSelect
          v-model="value.volumeMode"
          label="Volume Mode"
          :mode="mode"
          class="mb-20"
          :options="volumeModeOption"
          @input="update"
        />
      </div>
    </div>
  </div>
</template>
