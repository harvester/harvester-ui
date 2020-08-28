<script>
import _ from 'lodash';
import moment from 'moment';
import Footer from '@/components/form/Footer';
import Checkbox from '@/components/form/Checkbox';
import AddSSHKey from '@/components/form/AddSSHKey';
import DiskModal from '@/components/form/DiskModal';
import ChooseImage from '@/components/form/ChooseImage';
import LabeledInput from '@/components/form/LabeledInput';
import NetworkModal from '@/components/form/NetworkModal';
import LabeledSelect from '@/components/form/LabeledSelect';
import Collapse from '@/components/Collapse';
import TextAreaAutoGrow from '@/components/form/TextAreaAutoGrow';
import { VM_TEMPLATE } from '@/config/types';
import MemoryUnit from '@/components/form/MemoryUnit';

import CreateEditView from '@/mixins/create-edit-view';
import VM_MIXIN from '@/mixins/vm';

export default {
  name: 'EditVM',

  components: {
    Footer,
    Checkbox,
    Collapse,
    DiskModal,
    MemoryUnit,
    AddSSHKey,
    ChooseImage,
    NetworkModal,
    LabeledInput,
    LabeledSelect,
    TextAreaAutoGrow,
  },

  mixins: [CreateEditView, VM_MIXIN],

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
        dataVolumeTemplates: [],
        running:             true,
        template:            {
          spec: {
            domain: {
              cpu: {
                cores:   null,
                sockets: 1,
                threads: 1
              },
              devices: {
                interfaces:                 [],
                disks:                      [],
                networkInterfaceMultiqueue: true,
                rng:                        {}
              },
              resources: { requests: { memory: '' } }
            },
            hostname: '',
            networks: [],
            volumes:  []
          }
        }
      };
      this.value.spec = spec;
    }

    return {
      spec,
      templateName:    '',
      description:     '',
      namespace:       'default',
      isRunning:       true,
      useTemplate:     false,
      pageType:        'vm',
    };
  },

  computed: {
    templateOption() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.template);

      return choices.map( (T) => {
        return {
          label: T.id,
          value: T.spec.defaultVersionId
        };
      });
    },

    hostname: {
      get() {
        const prefix = this.imageName?.split(/[a-zA-Z][-|.]+/)[0];

        return this.spec.template.spec.hostname || `${ prefix }-${ moment().format('YYYY-MMDD-HHmm') }`;
      },
      set(neu) {
        this.$set(this.spec.template.spec, 'hostname', neu);
      }
    },
  },

  watch: {
    templateName(defaultVersion) {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.version);
      const id = defaultVersion.replace(':', '/');
      const templateSpec = choices.find( (V) => {
        return V.id === id;
      });

      this.$set(this, 'spec', templateSpec.spec.vm);
    }
  },

  created() {
    this.imageName = this.$route.query?.image || '';
  },

  methods: {
    saveVM(buttonCb) {
      if (!this.source) {
        this.errors = ['Please select image!'];
        buttonCb(true);

        return;
      }
      this.$set(this.value, 'type', 'kubevirt.io.virtualmachine');
      const url = 'v1/kubevirt.io.virtualmachines';

      this.$set(this.value.metadata, 'name', this.hostname);

      this.normalizeSpec();
      this.$delete(this.value, 'type');
      this.save(buttonCb, url);
    },
  },
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

    <div v-if="useTemplate" class="row mb-20">
      <div class="col span-6">
        <LabeledSelect v-model="templateName" label="template" :options="templateOption" />
      </div>
    </div>

    <div class="spacer"></div>

    <ChooseImage v-model="imageName" />

    <div class="spacer"></div>

    <h2>Choose a Size:</h2>
    <div class="row">
      <div class="col span-5">
        <LabeledInput v-model.number="spec.template.spec.domain.cpu.cores" v-int-number label="CPU (core)" required />
      </div>

      <div class="col span-7">
        <MemoryUnit v-model="memory" value-name="Memory (Gi)" :value-col="8" :unit-col="4" />
      </div>
    </div>

    <div class="spacer"></div>

    <h2>Add disk storage:</h2>
    <DiskModal v-model="diskRows" />

    <div class="spacer"></div>

    <h2>Networking:</h2>
    <NetworkModal v-model="networkRows" :namespace="value.metadata.namespace" />

    <div class="spacer"></div>

    <h2>Authentication:</h2>
    <AddSSHKey :ssh-key="sshKey" @update:sshKey="updateSSHKey" />

    <div class="spacer"></div>

    <Collapse :open.sync="showCloudInit" title="Cloud-init">
      <h2>Cloud-init:</h2>
      <TextAreaAutoGrow ref="value" v-model="cloudInit" :min-height="160" />
    </Collapse>

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
