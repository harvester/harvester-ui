<script>
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';
import LabeledSelect from '@/components/form/LabeledSelect';
import LabeledInput from '@/components/form/LabeledInput';

export default {
  components: {
    LabeledSelect, LabeledInput, Footer
  },
  mixins:     [CreateEditView],
  props:      {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    if (!this.value.spec) {
      this.value.spec = {
        config: {
          cniVersion:  '0.3.1',
          name:        '',
          type:        'bridge',
          bridge:      'harvester-br0',
          promiscMode: true,
          vlan:        '',
          ipam:        { type: 'static' }
        }
      };
      this.value.metadata.namespace = 'default';
    }

    const specConfig = this.value.spec.config;
    const parseSpecConfig = typeof (specConfig) === 'string' ? JSON.parse(specConfig) : specConfig;

    return {
      name:   parseSpecConfig.name,
      type:   'L2VlanNetwork',
      vlanId: parseSpecConfig.vlan
    };
  },

  computed: {
    typeOption() {
      return [{
        value: 'VLAN',
        label: 'VLAN'
      }];
    }
  },

  methods: {
    async beforeSave(buttonCb) {
      this.value.setLabel('networks.harvester.cattle.io/type', this.type);
      if (!this.vlanId) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Vlan ID' })];
        buttonCb(true);

        return false;
      }

      this.value.spec.config.vlan = this.vlanId;
      this.value.spec.config.name = this.name;
      this.value.spec.config = JSON.stringify(this.value.spec.config);
      this.value.metadata.name = this.name;
      await this.save(buttonCb);

      const specConfig = JSON.parse(this.value.spec.config);

      this.$set(this.value.spec, 'config', specConfig);
    },
  }
};
</script>

<template>
  <div>
    <LabeledInput v-model="name" class="mb-20" label="Name" required :disabled="isEdit" />

    <LabeledSelect
      v-model="type"
      class="mb-20"
      label="Type"
      :options="typeOption"
      :disabled="true"
      required
    />

    <LabeledInput v-model.number="vlanId" class="mb-20" label="Vlan ID" required placeholder="i.e 1-4094" />

    <Footer :mode="mode" :errors="errors" @save="beforeSave" @done="done" />
  </div>
</template>
