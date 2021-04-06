<script>
import RadioGroup from '@/components/form/RadioGroup';
import CreateEditView from '@/mixins/create-edit-view';

export default {
  name:       'RancherSetting',
  components: { RadioGroup },
  mixins:     [CreateEditView],
  props:      {
    value: {
      type:     Object,
      required: true,
    },
  },
  data() {
    return { errors: [] };
  },
};
</script>

<template>
  <div id="rancherEnable">
    <RadioGroup
      v-model="value.value"
      class="mb-20"
      name="model"
      :options="['true','false']"
      :labels="['Enable', 'Disable']"
    />
  </div>
</template>

<style lang="scss">
#rancherEnable {
  .radio-group {
    display: flex;
    .radio-container {
      margin-right: 30px;
    }
  }
}
</style>
