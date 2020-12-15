<script>
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';

export default {
  name:       'Container',
  components: { LabeledInput, LabeledSelect },

  props:      {
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
  },

  data() {
    return {};
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
  }
};
</script>

<template>
  <div @input="update">
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput v-model="value.name" :label="t('harvester.fields.name')" required :mode="mode" />
      </div>

      <div class="col span-6">
        <LabeledSelect
          v-model="value.type"
          :label="t('harvester.fields.type')"
          :options="typeOption"
          :mode="mode"
          required
          @input="update"
        />
      </div>
    </div>

    <div class="row">
      <div class="col span-6">
        <LabeledInput v-model="value.container" :label="t('harvester.vmPage.volume.dockerImage')" :mode="mode" required @input="update" />
      </div>

      <div class="col span-3">
        <LabeledSelect v-model="value.bus" :label="t('harvester.vmPage.volume.bus')" :options="interfaceOption" :mode="mode" @input="update" />
      </div>

      <div class="col span-3">
        <LabeledSelect
          v-model="value.bootOrder"
          :label="t('harvester.vmPage.volume.bootOrder')"
          :searchable="false"
          :mode="mode"
          :options="bootOrderOption"
          @input="update"
        />
      </div>
    </div>
  </div>
</template>
