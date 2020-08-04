<script>
/* eslint-disable */
import moment from 'moment';
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

const VM_TEMPLATE = {
  template: 'vm.cattle.io.template',
  version: 'vm.cattle.io.templateversion'
};
const IMAGE = 'vm.cattle.io.image';
const SSH = 'vm.cattle.io.keypair';

export default {
  name: 'EditVM',

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
      version: this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.version }),
      image: this.$store.dispatch('cluster/findAll', { type: IMAGE }),
      ssh: this.$store.dispatch('cluster/findAll', { type: SSH }),
      pvcs: this.$store.dispatch('cluster/findAll', { type: PVC })
    });

    this.templates = hash.template;
    this.versions = hash.version;
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
    let spec = this.value.spec;

    if ( !spec ) {
      spec = {
        // dataVolumeTemplates: [],
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
                  name: "containerdisk"
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
            hostname: 'vm-example',
            networks: [{
              name: "nic-0",
              pod: {}
            }],
            // dataVolume: [],
            volumes: [
              {
                containerDisk: {
                  image: "kubevirt/fedora-cloud-container-disk-demo:latest"
                },
                name: "containerdisk"
              },
              {
                cloudInitNoCloud: {
                  userData: "#cloud-config\npassword: fedora\nchpasswd: { expire: False }"
                },
                name: "cloudinitdisk"
              }
            ]
          }
        }
      };
      this.value.spec = spec;
    }
    
    const specMemory = this.value?.spec?.template?.spec?.domain?.resources?.requests?.memory.split(/(?=\D+)/);
    const cores = this.value?.spec?.template?.spec?.domain?.cpu?.cores || '';

    return {
      spec,
      source: '',
      sshName: '',
      publicKey: '',
      templateName: '',
      images: [],
      templates: [],
      ssh: [],
      versions: [],
      versionName: '',
      versionOption: [],
      imageName: '',
      sshKey: [],
      cores,
      description: '',
      name: '',
      memory: specMemory[0] || '',
      memoryUnit: specMemory[1] || 'G',
      namespace: 'default',
      cloudInit: '',
      sshErrors: [],
      // moment().format('YYYYMMDDHHMMSS')
    };
  },

  computed: {
    templateOption() {
      return this.templates.map( T => {
        return {
          label: T.metadata.name,
          value: T.metadata.name
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
    templateOption(neu) {
      const versionOption = this.versions.filter( V => {
        return V.spec.vmTemplateName === neu[0].value
      })
      .map( V => {
        return {
          label: V.metadata.name,
          value: V.metadata.name
        }
      })
      this.versionOption = versionOption;
    },
    memory(neu) {
      this.value.spec.template.spec.domain.resources.requests.memory = `${neu}${this.memoryUnit}`;
    },
    memoryUnit(neu) {
      this.value.spec.template.spec.domain.resources.requests.memory = `${this.memory}${neu}`;
    },
    cores(neu) {
      this.value.spec.template.spec.domain.cpu.cores = neu;
    },
  },

  methods: {
    saveVM(buttonCb) {
      const url = this.schema.linkFor('collection');
      this.$delete(this.value, 'type'); // vm yarm not type prop
      this.save(buttonCb, url);
    },

    updateImageName(neu) {
      this.imageName = neu;
      this.images.map( O => {
        if (O.spec.displayName === neu) {
          this.source = O.spec.url;
        }
      })
    },

    updateSSHKey(neu) {
      this.$set(this, 'sshKey', neu);
    }
  }
};
</script>

<template>
  <div>
    <h2>Use an existing VM Template and revision:</h2>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model="templateName"
          label="template"
          :options="templateOption"
        />
      </div>

      <div class="col span-6">
        <LabeledSelect
          v-model="versionName"
          label="version"
          :options="versionOption"
        />
      </div>
    </div>

    <ChooseImage :images="images" class="mb-20" @update:imageName="updateImageName" :imageName="imageName" />

    <h2>Choose a Size:</h2>
    <div class="row mb-20">
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

    <h2>Add disk storage:</h2>
    <DiskModal v-model='spec' />

    <h2>Networking:</h2>
    <NetworkModal v-model='spec.template.spec' />

    <h2>Authentication:</h2>
    
    <AddSSHKey :ssh='ssh' :sshKey="sshKey" @update:sshKey="updateSSHKey" />

    <h2>Cloud-init:</h2>
    <TextAreaAutoGrow class="mb-20" ref="value" v-model="cloudInit" :minHeight="160" />

    <h2>Finalize and create:</h2>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput v-model="value.metadata.name" label="Host Name" />
        <div class="tip mt-6">Give an identifying name you will remember them by. Your hostname name can only contain alphanumeric characters, dashes, and periods.</div>
      </div>

      <div class="col span-6">
        <LabeledSelect v-model="value.metadata.namespace" :options="namespaceOptions" label="Namespace" />
      </div>
    </div>

    <LabeledInput 
      type='multiline'
      v-model="value.metadata.description"
      label="Description"
      :mode="mode"
    />
    
    <Footer :mode="mode" :errors="errors" @save="saveVM" @done="done" />
  </div>
</template>

<style lang="scss" scoped>
.sshModal {
  padding: 20px;

  .footer {
    display: flex;
    justify-content: flex-end;
  }
}
.flex {
  display: flex;
}
.box {
  border: 1px solid var(--tabbed-container-bg);
  padding: 20px;
}
</style>
