<script>
import _ from 'lodash';
import { clone } from '@/utils/object';
import VMModal from '@/components/form/VMModal';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import PortInputGroup from '@/components/form/PortInputGroup';
import { sortBy } from '@/utils/sort';
import { NETWORK_ATTACHMENT } from '@/config/types';

export default {
  components: {
    VMModal,
    LabeledInput,
    LabeledSelect,
    PortInputGroup
  },

  props: {
    value: {
      type:    Array,
      default: () => {
        return {};
      }
    },
    namespace: {
      type:    String,
      default: ''
    },
    rowActions: {
      type:    Boolean,
      default: true
    }
  },

  data() {
    return {
      rows:       clone(this.value),
      type:       'add',
      rowIndex:   0,
      errors:     [],
      currentRow: {}
    };
  },

  computed: {
    headers() {
      return [{
        name:      '',
        label:     '',
        value:     '',
        width:      30,
        formatter: 'EjectCdRow',
      },
      {
        name:     'name',
        label:    'Name',
        value:    'name',
      },
      {
        name:     'model',
        label:    'Model',
        value:    'model',
      },
      {
        name:     'network',
        label:    'Network',
        value:    'networkName',
      },
      {
        name:     'type',
        label:    'Type',
        value:    'type',
      },
      {
        name:     'macAddress',
        label:    'MAC Address',
        value:    'macAddress',
      },
      {
        name:      'ports',
        label:     'Ports',
        value:     'ports',
        formatter: 'Ports'
      }];
    },

    modelOption() {
      return [{
        label: 'virtio',
        value: 'virtio'
      },
      {
        label: 'e1000',
        value: 'e1000'
      },
      {
        label: 'e1000e',
        value: 'e1000e'
      },
      {
        label: 'ne2k_pci',
        value: 'ne2k_pci'
      },
      {
        label: 'pcnet',
        value: 'pcnet'
      },
      {
        label: 'rtl8139',
        value: 'rtl8139'
      }];
    },

    networkOption() {
      const choices = this.$store.getters['cluster/all'](NETWORK_ATTACHMENT);

      const out = sortBy(
        choices
          .filter(C => C.metadata.namespace === 'default')
          .filter((C) => {
            let canUse = true;

            this.rows.map((O) => {
              if (O.networkName === C.metadata.name) {
                canUse = false;
              }
            });

            return canUse;
          })
          .map((obj) => {
            return {
              label: obj.metadata.name,
              value: obj.metadata.name
            };
          }),
        'label'
      );

      const findPodIndex = _.findIndex(this.rows, (o) => {
        return o.networkName === 'managment Network';
      });

      if (findPodIndex === -1 || (findPodIndex !== -1 && this.rows.length === 1 && this.type !== 'add' )) {
        out.push({
          label: 'managment Network',
          value: 'managment Network'
        });
      }

      return out;
    },

    isMasquerade() {
      return this.currentRow.networkName === 'managment Network';
    },

    typeOpton() {
      if (this.currentRow.networkName === 'managment Network') {
        return [{
          label: 'masquerade',
          value: 'masquerade'
        }, {
          label: 'bridge',
          value: 'bridge'
        }];
      }

      return [{
        label: 'bridge',
        value: 'bridge'
      },
      {
        label: 'sriov',
        value: 'sriov'
      }];
    }
  },

  watch: {
    value(neu) {
      this.rows = neu;
    },
    'currentRow.networkName': {
      handler(neu) {
        this.errors.splice(0, 1);
        if (neu === 'managment Network' && this.currentRow.masquerade) {
          this.currentRow.type = 'masquerade';
        } else {
          // const choices = this.$store.getters['cluster/byId'](NETWORK_ATTACHMENT, `default/${ neu }`);

          // this.currentRow.isIpamStatic = choices?.isIpamStatic || false;
          this.currentRow.type = 'bridge';
        }
      },
      immediate: true
    }
  },

  methods: {
    updateAdd() {
      if (this.type === 'add') {
        this.rows.splice(this.rowIndex, 0, this.currentRow);
      } else if (this.type === 'delete') {
        this.rows.splice(this.rowIndex, 1);
      } else {
        this.rows.splice(this.rowIndex, 1, this.currentRow);
      }

      this.rows.forEach((o, index) => {
        o.index = index;
      });

      this.$emit('input', this.rows);
      this.currentRow = {};
    },
    beforeCancel() {
      this.$set(this, 'errors', []);
    },
    updateIndex(index, type) {
      this.rowIndex = index;
      this.type = type;
      const networkName = this.networkOption?.[0]?.value || '';

      this.currentRow = clone(this.rows[this.rowIndex]) || {
        name: `nic-${ index }`, model: 'virtio', networkName, type: 'bridge'
      };
    },

    validateError() {
      if (!this.currentRow.name) {
        return this.getInvalidMsg('Name');
      }

      // if (this.currentRow.isIpamStatic) {
      //   if (!this.currentRow.cidr) {
      //     return this.getInvalidMsg('cidr');
      //   }
      // }

      // if (this.currentRow.isIpamStatic && this.currentRow.cidr) {
      //   this.validateCidr(this.currentRow.cidr);
      // }

      if (!this.currentRow.model) {
        return this.getInvalidMsg('Model');
      }

      if (!this.currentRow.networkName) {
        return this.getInvalidMsg('Network Name');
      }

      if (!this.currentRow.type) {
        return this.getInvalidMsg('Type');
      }

      const portsValidater = this.validatePorts();

      if (!portsValidater.status) {
        if (portsValidater.message === 'exist') {
          return this.errors.splice(0, 1, this.$store.getters['i18n/t']('validation.ports.exist'));
        }

        return this.getInvalidMsg('Port Number');
      }

      this.validateName(this.currentRow.name);

      this.validateMac(this.currentRow.macAddress);

      if (!this.errors.length > 0) {
        this.$set(this, 'errors', []);
      }
    },

    validateMac(value) {
      if (this.currentRow.networkName === 'managment Network' || !value) {
        return;
      }
      if (!/^[A-F0-9]{2}(-[A-F0-9]{2}){5}$|^[A-F0-9]{2}(:[A-F0-9]{2}){5}$/.test(value)) {
        this.errors.splice(0, 1, 'Invalid MAC address format.');
      } else {
        this.$set(this, 'errors', []);
      }
    },

    validatePorts() {
      if (!this.currentRow.ports || this.currentRow.length === 0 || !this.isMasquerade) {
        return { status: true };
      }

      const officer = new Set();

      for (const p of this.currentRow.ports) {
        if (!p.port) {
          return { status: false };
        }

        officer.add(parseInt(p.port));
      }

      if (officer.size !== this.currentRow.ports.length) {
        return { status: false, message: 'exist' };
      }

      return { status: true };
    },

    getInvalidMsg(key) {
      this.errors.splice(0, 1, this.$store.getters['i18n/t']('validation.required', { key }));
    },

    validateName(name) {
      const arr = _.filter(this.rows, (o, index) => {
        return name === o.name;
      });

      if ((arr?.length > 0 && this.type === 'add') || (arr?.length > 1)) {
        this.errors.splice(0, 1, 'network with this name already exists!.');
      } else if (name.length > 20) {
        const message = this.$store.getters['i18n/t']('validation.custom.tooLongName', { max: 20 });

        this.$set(this.currentRow, 'name', name.substr(0, 20));
        this.errors.splice(0, 1, message);
      } else {
        this.errors.splice(0, 1);
      }
    },

    validateCidr(cidr) {
      const isCidr = !!/^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-9]|[1-2]\d|3[0-2])$/.test(cidr);

      if (!isCidr) {
        const message = this.$store.getters['i18n/t']('validation.custom.cidr');

        this.errors.splice(0, 1, message);
      } else {
        this.errors.splice(0, 1);
      }
    }
  }
};
</script>

