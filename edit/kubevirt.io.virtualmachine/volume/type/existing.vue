<script>
import UnitInput from '@/components/form/UnitInput';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import { DATA_VOLUME } from '@/config/types';
import { sortBy } from '@/utils/sort';

export default {
  name:       'Existing',
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
    rows: {
      type:    Array,
      default: () => {
        return [];
      }
    }
  },

  computed: {
    volumeOption() {
      const choices = this.$store.getters['cluster/all'](DATA_VOLUME);

      return sortBy(
        choices
          .filter( (obj) => {
            let isAvailable = true;

            this.rows.forEach( (O) => {
              if ((O.volumeName === obj.metadata.name && O.accessMode === 'ReadWriteOnce')) {
                isAvailable = false;
              }
            });

            const isExistingRWO = obj.isRWO && obj.attachVM;

            return obj.metadata.namespace === 'default' && obj.phaseStatus === 'Succeeded' && isAvailable && !isExistingRWO;
          })
          .map((obj) => {
            return {
              label: obj.metadata.name,
              value: obj.metadata.name
            };
          }),
        'label'
      );
    },
  },

  watch: {
    'value.volumeName'(neu) {
      const choices = this.$store.getters['cluster/all'](DATA_VOLUME);

      const pvcResource = choices.find( O => O.metadata.name === neu);

      if (!pvcResource) {
        return;
      }

      this.value.accessModes = pvcResource?.spec?.pvc?.accessModes[0];
      this.value.size = pvcResource?.spec?.pvc?.resources?.requests?.storage;
      this.value.storageClassName = pvcResource?.spec?.pvc?.storageClassName;
      this.value.volumeMode = pvcResource?.spec?.pvc?.volumeMode;
    }
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
        <LabeledInput v-model="value.name" label="Name" :mode="mode" required />
      </div>

      <div class="col span-6">
        <LabeledSelect
          v-model="value.type"
          label="Type"
          :mode="mode"
          :options="typeOption"
          required
          @input="update"
        />
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model="value.volumeName"
          label="Volume"
          :mode="mode"
          :options="volumeOption"
          required
          @input="update"
        />
      </div>

      <div class="col span-6">
        <UnitInput v-model="value.size" label="Size" suffix="GiB" :mode="mode" :disabled="true" />
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-3">
        <LabeledSelect
          v-model="value.bus"
          label="Bus"
          :mode="mode"
          :options="interfaceOption"
          :disabled="true"
          required
          @input="update"
        />
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
          :options="volumeModeOption"
          :disabled="true"
          @input="update"
        />
      </div>
    </div>
  </div>
</template>
