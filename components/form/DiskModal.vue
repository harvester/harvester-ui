<script>
import _ from 'lodash';
import randomstring from 'randomstring';
import VMModal from '@/components/form/VMModal';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import Collapse from '@/components/Collapse';
import { clone } from '@/utils/object';
import { sortBy } from '@/utils/sort';
import MemoryUnit from '@/components/form/MemoryUnit';
import { NAMESPACE, PVC, STORAGE_CLASS, IMAGE } from '@/config/types';

const SOURCE_TYPE = {
  URL:            'VM Image',
  BLANK:          'blank',
  ATTACH_VOLUME:  'attach volume',
  CONTAINER_DISK: 'Container'
};

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
    isUrl() {
      return this.currentRow.source === SOURCE_TYPE.URL;
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

    namespaceOptions() {
      const choices = this.$store.getters['cluster/all'](NAMESPACE);

      return sortBy(
        choices
          .map((obj) => {
            return {
              label: obj.nameDisplay,
              value: obj.id
            };
          }),
        'label'
      );
    },

    pvcOption() {
      const choices = this.$store.getters['cluster/all'](PVC);

      return sortBy(
        choices
          .filter( (obj) => {
            return obj.metadata.namespace === this.currentRow.pvcNS;
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
        width: 100,
      },
      {
        name:  'Source',
        label: 'Source',
        value: 'source',
        width: 100,
      },
      {
        name:      'Size',
        label:     'Size',
        value:     'size',
        width:     80,
      },
      {
        name:  'Interface',
        label: 'Interface',
        value: 'bus',
        width: 90,
      },
      {
        name:  'Storage Class',
        label: 'Storage Class',
        value: 'storageClassName',
        width: 90,
      }, {
        name:  'bootOrder',
        label: 'bootOrder',
        value: 'bootOrder',
        width: 70,
      }];
    },

    sourceOption() {
      return [{
        label: SOURCE_TYPE.BLANK,
        value: SOURCE_TYPE.BLANK
      }, {
        label: SOURCE_TYPE.URL,
        value: SOURCE_TYPE.URL
      }, {
        label: SOURCE_TYPE.CONTAINER_DISK,
        value: SOURCE_TYPE.CONTAINER_DISK
      }];
    },

    UnitOption() {
      return [{
        label: 'MiB',
        value: 'Mi'
      }, {
        label: 'GiB',
        value: 'Gi'
      },
      {
        label: 'TiB',
        value: 'Ti'
      }];
    },

    InterfaceOption() {
      return [{
        label: 'VirtIO',
        value: 'virtio'
      }, {
        label: 'STAT',
        value: 'sata'
      }, {
        label: 'SCSI',
        value: 'scsi'
      }];
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

      return baseOrder;
    },
    choosedOrder() {
      return this.rows.map( R => R.bootOrder );
    },
  },

  watch: {
    value(neu) {
      this.rows = neu;
    },
    'currentRow.source'(neu) {
      if (neu === 'Container') {
        this.currentRow.accessMode = '';
        this.currentRow.volumeMode = '';
        this.currentRow.size = '';
        this.currentRow.bus = '';
        this.currentRow.storageClassName = '';
      } else {
        this.currentRow.accessMode = 'ReadWriteOnce';
        this.currentRow.volumeMode = 'Filesystem';
        this.currentRow.size = '10Gi';
        this.currentRow.bus = 'virtio';
        this.currentRow.storageClassName = this.storageOption?.[0]?.value || '';
      }
    }
  },

  methods: {
    beforeCancel() {
      this.$set(this, 'errors', []);
    },

    updateIndex(idx, type) {
      this.rowIdx = idx;
      this.type = type;
      this.$set(this, 'currentRow', clone(this.rows[this.rowIdx]) || {
        name:             `disk-${ idx - 1 }`,
        source:           'blank',
        pvcNS:            'default',
        size:             '10Gi',
        accessMode:       'ReadWriteOnce',
        volumeMode:       'Filesystem',
        bus:              'virtio',
        storageClassName: this.storageOption?.[0]?.value || ''
      });
    },

    updateAdd() {
      const dataVolumeTemplates = [];
      const volumes = [];
      const disks = [];

      if (this.type === 'add') {
        this.rows.splice(this.rowIdx, 0, this.currentRow);
      } else if (this.type === 'delete') {
        this.rows.splice(this.rowIdx, 1);
      } else {
        this.rows.splice(this.rowIdx, 1, this.currentRow);
      }

      this.rows.forEach((o, index) => {
        o.index = index;
      });

      this.$emit('input', this.rows);
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
        this.errors.splice(0, 1);
      }
    }
  }
};
</script>

<template>
  <div>
    <VMModal
      modal-name="disk"
      title="Add Disk"
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
          :disabled="currentRow.disableSource"
          :options="sourceOption"
          label="Source"
          class="mb-20"
          required
        />

        <LabeledSelect
          v-if="isUrl"
          v-model="currentRow.url"
          :disabled="currentRow.name === 'rootdisk'"
          class="mb-20"
          label="Select Image"
          :options="imagesOption"
          required
        />

        <LabeledInput v-if="isContainerDisk" v-model="currentRow.container" label="Docker Image" class="mb-20" required />

        <LabeledInput v-model="currentRow.name" :disabled="currentRow.name === 'rootdisk'" label="Name" class="mb-20" required />

        <LabeledSelect
          v-if="isAttachVolume"
          v-model="currentRow.pvcName"
          label="Persistent Volume Claim"
          class="mb-20"
          :options="pvcOption"
          required
        />

        <MemoryUnit v-if="!isContainerDisk" v-model="currentRow.size" value-name="Size (GiB)" class="mb-20" />

        <LabeledSelect v-model="currentRow.bus" label="Interface" class="mb-20" :options="InterfaceOption" required />

        <LabeledSelect
          v-if="!isContainerDisk"
          v-model="currentRow.storageClassName"
          label="Storage Class"
          class="mb-20"
          :options="storageOption"
          required
        />

        <LabeledSelect
          v-model="currentRow.bootOrder"
          label="bootOrder"
          class="mb-20"
          :options="bootOrderOption"
          :disabled="currentRow.name === 'rootdisk'"
        />

        <Collapse v-if="!isAttachVolume && !isContainerDisk" :open.sync="enableAdvanced">
          <div v-if="enableAdvanced">
            <LabeledSelect v-model="currentRow.volumeMode" label="Volume Mode" class="mb-20" :options="volumeModeOption" />
            <LabeledSelect v-model="currentRow.accessMode" label="Access Model" class="mb-20" :options="accessModeOption" />
          </div>
        </Collapse>
      </template>
    </VMModal>
  </div>
</template>
