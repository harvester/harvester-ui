<script>
/* eslint-disable */
import moment from 'moment';
import randomstring from 'randomstring';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import TextAreaAutoGrow from '@/components/form/TextAreaAutoGrow';
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';
import ResourceTabs from '@/components/form/ResourceTabs';
import AddSSHKey from '@/components/form/AddSSHKey';
import Checkbox from '@/components/form/Checkbox';
import RadioGroup from '@/components/form/RadioGroup';
import ChooseImage from '@/components/form/ChooseImage';
import DiskModal from '@/components/form/DiskModal';
import NetworkModal from '@/components/form/NetworkModal';
import { NAMESPACE, PVC } from '@/config/types';
import { allHash } from '@/utils/promise';
import { sortBy } from '@/utils/sort';
import { clone } from '@/utils/object';

const VM_TEMPLATE = {
  template: 'vm.cattle.io.template',
  version: 'vm.cattle.io.templateversion'
};
const IMAGE = 'vm.cattle.io.image';
const SSH = 'vm.cattle.io.keypair';
const VMI = 'kubevirt.io.virtualmachineinstance';

const SOURCE_TYPE = {
  ATTACH_CLONED: 'Attach Cloned Disks',
  ATTACH:        'Attach Disks',
  BLANK:         'blank',
  URL:           'url'
};