<template>
  <div>
    <VMModal
      :row-actions="rowActions"
      modal-name="network"
      :title="type === 'add' ? 'Add Network Interface' : 'Edit Network Interface'"
      :rows="rows"
      :headers="headers"
      button-text="Add Network Interface"
      :errors="errors"
      @update:cancel="beforeCancel"
      @update:add="updateAdd"
      @update:index="updateIndex"
      @validateError="validateError"
    >
      <template v-slot:content>
        <LabeledInput
          v-model="currentRow.name"
          label="Name"
          class="mb-20"
          required
          @input="validateName"
        />

        <LabeledSelect
          v-model="currentRow.model"
          label="Model"
          :options="modelOption"
          class="mb-20"
          required
        />

        <LabeledSelect
          v-model="currentRow.networkName"
          label="Network"
          :options="networkOption"
          class="mb-20"
          required
        />

        <LabeledSelect
          v-model="currentRow.type"
          label="Type"
          :options="typeOpton"
          class="mb-20"
          required
        />

        <LabeledInput
          v-if="!isMasquerade"
          v-model="currentRow.macAddress"
          class="mb-20"
          @input="validateMac"
        >
          <template #label>
            <label class="has-tooltip" :style="{'color':'var(--input-label)'}">
              Mac Address
              <i v-tooltip="'Protip: MAC address as seen inside the guest system.'" class="icon icon-info" style="font-size: 14px" />
            </label>
          </template>
        </LabeledInput>

        <!-- <LabeledInput
          v-if="currentRow.isIpamStatic"
          v-model="currentRow.cidr"
          label="CIDR"
          class="mb-20"
          required
          @input="validateCidr"
        /> -->

        <PortInputGroup v-if="currentRow.type === 'masquerade'" v-model="currentRow" />
      </template>
    </VMModal>
  </div>
</template>
