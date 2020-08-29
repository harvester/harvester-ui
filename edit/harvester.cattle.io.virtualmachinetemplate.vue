<script>
import Footer from '@/components/form/Footer';
import Checkbox from '@/components/form/Checkbox';
import AddSSHKey from '@/components/form/AddSSHKey';
import DiskModal from '@/components/form/DiskModal';
import ChooseImage from '@/components/form/ChooseImage';
import LabeledInput from '@/components/form/LabeledInput';
import NetworkModal from '@/components/form/NetworkModal';
import TextAreaAutoGrow from '@/components/form/TextAreaAutoGrow';
import MemoryUnit from '@/components/form/MemoryUnit';
import { VM_TEMPLATE } from '@/config/types';

import VM_MIXIN from '@/mixins/vm';
import CreateEditView from '@/mixins/create-edit-view';
import { _EDIT, _CREATE, _ADD } from '@/config/query-params';

export default {
  name: 'EditVMTEMPLATE',

  components: {
    Footer,
    Checkbox,
    LabeledInput,
    MemoryUnit,
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
    const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.version);

    let spec = null;
    let defaultVersion = null;

    if (this.mode === _EDIT) {
      defaultVersion = choices.find( (O) => {
        return this.value.spec.defaultVersionId.replace(':', '/') === O.id;
      });

      spec = defaultVersion?.spec?.vm;
    }

    if (!templateSpec) {
      templateSpec = {
        description:      '',
        defaultVersionId: ''
      };
      this.$set(this.value, 'spec', templateSpec);
    }

    if ( !spec ) {
      spec = {
        dataVolumeTemplates: [],
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
              },
              resources: { requests: { memory: '' } }
            },
            networks: [],
            volumes:  []
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
      defaultVersion,
      isRunning:        true,
      useTemplate:      false,
      isDefaultVersion:  false,
      keyPairIds:       []
    };
  },

  computed: {
    isAdd() {
      return this.$route.query.type === _ADD;
    }
  },

  watch: {
    sshKey(neu) {
      const out = [];

      this.ssh.map( (I) => {
        if (neu.includes(I.metadata.name)) {
          const name = `${ I.metadata.namespace }:${ I.metadata.name }`;

          out.push(name);
        }
      });
      this.keyPairIds = out;
    }
  },

  created() {
    const imageName = this.$route.query?.image || '';

    this.imageName = imageName;
  },

  methods: {
    async saveVMT(buttonCb) {
      if (!this.isAdd) {
        await this.save(buttonCb);
      } else {
        buttonCb(true);
        this.done();
      }

      this.normalizeSpec();
      const versionInfo = await this.$store.dispatch('management/request', {
        method:  'POST',
        headers: {
          'content-type': 'application/json',
          accept:         'application/json',
        },
        url:  (this.mode === 'edit' && !this.isAdd) ? `v1/harvester.cattle.io.virtualmachinetemplateversions/${ this.value.metadata.namespace }/${ this.value.metadata.name }` : `v1/harvester.cattle.io.virtualmachinetemplateversions`,
        data: (this.mode === 'edit' && !this.isAdd) ? {
          ...this.defaultVersion,
          spec: { ...this.spec }
        } : {
          apiVersion: 'harvester.cattle.io/v1alpha1',
          kind:       'harvester.cattle.io.virtualmachinetemplateversion',
          type:       'harvester.cattle.io.virtualmachinetemplateversion',
          metadata:   { namespace: this.value.metadata.namespace },
          spec:       {
            templateId: `${ this.value.metadata.namespace }:${ this.value.metadata.name }`,
            keyPairIds: this.keyPairIds,
            vm:         { ...this.spec }
          }
        },
      });
    },

    async setVersion(id) {
      delete this.value._type;

      const url = `v1/harvester.cattle.io.virtualmachinetemplates/default/${ this.value.metadata.name }`;

      await this.$store.dispatch('management/request', {
        method:  'PUT',
        headers: {
          'content-type': 'application/json',
          accept:         'application/json',
        },
        url,
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
        <LabeledInput v-model="value.metadata.name" :disabled="isAdd" label="Template Name" required />
      </div>

      <div class="col span-6">
        <LabeledInput v-model="value.spec.description" :disabled="isAdd" label="Description" />
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
        <LabeledInput v-model.number="spec.template.spec.domain.cpu.cores" v-int-number label="CPU Request(core)" required />
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
    <NetworkModal v-model="networkRows" />

    <div class="spacer"></div>

    <h2>Authentication:</h2>
    <AddSSHKey :ssh-key="sshKey" @update:sshKey="updateSSHKey" />

    <div class="spacer"></div>

    <h2>Cloud-init:</h2>
    <TextAreaAutoGrow ref="value" v-model="cloudInit" :min-height="160" />

    <div class="spacer"></div>

    <Footer :mode="mode" :errors="errors" @save="saveVMT" @done="done" />
  </div>
</template>
