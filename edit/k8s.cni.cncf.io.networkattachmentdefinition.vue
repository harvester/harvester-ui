<script>
import CruResource from '@/components/CruResource';
import { defaultAsyncData } from '@/components/ResourceDetail';
import CreateEditView from '@/mixins/create-edit-view';
import LabeledInput from '@/components/form/LabeledInput';

export default {
  components: { LabeledInput, CruResource },
  mixins:     [CreateEditView],
  props:      {
    value: {
      type:     Object,
      required: true,
    }
  },

  asyncData(ctx) {
    const parentOverride = { displayName: 'Network' };
    const resource = ctx.params.resource;

    return defaultAsyncData(ctx, resource, parentOverride);
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
          ipam:        {}
        }
      };
      this.value.metadata.namespace = 'default';
    }

    const specConfig = this.value.spec.config;
    const parseSpecConfig = typeof (specConfig) === 'string' ? JSON.parse(specConfig) : specConfig;

    return {
      name:     parseSpecConfig.name,
      type:     'L2VlanNetwork',
      vlanId:   parseSpecConfig.vlan,
      ipamType: parseSpecConfig.ipam?.type || '',
      parseSpecConfig,
      pattern:  /^([1-9]|[1-3]?[0-9]{2,3}|40[0-9][04])$/,
    };
  },

  computed: {
    typeOption() {
      return [{
        value: 'VLAN',
        label: 'VLAN'
      }];
    },
    IPAMOption() {
      return [{
        value: 'static',
        label: 'static'
      }, {
        value: '',
        label: 'None'
      }];
    },
  },

  methods: {
    async beforeSave(buttonCb) {
      this.value.setLabel('networks.harvester.cattle.io/type', this.type);
      if (!this.vlanId) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Vlan ID' })];
        buttonCb(false);

        return false;
      }

      // if (this.ipamType === 'static') {
      //   this.parseSpecConfig.ipam.type = 'static';
      // } else {
      //   this.parseSpecConfig.ipam = {};
      // }

      this.parseSpecConfig.vlan = this.vlanId;
      this.parseSpecConfig.name = this.name;
      this.value.spec.config = JSON.stringify(this.parseSpecConfig);
      this.value.metadata.name = this.name;
      await this.save(buttonCb);

      const specConfig = JSON.parse(this.value.spec.config);

      this.$set(this.value.spec, 'config', specConfig);
    },

    input(neu) {
      if (!(this.pattern.test(neu) || neu === '')) {
        if (neu < 1) {
          this.vlanId = 1;
        }
        if (neu > 4094) {
          this.vlanId = 4094;
        } else {
          this.vlanId = 1;
        }
      }
    }
  }
};
</script>

<template>
  <CruResource
    :done-route="doneRoute"
    :resource="value"
    :mode="mode"
    :errors="errors"
    @apply-hooks="applyHooks"
    @finish="save"
  >
    <div>
      <LabeledInput v-model="name" class="mb-20" label="Name" required :disabled="isEdit" />

      <LabeledInput
        v-model="type"
        class="mb-20"
        label="Type"
        :disabled="true"
        required
      />

      <LabeledInput
        v-model.number="vlanId"
        v-int-number
        class="mb-20"
        required
        :disabled="isEdit"
        type="number"
        min="1"
        max="65535"
        placeholder="e.g. 1-4094"
        label="Vlan ID"
        @input="input"
      />

    <!-- <LabeledSelect
      v-model="ipamType"
      class="mb-20"
      label="IPAM"
      :options="IPAMOption"
    /> -->
    </div>
  </CruResource>
</template>
