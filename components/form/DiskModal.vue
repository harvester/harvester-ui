<script>
import randomstring from 'randomstring';
import VMModal from '@/components/form/VMModal';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import { clone } from '@/utils/object';
import { sortBy } from '@/utils/sort';
import { NAMESPACE, PVC } from '@/config/types';

const SOURCE_TYPE = {
  AttachCloned: 'Attach Cloned Disks',
  Attach:       'Attach Disks',
  BLANK:        'blank',
  URL:          'url'
};

export default {
  components: {
    VMModal,
    LabeledInput,
    LabeledSelect
  },

  props:      {
    value: {
      type:    Object,
      default: () => {
        return {};
      }
    }
  },

  data() {
    return {
      type:       'add',
      errors:     [],
      rowIndex:   0,
      currentRow: {},
      pvcs:       [],
    };
  },

  computed: {
    isUrl() {
      return this.currentRow.source === SOURCE_TYPE.URL;
    },
    isAttachCloned() {
      return this.currentRow.source === SOURCE_TYPE.AttachCloned;
    },
    isAttach() {
      return this.currentRow.source === SOURCE_TYPE.Attach;
    },
    isBlank() {
      return this.currentRow.source === SOURCE_TYPE.BLANK;
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

    headers() {
      return [{
        name:     'name',
        label:    'Name',
        value:    'name',
        width:    100,
      },
      {
        name:     'Source',
        label:    'Source',
        value:    'source',
        width:    100,
      },
      {
        name:     'Size',
        label:    'Size',
        value:    'size',
        width:    120,
      },
      {
        name:     'Interface',
        label:    'Interface',
        value:    'bus',
        width:    100,
      },
      {
        name:     'Storage Class',
        label:    'Storage Class',
        value:    'storageClassName',
        width:    120,
      }];
    },

    sourceOption() {
      return [{
        label: 'Blank',
        value: SOURCE_TYPE.BLANK
      }, {
        label: 'Attach Cloned Disks',
        value: SOURCE_TYPE.AttachCloned
      }, {
        label: 'Attach Disks',
        value: SOURCE_TYPE.Attach
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

    storageOption() {
      return [{
        label: 'hostpath',
        value: 'hostpath'
      }];
    },

    volumeModeOption() {
      return [{
        label: 'FileSystem',
        value: 'Filesystem'
      }, {
        label: 'Blokc',
        value: 'Block'
      }];
    },

    accessModeOption() {
      return [{
        label: 'Single User(RWO)',
        value: 'RWO'
      }, {
        label: 'Shared Access(RWX)',
        value: 'RWX'
      }, {
        label: 'Read Only(ROX)',
        value: 'ROX'
      }];
    },

    rows() {
      const _dataVolumeTemplates = this.value?.dataVolumeTemplates || [];
      const _disk = this.value?.template?.spec?.domain?.devices?.disks || [];
      const _volume = this.value?.template?.spec?.volumes || [];

      const out = _disk.map( (DISK, index) => {
        const volume = _volume.find( (V) => {
          return V.name === DISK.name;
        });

        let source = '';
        let pvcName = '';
        let pvcNS = '';
        let accessMode = '';
        let size = '';
        const unit = '';
        let volumeMode = '';
        let storageClassName = '';
        let url = '';

        if (volume?.dataVolume && volume?.dataVolume?.name) {
          const volumeName = volume.dataVolume.name;

          const DVT = _dataVolumeTemplates.find( (T) => {
            return T.metadata.name === volumeName;
          });

          if (DVT) {
            if (DVT.spec?.source?.blank) {
              source = 'blank';
            } else if (DVT.spec?.source?.pvc) {
              source = 'Attach Cloned Disks';
              pvcName = DVT.spec?.source?.pvcname;
              pvcNS = DVT.spec?.source?.pvc.namespace;
            } else if (DVT.spec?.source?.http?.url) {
              source = 'url';
              url = DVT.spec?.source?.http?.url;
            }

            accessMode = DVT.spec?.pvc?.accessModes?.[0];
            size = DVT.spec?.pvc?.resources?.requests?.storage;
            volumeMode = DVT.spec?.pvc?.volumeMode;
            storageClassName = DVT.spec?.pvc?.storageClassName;
          }
        }

        const bus = DISK.disk.bus;

        return {
          index,
          source,
          name: DISK.name,
          bus,
          pvcName,
          pvcNS,
          accessMode,
          size,
          unit,
          volumeMode,
          url,
          storageClassName
        };
      });

      return out;
    },
  },

  methods: {
    updateIndex(index, type) {
      this.rowIndex = index;
      this.type = type;
      this.$set(this, 'currentRow', clone(this.rows[this.rowIndex]) || { name: `disk-${ index - 1 }`, pvcNS: 'default' });
    },
    beforeCancel() {
      this.$set(this, 'errors', []);
    },
    updateAdd() {
      const dataVolumeTemplates = [];
      const disks = [];
      const volumes = [];

      if (this.type === 'add') {
        this.rows.splice(this.rowIndex, 0, this.currentRow);
      } else if (this.type === 'delete') {
        this.rows.splice(this.rowIndex, 1);
      } else {
        this.rows.splice(this.rowIndex, 1, this.currentRow);
      }

      console.log('----out disk', this.currentRow, this.rows);
      this.rows.forEach( (R) => {
        const dataVolumeName = randomstring.generate(5);
        let _volume = {};
        let _dataVolumeTemplate = {};

        const _disk = {
          disk: { bus: R.bus },
          name: R.name
        };

        if (R.source !== 'Attach Disks') {
          _volume = {
            name:       R.name,
            dataVolume: { name: dataVolumeName }
          };
        } else {
          _volume = {
            name:                  dataVolumeName,
            persistentVolumeClaim: { claimName: R.pvc }
          };
        }

        _dataVolumeTemplate = {
          apiVersion: 'cdi.kubevirt.io/v1alpha1',
          kind:       'DataVolume',
          metadata:   { name: dataVolumeName },
          spec:       {
            pvc: {
              accessModes: [
                R.accessMode
              ],
              resources:  { requests: { storage: `${ R.size }${ R.unit }` } },
              volumeMode: R.volumeMode
            }
          }
        };

        if (R.bootOrder) { // is rootdisk
          _disk.bootOrder = 1;
        }

        switch (R.source) {
        case 'Attach Disks':
          _dataVolumeTemplate = null;
          break;

        case 'url':
          _dataVolumeTemplate.spec.source = { http: { url: 'https://launchpad.net/cirros/trunk/0.3.0/+download/cirros-0.3.0-x86_64-uec.tar.gz' } };
          break;

        case 'break':
          _dataVolumeTemplate.spec.pvc.storageClassName = R.storageClassName;
          _dataVolumeTemplate.spec.source = { blank: {} };
          break;

        case 'Attach Cloned Disks':
          _dataVolumeTemplate.spec.pvc.storageClassName = R.storageClassName;
          _dataVolumeTemplate.spec.source = {
            pvc: {
              name:      R.pvcName,
              namespace: R.pvcNS
            }
          };
          break;
        default:
        }

        disks.push(_disk);
        volumes.push(_volume);
        dataVolumeTemplates.push(_dataVolumeTemplate);
      });

      const spec = {
        ...this.value,
        dataVolumeTemplates,
        template: {
          spec: {
            domain: {
              ...this.value.template.spec.domain,
              devices: {
                ...this.value.template.spec.domain.devices,
                disks,
              },
            },
            volumes
          }
        }
      };

      this.$emit('input', spec);
    },
    validateError() {
      if (this.isBlank) {

      } else if (this.isAttachCloned) {

      } else if (this.isAttach) {

      }
    }
  }
};
</script>

<template>
  <div>
    <VMModal
      modal-name="disk"
      title="Add Diska"
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
          label="Source"
          class="mb-20"
          required
        />

        <LabeledInput
          v-if="isUrl"
          v-model="currentRow.url"
          label="Url"
          class="mb-20"
          required
        />

        <LabeledInput v-model="currentRow.name" label="Name" class="mb-20" required />

        <LabeledSelect
          v-if="isAttachCloned"
          v-model="currentRow.pvcNS"
          label="PVC Namespace"
          :options="namespaceOptions"
          class="mb-20"
          required
        />

        <LabeledSelect
          v-if="isAttachCloned || isAttach"
          v-model="currentRow.pvcName"
          label="Persistent Volume Claim"
          :options="pvcOption"
          class="mb-20"
          required
        />

        <div v-if="!isAttach" class="row mb-20">
          <div class="col span-8">
            <LabeledInput
              v-model.number="currentRow.size"
              v-int-number
              label="Size"
              required
            />
          </div>

          <div class="col span-4">
            <LabeledSelect v-model="currentRow.unit" label="Unit" :options="UnitOption" required />
          </div>
        </div>

        <LabeledSelect
          v-model="currentRow.bus"
          label="Interface"
          :options="InterfaceOption"
          class="mb-20"
          required
        />

        <LabeledSelect
          v-if="!isAttach"
          v-model="currentRow.storageClassName"
          label="Storage Class"
          :options="storageOption"
          class="mb-20"
          required
        />

        <template v-if="!isAttach">
          <div>Show Advanced</div>

          <LabeledSelect v-model="currentRow.volumeMode" class="mb-20" label="Volume Mode" :options="volumeModeOption" />

          <LabeledSelect v-model="currentRow.accessMode" class="mb-20" label="Access Model" :options="accessModeOption" />
        </template>
      </template>
    </VMModal>
  </div>
</template>
