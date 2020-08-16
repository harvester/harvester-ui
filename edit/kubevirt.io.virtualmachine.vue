<script>
import moment from 'moment';
import randomstring from 'randomstring';
import Footer from '@/components/form/Footer';
import Checkbox from '@/components/form/Checkbox';
import AddSSHKey from '@/components/form/AddSSHKey';
import DiskModal from '@/components/form/DiskModal';
import ChooseImage from '@/components/form/ChooseImage';
import LabeledInput from '@/components/form/LabeledInput';
import NetworkModal from '@/components/form/NetworkModal';
import LabeledSelect from '@/components/form/LabeledSelect';
import TextAreaAutoGrow from '@/components/form/TextAreaAutoGrow';
import CreateEditView from '@/mixins/create-edit-view';
import {
  NAMESPACE, PVC, VM_TEMPLATE, IMAGE, SSH, VMI, STORAGE_CLASS, NETWORK_ATTACHMENT
} from '@/config/types';
import { MemoryUnit } from '@/config/map';
import { allHash } from '@/utils/promise';
import { sortBy } from '@/utils/sort';
import { clone } from '@/utils/object';

const SOURCE_TYPE = {
  ATTACH_CLONED: 'Attach Cloned Disks',
  ATTACH:        'Attach Disks',
  BLANK:         'blank',
  URL:           'url'
};

