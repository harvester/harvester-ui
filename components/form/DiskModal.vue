<script>
import randomstring from 'randomstring';
import VMModal from '@/components/form/VMModal';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import Collapse from '@/components/Collapse';
import { clone } from '@/utils/object';
import { sortBy } from '@/utils/sort';
import { NAMESPACE, PVC, STORAGE_CLASS } from '@/config/types';

const SOURCE_TYPE = {
  ATTACH:        'Attach Disks',
  BLANK:         'blank',
  ATTACH_VOLUME: 'attach volume',
  URL:           'url'
};

export default {
  components: {
    VMModal,
    Collapse,
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
        formatter: 'valueUnit',
        width:     120,
      },
      {
        name:  'Interface',
        label: 'Interface',
        value: 'bus',
        width: 100,
      },
      {
        name:  'Storage Class',
        label: 'Storage Class',
        value: 'storageClassName',
        width: 120,
      }];
    },

    sourceOption() {
      return [{
        label: SOURCE_TYPE.BLANK,
        value: SOURCE_TYPE.BLANK
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
  },
  watch: {
    value(neu) {
      this.rows = neu;
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
        unit:             'Gi',
        size:             10,
        accessMode:       'ReadWriteOnce',
        volumeMode:       'Filesystem',
        bus:              'virtio',
        storageClassName: this.storageOption?.[0]?.value || ''
      });
    },

    updateAdd() {
      const dataVolumeTemplates = [];
      const disks = [];
      const volumes = [];

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
        if (!this.currentRow.size || !this.currentRow.storageClassName || !this.currentRow.name) {
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
        <LabeledSelect v-model="currentRow.source" :options="sourceOption" label="Source" required />

        <div class="min-spacer"></div>

        <template v-if="isUrl">
          <LabeledInput v-model="currentRow.url" label="Url" required />
          <div class="min-spacer"></div>
        </template>

        <LabeledInput v-model="currentRow.name" label="Name" required />

        <div class="min-spacer"></div>

        <template v-if="isAttachVolume">
          <LabeledSelect v-model="currentRow.pvcName" label="Persistent Volume Claim" :options="pvcOption" required />
          <div class="min-spacer"></div>
        </template>

        <div v-if="!isAttachVolume" class="row mb-20">
          <div class="col span-8">
            <LabeledInput v-model.number="currentRow.size" v-int-number label="Size" required />
          </div>

          <div class="col span-4">
            <LabeledSelect v-model="currentRow.unit" label="Unit" :options="UnitOption" required />
          </div>
        </div>

        <LabeledSelect v-model="currentRow.bus" label="Interface" :options="InterfaceOption" required />

        <div class="min-spacer"></div>

        <template v-if="!isAttachVolume">
          <LabeledSelect v-model="currentRow.storageClassName" label="Storage Class" :options="storageOption" required />
          <div class="min-spacer"></div>
        </template>

        <Collapse v-if="!isAttachVolume" :open.sync="enableAdvanced">
          <div v-if="enableAdvanced">
            <LabeledSelect v-model="currentRow.volumeMode" label="Volume Mode" :options="volumeModeOption" />

            <div class="min-spacer"></div>

            <LabeledSelect v-model="currentRow.accessMode" label="Access Model" :options="accessModeOption" />

            <div class="min-spacer"></div>
          </div>
        </Collapse>
      </template>
    </VMModal>
  </div>
</template>
