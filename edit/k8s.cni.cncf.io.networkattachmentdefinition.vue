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
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput v-model="name" label="Name" required />
      </div>

      <div class="col span-6">
        <LabeledSelect v-model="type" label="Type" :options="typeOption" :disabled="true" required />
      </div>
    </div>

    <div class="row">
      <div class="col span-6">
        <LabeledInput v-model.number="vlanId" label="Vlan ID" required placeholder="i.e 1-4094" />
      </div>
    </div>

    <Footer :mode="mode" :errors="errors" @save="beforeSave" @done="done" />
  </div>
</template>

<style lang="scss" scoped>

</style>