export default {
  name: 'EditVM',

  components: {
    Footer,
    Checkbox,
    LabeledInput,
    LabeledSelect,
    AddSSHKey,
    TextAreaAutoGrow,
    DiskModal,
    NetworkModal,
    ChooseImage
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const hash = await allHash({
      ssh:                this.$store.dispatch('cluster/findAll', { type: SSH }),
      pvcs:               this.$store.dispatch('cluster/findAll', { type: PVC }),
      image:              this.$store.dispatch('cluster/findAll', { type: IMAGE }),
      template:           this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.template }),
      storageClass:       this.$store.dispatch('cluster/findAll', { type: STORAGE_CLASS }),
      templateVersion:    this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.version }),
      networkAttachment:  this.$store.dispatch('cluster/findAll', { type: NETWORK_ATTACHMENT }),
    });

    this.ssh = hash.ssh;
    this.images = hash.image;
    this.templates = hash.template;
    this.templateVersion = hash.templateVersion;
  },

  data() {
    let spec = this.value.spec;

    if ( !spec ) {
      spec = {
        dataVolumeTemplates: [],
        running:             true,
        template:            {
          spec: {
            domain: {
              cpu: {
                cores:   '',
                sockets: 1,
                threads: 1
              },
              devices: {
                interfaces: [{
                  masquerade: {},
                  model:      'virtio',
                  name:       'nic-0'
                }],
                disks: [{
                  bootOrder: 1,
                  disk:      { bus: 'virtio' },
                  name:      'rootdisk'
                }],
                networkInterfaceMultiqueue: true,
                rng:                        {}
              },
              resources: { requests: { memory: '' } }
            },
            hostname: '',
            networks: [{
              name: 'nic-0',
              pod:  {}
            }],
            volumes: []
          }
        }
      };
      this.value.spec = spec;
    }

    const imageName = this.$route.query?.image || '';

    return {
      spec,
      source:          '',
      sshName:         '',
      publicKey:       '',
      templateName:    '',
      images:          [],
      templates:       [],
      ssh:             [],
      versionName:     '',
      versionOption:   [],
      imageName,
      sshKey:          [],
      description:     '',
      templateVersion: [],
      namespace:       'default',
      cloudInit:       '',
      sshErrors:       [],
      isRunning:       true,
      useTemplate:     false
    };
  },
  // moment().format('YYYYMMDDHHMMSS')

  computed: {
    templateOption() {
      return this.templates.map( (T) => {
        return {
          label: T.id,
          value: T.id
        };
      });
    },

    UnitOption() {
      return MemoryUnit;
    },

    memory: {
      get() {
        const value = this.spec?.template?.spec?.domain?.resources?.requests?.memory.split(/(?=([a-zA-Z]{2}))/)[0] || '';

        return value;
      },
      set(value) {
        const neu = `${ value }${ this.memoryUnit }`;

        this.$set(this.spec.template.spec.domain.resources.requests, 'memory', neu);
      }
    },

    memoryUnit: {
      get() {
        const value = this.spec?.template?.spec?.domain?.resources?.requests?.memory.split(/(?=([a-zA-Z]{2}))/)[1] || 'Gi';

        return value;
      },
      set(value) {
        const neu = `${ this.memory }${ value }`;

        this.$set(this.spec.template.spec.domain.resources.requests, 'memory', neu);
      }
    },

    cores: {
      get() {
        return this.spec?.template?.spec?.domain?.cpu?.cores || '';
      },
      set(value) {
        this.$set(this.spec.template.spec.domain.cpu, 'cores', value);
      }
    },

    hostname: {
      get() {
        return this.spec.template.spec.hostname || '';
      },
      set(neu) {
        this.$set(this.value.metadata, 'name', neu);
        this.$set(this.spec.template.spec, 'hostname', neu);
      }
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

    diskRows: {
      get() {
        const _dataVolumeTemplates = this.spec?.dataVolumeTemplates || [];
        const _disks = this.spec?.template?.spec?.domain?.devices?.disks || [];
        const _volumes = this.spec?.template?.spec?.template?.spec?.volumes || [];

        const out = _disks.map( (DISK, index) => {
          const volume = _volumes.find( (V) => {
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
                source = SOURCE_TYPE.BLANK;
              } else if (DVT.spec?.source?.pvc) {
                source = SOURCE_TYPE.ATTACH_CLONED;
                pvcName = DVT.spec?.source?.pvcname;
                pvcNS = DVT.spec?.source?.pvc.namespace;
              } else {
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
            storageClassName,
          };
        });

        return out;
      },

      set(neu) {

      }
    },

    networkRows: {
      get() {
        const networks = this.spec?.networks || [];
        const interfaces = this.spec?.template?.spec?.domain?.devices?.interfaces || [];

        console.log('this.spec', this.spec?.domain?.devices?.interfaces);
        const out = interfaces.map( (O, index) => {
          const network = networks.find( (N) => {
            return O.name === N.name;
          });

          const type = O.sriov ? 'sriov' : O.bridge ? 'bridge' : 'masquerade';

          return {
            ...O,
            type,
            networkName: network?.multus?.networkName || 'Pod Networking',
            index
          };
        });

        return out;
      },

      set() {

      }
    }
  },

  watch: {
    templateName(id) {
      const templateSpec = this.templateVersion.find( (V) => {
        return V.spec.templateId;
      });

      this.imageName = 'new2' || templateSpec.spec.imageId.split(':')[1];
    }
  },

  methods: {
    saveVM(buttonCb) {
      if (!this.source) {
        this.errors = ['Please select image!'];
        buttonCb(true);

        return;
      }
      this.$set(this.value, 'type', 'kubevirt.io.virtualmachine');
      const url = this.schema.linkFor('collection');

      this.normalizeSpec();
      this.$delete(this.value, 'type');
      this.save(buttonCb, url);
    },

    normalizeSpec() {
      this.parseNetworkRows();
      this.parseDiskRows();
    },

    updateImageName(neu) {
      this.imageName = neu;
      this.images.map( (O) => {
        if (O.spec.displayName === neu) {
          this.source = O.status.downloadUrl || O.spec.url;
        }
      });
    },

    updateSSHKey(neu) {
      this.$set(this, 'sshKey', neu);
    },

    parseDiskRows() {
      const dataVolumeTemplates = [];
      const disks = [];
      const volumes = [];

      this.diskRows.forEach( (R) => {
        const dataVolumeName = `${ this.hostname }-${ R.name }-${ randomstring.generate(5).toLowerCase() }`;
        let _dataVolumeTemplate = {};

        const _disk = {
          disk: { bus: R.bus },
          name: R.name
        };

        const _volume = {
          name:       R.name,
          dataVolume: { name: dataVolumeName }
        };
        const accessModel = R.accessMode || 'ReadWriteOnce';

        _dataVolumeTemplate = {
          apiVersion: 'cdi.kubevirt.io/v1alpha1',
          kind:       'DataVolume',
          metadata:   { name: dataVolumeName },
          spec:       {
            pvc: {
              accessModes: [
                accessModel
              ],
              resources:  { requests: { storage: '10Gi' } },
              volumeMode: R.volumeMode || 'Filesystem'
            }
          }
        };

        if (R.bootOrder) { // is rootdisk
          _disk.bootOrder = 1;
        }

        switch (R.source) {
        case SOURCE_TYPE.BLANK:
          _dataVolumeTemplate.spec.pvc.storageClassName = R.storageClassName;
          _dataVolumeTemplate.spec.source = { blank: {} };
          break;

        default:
          _dataVolumeTemplate.spec.source = { http: { url: this.source } };
        }

        disks.push(_disk);
        volumes.push(_volume);
        dataVolumeTemplates.push(_dataVolumeTemplate);
      });

      const sshValue = this.ssh.filter( (O) => {
        if (this.sshKey.includes(O.metadata.name)) {
          return true;
        }
      });
      const hostName = this.hostname;
      const name = 'default';
      let sshString = '';

      sshValue.map( (S) => {
        const sshKey = S.spec.publicKey.replace(/\s+/g, '    \n    ');

        sshString += `\n   - >-\n    ${ sshKey }`;
      });

      let initScript = '';

      if (this.cloudInit) {
        initScript += `\n${ this.cloudInit }`;
      }

      if (!disks.find( D => D.name === 'cloudinitdisk')) {
        disks.push({
          name: 'cloudinitdisk',
          disk: { bus: 'virtio' }
        });

        volumes.push({
          name:             'cloudinitdisk',
          cloudInitNoCloud: { userData: `#cloud-config\nname: ${ name }\nhostname: ${ hostName }\nssh_authorized_keys:${ sshString }${ initScript }` }
        });
      }

      const spec = {
        ...this.spec,
        running:  this.isRunning,
        dataVolumeTemplates,
        template: {
          ...this.spec.template,
          spec: {
            ...this.spec.template.spec,
            domain: {
              ...this.spec.template.spec.domain,
              devices: {
                ...this.spec.template.spec.domain.devices,
                disks,
              },
            },
            volumes
          }
        }
      };

      if (dataVolumeTemplates.length === 0) {
        delete spec.dataVolumeTemplates;
      }

      if (volumes.length === 0) {
        delete spec.template.spec.volumes;
      }

      this.$set(this.value, 'spec', spec);
    },

    parseNetworkRows() {
      const interfaces = [];
      const networks = [];

      this.networkRows.forEach( (O) => {
        const _interface = {};
        const network = {};

        if (O.networkName === 'Pod Networking') {
          _interface.masquerade = {};
          network.pod = {};
        } else {
          if (O.sriov) {
            _interface.sriov = {};
          } else if (O.bridge) {
            _interface.bridge = {};
          }
          _interface.macAddress = O.macAddress;
          network.multus = { networkName: O.networkName };
        }

        _interface.model = O.model;
        _interface.name = O.name;
        network.name = O.name;

        interfaces.push(_interface);

        networks.push(network);
      });

      const spec = {
        ...this.spec.template.spec,
        domain: {
          ...this.spec.template.spec.domain,
          devices: {
            ...this.spec.template.spec.domain.devices,
            interfaces,
          },
        },
        networks
      };

      this.$set(this.value.spec.template, 'spec', spec);
    },
  }
};
</script>

<template>
  <div id="vm">
    <div class="row">
      <div class="col span-6">
        <LabeledSelect v-model="value.metadata.namespace" :options="namespaceOptions" label="Namespace" />
      </div>
    </div>

    <div class="min-spacer"></div>
    <Checkbox v-model="useTemplate" class="check" type="checkbox" label="Use an existing VM Template:" />
    <div class="min-spacer"></div>
    <div class="row">
      <div v-if="useTemplate" class="col span-6">
        <LabeledSelect v-model="templateName" label="template" :options="templateOption" />
      </div>
    </div>

    <div class="spacer"></div>

    <ChooseImage :images="images" :image-name="imageName" @update:imageName="updateImageName" />

    <div class="spacer"></div>

    <h2>Choose a Size:</h2>
    <div class="row">
      <div class="col span-5">
        <LabeledInput v-model.number="cores" v-int-number label="CPU Request(core)" required />
      </div>

      <div class="col span-5">
        <LabeledInput v-model.number="memory" v-int-number label="Memory Request" required />
      </div>

      <div class="col span-2">
        <LabeledSelect v-model="memoryUnit" v-int-number label="Size" :options="UnitOption" />
      </div>
    </div>

    <div class="spacer"></div>

    <h2>Add disk storage:</h2>
    <DiskModal v-model="diskRows" />

    <div class="spacer"></div>

    <h2>Networking:</h2>
    <NetworkModal v-model="networkRows" />

    <div class="spacer"></div>

    <h2>Authentication:</h2>
    <AddSSHKey :ssh="ssh" :ssh-key="sshKey" @update:sshKey="updateSSHKey" />

    <div class="spacer"></div>

    <h2>Cloud-init:</h2>
    <TextAreaAutoGrow ref="value" v-model="cloudInit" :min-height="160" />

    <div class="spacer"></div>

    <h2>Finalize and create:</h2>
    <LabeledInput v-model="hostname" label="Host Name" required />
    <div class="tip mt-6 mt-5">
      Give an identifying name you will remember them by. Your hostname name can only contain alphanumeric characters, dashes, and periods.
    </div>

    <div class="spacer"></div>

    <LabeledInput v-model="value.metadata.description" label="Description" type="multiline" />

    <div class="spacer"></div>
    <Checkbox v-model="isRunning" class="check" type="checkbox" label="Start virtual machine on creation" />
    <Footer :mode="mode" :errors="errors" @save="saveVM" @done="done" />
  </div>
</template>

<style lang="scss" scoped>
#vm {
  .tip {
    color: #8e8e92;
  }
}
</style>
