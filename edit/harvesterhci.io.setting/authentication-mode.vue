<script>
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';

export default {
  name:       'AuthMode',
  components: { LabeledSelect, LabeledInput },

  props:      {
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    const authMode = this.value.value || this.value.default;

    return { authMode };
  },

  computed: {
    authModes() {
      return [{
        label: 'LocalUser',
        value: 'localUser'
      }, {
        label: 'LocalUser,KubernetesCredentials',
        value: 'localUser,kubernetesCredentials'
      }, {
        label: 'Rancher',
        value: 'rancher'
      }];
    }
  },

  methods: {
    update() {
      this.$set(this.value, 'value', this.authMode);
    }
  }
};
</script>

<template>
  <div>
    <LabeledInput
      v-model="value.default"
      :label="t('generic.default')"
      class="mb-20"
      mode="view"
    />

    <LabeledSelect v-model="authMode" class="mb-20" :label="t('generic.value')" :options="authModes" @input="update" />
  </div>
</template>
