<script>
import moment from 'moment';
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
import VM_MIXIN from '@/mixins/vm';

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

  mixins: [CreateEditView, VM_MIXIN],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    let templateSpec = this.value.spec;

    if (!templateSpec) {
      templateSpec = {
        description:      '',
        defaultVersionId: ''
      };
      this.value.spec = templateSpec;
    }

    let spec = null;

    if ( !spec ) {
      spec = {
        dataVolumeTemplates: [],
        template:            {
          spec: {
            domain: {
              cpu: {
                cores:   1,
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
              resources: { requests: { memory: '1Gi' } }
            },
            networks: [{
              name: 'nic-0',
              pod:  {}
            }],
            volumes: []
          }
        }
      };
    }

    return {
      spec,
      templateName:     '',
      templates:        [],
      versionName:      '',
      versionOption:    [],
      description:      '',
      templateVersion:  [],
      namespace:        'default',
      isRunning:        true,
      useTemplate:      false,
      isDefaultVersion:  true
    };
  },

  computed: {
    templateOption() {
      return this.templates.map( (T) => {
        return {
          label: T.id,
          value: T.id
        };
      });
    },
  },

  watch: {
    templateName(id) {
      const templateSpec = this.templateVersion.find( (V) => {
        return V.spec.templateId;
      });

      // this.imageName = 'new2' || templateSpec.spec.imageId.split(':')[1];
    },
  },
  // moment().format('YYYYMMDDHHMMSS')

  created() {
    const imageName = this.$route.query?.image || '';

    this.imageName = imageName;
  },

  methods: {
    async saveVMT(buttonCb) {
      await this.save(buttonCb);

      this.normalizeSpec();
      const versionInfo = await this.$store.dispatch('management/request', {
        method:  this.mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'content-type': 'application/json',
          accept:         'application/json',
        },
        url:  this.mode === 'edit' ? `v1/vm.cattle.io.templateversions/${ this.value.metadata.namespace }:${ this.value.metadata.name }` : `v1/vm.cattle.io.templateversions`,
        data: {
          apiVersion: 'vm.cattle.io/v1alpha1',
          kind:       'vm.cattle.io.templateversion',
          type:       'vm.cattle.io.templateversion',
          metadata:   { namespace: this.value.metadata.namespace },
          spec:       {
            templateId: `${ this.value.metadata.namespace }:${ this.value.metadata.name }`,
            vm:         { ...this.spec }
          }
        },
      });

      if (this.isDefaultVersion) {
        await this.setVersion(versionInfo.id);
      }
    },

    async setVersion(id) {
      delete this.value._type;
      await this.$store.dispatch('management/request', {
        method:  'put',
        headers: {
          'content-type': 'application/json',
          accept:         'application/json',
        },
        url:  `v1/vm.cattle.io.templates/default/${ this.value.metadata.name }`,
        data: {
          ...this.value,
          spec: {
            ...this.value.spec,
            defaultVersionId: `${ id.replace('/', ':') }`
          }
        }
      });
    }
  },
};
</script>

<template>
  <div id="vm">
    <div class="row">
      <div class="col span-6">
        <LabeledInput v-model="value.metadata.name" label="Template Name" required />
      </div>

      <div class="col span-6">
        <LabeledInput v-model="value.spec.description" label="Description" />
      </div>
    </div>
    <div class="min-spacer"></div>

    <Checkbox v-model="isDefaultVersion" label="Default Revison" type="checkbox" />
    <div class="spacer"></div>

    <ChooseImage v-model="imageName" />

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
