<script>
import _ from 'lodash';
import LabeledSelect from '@/components/form/LabeledSelect';
import LabeledInput from '@/components/form/LabeledInput';
import PortInputGroup from '@/components/form/PortInputGroup';
import { MODEL } from '@/config/map';
import { _CREATE, _VIEW } from '@/config/query-params';

const MANAGEMENT_NETWORK = 'management Network';

export default {
  name:       'Base',
  components: {
    LabeledInput, LabeledSelect, PortInputGroup
  },

  props: {
    value: {
      type:    Object,
      default: () => {
        return {};
      }
    },
    networkOption: {
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
    },

    mode: {
      type:    String,
      default: 'create'
    }
  },
  data() {
    return {
      rowIndex:   0,
      errors:     [],
    };
  },

  computed: {
    isDisabled() {
      return this.isMasquerade && !this.value.newCreateId && !this.isCreate;
    },
    isView() {
      return this.mode === _VIEW;
    },
    isCreate() {
      return this.mode === _CREATE;
    },
    modelOption() {
      return MODEL;
    },

    isMasquerade() {
      return this.value.networkName === MANAGEMENT_NETWORK;
    },

    typeOpton() {
      const masquerade = [{
        label: 'masquerade',
        value: 'masquerade'
      }, {
        label: 'bridge',
        value: 'bridge'
      }];

      const other = [{
        label: 'bridge',
        value: 'bridge'
      },
      {
        label: 'sriov',
        value: 'sriov'
      }];

      return this.isMasquerade ? masquerade : other;
    },
    NTOption() {
      const out = _.cloneDeep(this.networkOption);

      if ((this.value.networkName !== MANAGEMENT_NETWORK) && this.value.networkName) {
        out.push({
          label: this.value.networkName,
          value: this.value.networkName
        });
      }

      return out;
    }
  },

  watch: {
    'value.networkName': {
      handler(neu) {
        if (neu === MANAGEMENT_NETWORK && this.value.masquerade) {
          this.value.type = 'masquerade';
        }
      },
      immediate: true
    }
  },

  methods: {
    update() {
      const networkName = this.value.networkName;

      if (networkName === MANAGEMENT_NETWORK) {
        this.value.isPod = true;
      } else {
        // const choices = this.$store.getters['cluster/byId'](NETWORK_ATTACHMENT, `default/${ neu }`);
        // this.currentRow.isIpamStatic = choices?.isIpamStatic || false;
        this.value.type = 'bridge';
        this.value.isPod = false;
      }
      this.$emit('update');
    }
  }
};
</script>

<template>
  <div @input="update">
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput v-model="value.name" :label="t('harvester.fields.name')" required :mode="mode" :disabled="isDisabled" />
      </div>

      <div class="col span-6">
        <LabeledSelect
          v-model="value.model"
          :label="t('harvester.fields.model')"
          :disabled="isDisabled"
          :options="modelOption"
          :mode="mode"
          required
          @input="update"
        />
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model="value.networkName"
          :label="t('harvester.fields.network')"
          :options="NTOption"
          :mode="mode"
          required
          :disabled="isDisabled"
          @input="update"
        />
      </div>

      <div class="col span-6">
        <LabeledSelect
          v-model="value.type"
          :label="t('harvester.fields.type')"
          :options="typeOpton"
          :mode="mode"
          required
          @input="update"
        />
      </div>
    </div>

    <div v-if="!isMasquerade" class="row mb-20">
      <div class="col span-6">
        <LabeledInput v-model="value.macAddress" :mode="mode">
          <template #label>
            <label class="has-tooltip">
              {{ t('harvester.fields.macAddress') }}
              <i v-tooltip="'Protip: MAC address as seen inside the guest system.'" class="icon icon-info" style="font-size: 14px" />
            </label>
          </template>
        </LabeledInput>
      </div>
    </div>

    <hr v-if="isMasquerade" class="mb-20">

    <PortInputGroup v-if="value.type === 'masquerade'" v-model="value" :disabled="isDisabled" :mode="mode" />
    <!-- <LabeledInput
      v-if="value.isIpamStatic"
      v-model="value.cidr"
      label="CIDR"
      class="mb-20"
      required
      @input="validateCidr"
    /> -->
  </div>
</template>
