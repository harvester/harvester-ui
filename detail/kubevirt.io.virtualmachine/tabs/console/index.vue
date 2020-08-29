<script>
import Console from '@/components/form/Console';
import SerialConsole from '@/components/form/SerialConsole';
import LabeledSelect from '@/components/form/LabeledSelect';

export default {
  name: 'OverviewConsole',

  components: {
    Console,
    SerialConsole,
    LabeledSelect
  },

  props: {
    value: {
      type:     Object,
      required: true
    }
  },

  data() {
    return { type: 'VNC' };
  },

  computed: {},
};
</script>

<template>
  <div class="vm-console">
    <div class="row">
      <div class="col span-3 mb-10">
        <LabeledSelect v-model="type" label="" :options="[, 'VNC', 'Serial']" mode="edit" />
      </div>
    </div>
    <Console v-if="type === 'VNC'" v-model="value" />
    <SerialConsole v-else v-model="value" />
  </div>
</template>

<style lang="scss" scoped></style>
