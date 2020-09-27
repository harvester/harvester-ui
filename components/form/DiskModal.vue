<script>
import _ from 'lodash';
import randomstring from 'randomstring';
import VMModal from '@/components/form/VMModal';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import Collapse from '@/components/Collapse';
import { clone } from '@/utils/object';
import { sortBy } from '@/utils/sort';
import { SOURCE_TYPE, InterfaceOption } from '@/config/map';
import MemoryUnit from '@/components/form/MemoryUnit';
import { NAMESPACE, DATA_VOLUME, STORAGE_CLASS, IMAGE } from '@/config/types';

export default {
  components: {
    VMModal,
    Collapse,
    MemoryUnit,
    LabeledInput,
    LabeledSelect
  },

  props:      {
    value: {
      type:    Array,
      default: () => {
        return {};
      }
    },

    rowActions: {
      type:    Boolean,
      default: true
    },

    namespace: {
      type:     String,
      default: 'default'
    },

    owner: {
      type:     String,
      default:  ''
    }
  },

  data() {
    return {
      rows:           clone(this.value),
      type:           'add',
      errors:         [],
      rowIdx:         0,
      currentRow:     {},
      pvcs:           [],
      enableAdvanced: false
    };
  },

  computed: {
    isImage() {
      return this.currentRow.source === SOURCE_TYPE.IMAGE;
    },

    isBlank() {
      return this.currentRow.source === SOURCE_TYPE.BLANK;
    },

    isAttachVolume() {
      return this.currentRow.source === SOURCE_TYPE.ATTACH_VOLUME;
    },

    isContainerDisk() {
      return this.currentRow.source === SOURCE_TYPE.CONTAINER_DISK;
    },

    pvcOption() {
      const choices = this.$store.getters['cluster/all'](DATA_VOLUME);

      return sortBy(
        choices
          .filter( (obj) => {
            return obj.metadata.namespace === this.namespace && obj.phaseStatus === 'Succeeded';
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

    storageOption() {
      const choices = this.$store.getters['cluster/all'](STORAGE_CLASS);

      return sortBy(
        choices
          .map((obj) => {
            return {
              label: obj.metadata.name,
              value: obj.metadata.name
            };
          }),
        'label'
      );
    },

    headers() {
      return [{
        name:  'name',
        label: 'Name',
        value: 'name',
      },
      {
        name:  'Source',
        label: 'Source',
        value: 'source',
      },
      {
        name:      'Size',
        label:     'Size',
        value:     'size',
      },
      {
        name:  'Interface',
        label: 'Bus',
        value: 'bus',
      },
      {
        name:  'Storage Class',
        label: 'Storage Class',
        value: 'storageClassName',
      }, {
        name:  'bootOrder',
        label: 'Boot Order',
        value: 'bootOrder',
      }];
    },

    typeOption() {
      return [{
        label: 'disk',
        value: 'disk'
      }, {
        label: 'cd-rom',
        value: 'cd-rom'
      }];
    },

    sourceOption() {
      return [{
        label: SOURCE_TYPE.BLANK,
        value: SOURCE_TYPE.BLANK
      }, {
        label: SOURCE_TYPE.IMAGE,
        value: SOURCE_TYPE.IMAGE
      }, {
        label: SOURCE_TYPE.CONTAINER_DISK,
        value: SOURCE_TYPE.CONTAINER_DISK
      }, {
        label: SOURCE_TYPE.ATTACH_VOLUME,
        value: SOURCE_TYPE.ATTACH_VOLUME
      }];
    },

    InterfaceOption() {
      return InterfaceOption;
    },

    volumeModeOption() {
      return [{
        label: 'FileSystem',
        value: 'Filesystem'
      }, {
        label: 'Block',
        value: 'Block'
      }];
    },

    imagesOption() {
      const choise = this.$store.getters['cluster/all'](IMAGE);

      return choise.map( (I) => {
        return {
          label: I.spec.displayName,
          value: I.spec.displayName
        };
      });
    },

    accessModeOption() {
      return [{
        label: 'Single User(RWO)',
        value: 'ReadWriteOnce'
      }, {
        label: 'Shared Access(RWX)',
        value: 'ReadWriteMany'
      }, {
        label: 'Read Only(ROX)',
        value: 'ReadOnlyMany'
      }];
    },

    bootOrderOption() {
      const baseOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      _.remove(baseOrder, (n) => {
        return this.choosedOrder.includes(n);
      });
      baseOrder.unshift('-');

      return baseOrder;
    },

    choosedOrder() {
      return this.rows.map( R => R.bootOrder );
    },

    imageRequired() {
      return !(this.currentRow.disableDelete === true && this.owner === 'template');
    },

    imageLabel() {
      return (this.currentRow.disableDelete === true && this.owner === 'template') ? 'Image(optional)' : 'Image';
    }
  },

  watch: {
    value(neu) {
      this.rows = neu;
    },
    'currentRow.type'(neu) {
      if (neu === 'cd-rom') {
        this.$set(this.currentRow, 'bus', 'sata');
      }
    },
    'currentRow.pvcName'(neu) {
      const choices = this.$store.getters['cluster/all'](DATA_VOLUME);

      const pvcResource = choices.find( O => O.metadata.name === neu);

      if (!pvcResource) {
        return;
      }

      this.currentRow.accessModes = pvcResource?.spec?.pvc?.accessModes[0];
      this.currentRow.size = pvcResource?.spec?.pvc?.resources?.requests?.storage;
      this.currentRow.storageClassName = pvcResource?.spec?.pvc?.storageClassName;
      this.currentRow.volumeMode = pvcResource?.spec?.pvc?.volumeMode;
    }
  },

  methods: {
    updateBootOrder(neu) {
      if (neu === '-') {
        this.currentRow.bootOrder = '';
      }
    },
    beforeCancel() {
      this.$set(this, 'errors', []);
    },

    updateIndex(idx, type) {
      this.rowIdx = idx;
      this.type = type;
      this.$set(this, 'currentRow', clone(this.rows[this.rowIdx]) || {
        name:             `disk-${ idx }`,
        source:           'blank',
        pvcNS:            'default',
        size:             '10Gi',
        type:             'disk',
        accessMode:       'ReadWriteOnce',
        volumeMode:       'Filesystem',
        pvcName:           '',
        bus:              'virtio',
        storageClassName: this.storageOption?.[0]?.value || ''
      });
    },

    updateAdd() {
      const dataVolumeTemplates = [];
      const volumes = [];
      const disks = [];

      if (this.errors.length > 0) {
        return;
      }

      if (this.type === 'add') {
        this.rows.splice(this.rowIdx, 0, this.currentRow);
      } else if (this.type === 'delete') {
        this.rows.splice(this.rowIdx, 1);
      } else {
        this.rows.splice(this.rowIdx, 1, this.currentRow);
      }

      this.rows.forEach((o, index) => {
        if (index === 0) {
          o.disableDelete = true;
        }
        o.index = index;
      });

      this.$emit('input', this.rows);
    },

    validateName(name) {
      const arr = _.filter(this.rows, (o, index) => {
        return name === o.name;
      });

      if ((arr?.length > 0 && this.type === 'add') || (arr?.length > 1)) {
        this.errors.splice(0, 1, 'Disk with this name already exists!.');
      } else if (name.length > 20) {
        const message = this.$store.getters['i18n/t']('validation.custom.tooLongName', { max: 20 });

        this.$set(this.currentRow, 'name', name.substr(0, 20));
        this.errors.splice(0, 1, message);
      } else {
        this.errors.splice(0, 1);
      }
    },

    validateError() {
      let hasError = false;

      if (!this.currentRow.source) {
        hasError = true;
      }

      if (this.isBlank) {
        if (!this.currentRow.size || !this.currentRow.storageClassName || !this.currentRow.name || !this.currentRow.bus) {
          hasError = true;
        }
      }

      if (this.isContainerDisk) {
        if (!this.currentRow.name || !this.currentRow.container || !this.currentRow.bus) {
          hasError = true;
        }
      }

      if (hasError) {
        this.errors.splice(0, 1, 'Please fill in all required fields.');
      } else {
        this.validateName(this.currentRow.name);
      }
    }
  }
};
</script>

<template>
  <div>
    <VMModal
      :row-actions="rowActions"
      modal-name="disk"
      :title="type === 'add' ? 'Add Disk' : 'Edit Disk'"
      :rows="rows"
      :headers="headers"
      :errors="errors"
      @update:add="updateAdd"
      @update:index="updateIndex"
      @update:cancel="beforeCancel"
      @validateError="validateError"
    >
      <template v-slot:content>
        <LabeledSelect
          v-model="currentRow.source"
          :options="sourceOption"
          :disabled="currentRow.disableDelete"
          label="Source"
          class="mb-20"
          required
        />

        <LabeledSelect
          v-if="isImage"
          v-model="currentRow.image"
          class="mb-20"
          :disabled="currentRow.disableDelete"
          :label="imageLabel"
          :options="imagesOption"
          :required="imageRequired"
        />

        <LabeledSelect
          v-model="currentRow.type"
          :options="typeOption"
          label="Type"
          class="mb-20"
          required
        />

        <LabeledInput v-if="isContainerDisk" v-model="currentRow.container" label="Docker Image" class="mb-20" required />

        <LabeledInput v-model="currentRow.name" label="Name" class="mb-20" required @input="validateName" />

        <LabeledSelect
          v-if="isAttachVolume"
          v-model="currentRow.pvcName"
          label="Volume"
          class="mb-20"
          :options="pvcOption"
          required
        />

        <MemoryUnit
          v-if="!isContainerDisk"
          v-model="currentRow.size"
          :is-disabled="isAttachVolume"
          value-name="Size"
          class="mb-20"
        />

        <LabeledSelect
          v-model="currentRow.bus"
          label="Bus"
          class="mb-20"
          :disabled="isAttachVolume"
          :options="InterfaceOption"
          required
        />

        <LabeledSelect
          v-if="!isContainerDisk"
          v-model="currentRow.storageClassName"
          label="Storage Class"
          :disabled="isAttachVolume"
          class="mb-20"
          :options="storageOption"
          required
        />

        <LabeledSelect
          v-model="currentRow.bootOrder"
          label="Boot Order"
          class="mb-20"
          :clearable="true"
          :searchable="true"
          :options="bootOrderOption"
          @input="updateBootOrder"
        />

        <Collapse v-if="!isContainerDisk" :open.sync="enableAdvanced">
          <div v-if="enableAdvanced">
            <LabeledSelect v-model="currentRow.volumeMode" :disabled="isAttachVolume" label="Volume Mode" class="mb-20" :options="volumeModeOption" />
            <LabeledSelect v-model="currentRow.accessMode" :disabled="isAttachVolume" label="Access Mode" class="mb-20" :options="accessModeOption" />
          </div>
        </Collapse>
      </template>
    </VMModal>
  </div>
</template>