export default {
  name: 'EditVMT',

  components: {
    Footer,
    LabeledInput,
    ResourceTabs,
    LabeledSelect,
    AddSSHKey,
    Checkbox,
    TextAreaAutoGrow,
    DiskModal,
    NetworkModal,
    RadioGroup,
    ChooseImage
  },

  mixins: [CreateEditView],

  async fetch() {
    const hash = await allHash({ 
      template: this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.template }),
      templateVersion: this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.version }),
      image: this.$store.dispatch('cluster/findAll', { type: IMAGE }),
      ssh: this.$store.dispatch('cluster/findAll', { type: SSH }),
      pvcs: this.$store.dispatch('cluster/findAll', { type: PVC, url: `${PVC}s` }),
    });

    this.templates = hash.template;
    this.templateVersion = hash.templateVersion;
    this.images = hash.image;
    this.ssh = hash.ssh;
  },

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    const spec = {
        dataVolumeTemplates: [],
        running: false,
        template: {
          spec: {
            domain: {
              cpu: {
                cores: '',
                sockets: 1,
                threads: 1
              },
              devices: {
                interfaces: [{
                  masquerade: {},
                  model: "virtio",
                  name: "nic-0"
                }],
                disks: [{
                  bootOrder: 1,
                  disk: {
                    bus: "virtio"
                  },
                  name: "rootdisk"
                }],
                networkInterfaceMultiqueue: true,
                rng: {}
              },
              resources: {
                requests: {
                  memory: ""
                }
              }
            },
            hostname: '',
            networks: [{
              name: "nic-0",
              pod: {}
            }],
            volumes: []
          }
        }
      };

    return {
      defaultRevison: false,
      spec,
      hostname: '',
      source: '',
      sshName: '',
      publicKey: '',
      templateName: '',
      images: [],
      templates: [],
      ssh: [],
      versionName: '',
      versionOption: [],
      imageName: '',
      sshKey: [],
      cores: '',
      description: '',
      name: '',
      templateVersion: [],
      memory: '',
      memoryUnit: 'Gi',
      namespace: 'default',
      cloudInit: '',
      sshErrors: [],
      diskRows: [],
      networkRows: []
    };
  },
  // moment().format('YYYYMMDDHHMMSS')

  computed: {
    templateOption() {
      return this.templates.map( T => {
        return {
          label: T.id,
          value: T.id
        }
      })
    },

    UnitOption() {
      return [{
        label: 'MiB',
        value: 'M'
      },{
        label: 'GiB',
        value: 'G'
      },
      {
        label: 'TiB',
        value: 'T'
      }]
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
  },

  watch: {
    spec: {
      handler(spec) {
        const specMemory = spec?.template?.spec?.domain?.resources?.requests?.memory.split(/(?=\D+)/);
        const cores = spec?.template?.spec?.domain?.cpu?.cores || '';
        const hostname = spec?.template?.spec?.hostname || '';

        const diskRows = this.getDiskRows(spec);
        const networkRows = this.getNetworkRows(spec.template.spec);
        const memory = specMemory[0] || '';
        const memoryUnit = specMemory[1] || 'Gi';

        this.$set(this, 'memory', memory);
        this.$set(this, 'memoryUnit', memoryUnit)
        this.$set(this, 'cores', cores);
        this.$set(this, 'hostname', hostname);

        this.$set(this, 'diskRows', diskRows)
        this.$set(this, 'networkRows', networkRows)
      },
      immediate: true,
      deep: true
    },
    memory(neu) {
      this.spec.template.spec.domain.resources.requests.memory = `${neu}${this.memoryUnit}`;
    },
    memoryUnit(neu) {
      this.spec.template.spec.domain.resources.requests.memory = `${this.memory}${neu}`;
    },
    cores(neu) {
      this.spec.template.spec.domain.cpu.cores = neu;
    },
    hostname(neu) {
      this.spec.template.spec.hostname = neu;
      // this.metadata.name = neu;
    },
    templateName(id) {
      const templateSpec = this.templateVersion.find( V => {
        return V.spec.templateId;
      })
      this.$set(this, 'spec', templateSpec.spec.vm);
    }
  },

  methods: {
    async saveVMT(buttonCb) {
      await this.save(buttonCb);

      this.normalizeSpec();
      await this.$store.dispatch('management/request', {
        method:  'POST',
        headers: {
          'content-type': 'application/json',
          accept:         'application/json',
        },
        url:  `v1/vm.cattle.io.templateversion`,
        data: {
          apiVersion: "vm.cattle.io/v1alpha1",
          kind: "vm.cattle.io.templateversion",
          type: "vm.cattle.io.templateversion",
          metadata: {
            namespace: this.value.metadata.namespace,
          },
          spec: {
            templateId: `${this.value.metadata.namespace}:${this.value.metadata.name}`,
            vm: {
              ...this.spec
            }
          }
        },
      });
    },

    normalizeSpec() {
      this.parseNetworkRows();
      this.parseDiskRows();
    },

    updateImageName(neu) {
      this.imageName = neu;
      this.images.map( O => {
        if (O.spec.displayName === neu) {
          this.source = O.status.downloadUrl || O.spec.url;
        }
      })
    },

    updateSSHKey(neu) {
      this.$set(this, 'sshKey', neu);
    },

    getDiskRows(spec) {
      const _dataVolumeTemplates = spec?.dataVolumeTemplates || [];
      const _disks = spec?.template?.spec?.domain?.devices?.disks || [];
      const _volumes = spec?.template?.spec?.volumes || [];

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

    parseDiskRows() {
      const dataVolumeTemplates = [];
      const disks = [];
      const volumes = [];

      this.diskRows.forEach( (R) => {
        const dataVolumeName = `${this.hostname}-${R.name}-${randomstring.generate(5).toLowerCase()}`;
        let _dataVolumeTemplate = {};

        const _disk = {
          disk: { bus: R.bus },
          name: R.name
        };

        
        let _volume = {
          name:       R.name,
          dataVolume: { name: dataVolumeName }
        };
        let accessModel = R.accessMode || 'ReadWriteOnce';
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

      const sshValue = this.ssh.filter( O => {
        if (this.sshKey.includes(O.metadata.name)) {
          return true;
        }
      });
      const hostName = this.hostname;
      const name = 'default';
      let sshString = '';
      sshValue.map( S => {
        const sshKey = S.spec.publicKey.replace(/\s+/g, '    \n    ');
        sshString += `\n   - >-\n    ${sshKey}`;
      })

      let initScript = ''
      if(this.cloudInit) {
        initScript += `\n${this.cloudInit}`
      }

      disks.push({
        name: 'cloudinitdisk',
        disk: {
          bus: 'virtio'
        }
      });

      volumes.push({
        name: 'cloudinitdisk',
        cloudInitNoCloud: {
          userData: `#cloud-config\nname: ${name}\nhostname: ${hostName}\nssh_authorized_keys:${sshString}${initScript}`
        }
      })

      const spec = {
        ...this.spec,
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
        delete spec.dataVolumeTemplates
      }

      if (volumes.length === 0) {
        delete spec.template.spec.volumes
      }

      this.$set(this, 'spec', spec);
    },

    getNetworkRows(spec) {
      const networks = spec?.networks || [];
      const interfaces = spec?.domain?.devices?.interfaces || [];

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
      }

      this.$set(this.spec.template, 'spec', spec);
    },
  }
};
</script>

<template>
  <div id="vm">
    <div class="row">
      <div class="col span-6">
        <LabeledInput v-model="value.metadata.name" label="Template Name" required />
      </div>
<!-- 
      <div class="col span-6">
        <LabeledSelect v-model="value.metadata.namespace" :options="namespaceOptions" label="Namespace" />
      </div> -->
    </div>

    <!-- <div class="min-spacer"></div> -->

    <!-- <Checkbox v-model="defaultRevison" label="Default Revison" type="checkbox" /> -->

    <div class="spacer"></div>

    <ChooseImage :images="images" @update:imageName="updateImageName" :imageName="imageName" />

    <div class="spacer"></div>

    <h2>Choose a Size:</h2>
    <div class="row">
      <div class="col span-5">
        <LabeledInput v-int-number v-model.number="cores" label="CPU Request(core)" required />
      </div>

      <div class="col span-5">
        <LabeledInput v-int-number v-model.number="memory" label="Memory Request" required />
      </div>

      <div class="col span-2">
        <LabeledSelect v-int-number v-model="memoryUnit" label="Size" :options="UnitOption" />
      </div>
    </div>

    <div class="spacer"></div>

    <h2>Add disk storage:</h2>
    <DiskModal v-model='diskRows' />

    <div class="spacer"></div>        

    <h2>Networking:</h2>
    <NetworkModal v-model='networkRows' />

    <div class="spacer"></div>

    <h2>Authentication:</h2>
    <AddSSHKey :ssh='ssh' :sshKey="sshKey" @update:sshKey="updateSSHKey" />

    <div class="spacer"></div>

    <h2>Cloud-init:</h2>
    <TextAreaAutoGrow ref="value" v-model="cloudInit" :minHeight="160" />

    <div class="spacer"></div>

    <LabeledInput label="Description" type='multiline' v-model="value.metadata.description" />
    
    <Footer :mode="mode" :errors="errors" @save="saveVMT" @done="done" />
  </div>
</template>

<style lang="scss" scoped>
#vm {
  .tip {
    color: #8e8e92;
  }
}
</style>
