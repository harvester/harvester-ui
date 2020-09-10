<script>
import _ from 'lodash';
import Footer from '@/components/form/Footer';
import Collapse from '@/components/Collapse';
import Checkbox from '@/components/form/Checkbox';
import AddSSHKey from '@/components/form/AddSSHKey';
import DiskModal from '@/components/form/DiskModal';
import LabeledInput from '@/components/form/LabeledInput';
import NetworkModal from '@/components/form/NetworkModal';
import TextAreaAutoGrow from '@/components/form/TextAreaAutoGrow';
import MemoryUnit from '@/components/form/MemoryUnit';
import { VM_TEMPLATE } from '@/config/types';
import { allHash } from '@/utils/promise';
import VM_MIXIN from '@/mixins/vm';
import CreateEditView from '@/mixins/create-edit-view';
import { _EDIT, _CREATE, _ADD } from '@/config/query-params';
import ChooseImage from '../kubevirt.io.virtualmachine/ChooseImage';

export default {
  name: 'EditVMTEMPLATE',

  components: {
    Footer,
    Checkbox,
    Collapse,
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
                interfaces:                 [{
                  bridge: {},
                  model:      'virtio',
                  name:       'default'
                }],
                disks: [],
              },
              resources: { requests: { memory: '' } }
            },
            networks: [{
              name: 'default',
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
      chooseDefault:    false,
      defaultVersion:   null,
      isRunning:        true,
      useTemplate:      false,
      isDefaultVersion:  false,
      keyPairIds:       [],
    };
  },

  computed: {
    isAdd() {
      return this.$route.query.type === _ADD;
    },
    allTemplate() {
      return this.$store.getters['cluster/all'](VM_TEMPLATE.template);
    },
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
    },
    allTemplate: {
      handler(all) {
        if (this.chooseDefault) {
          all.map( (O) => {
            if (O.metadata.name === this.value?.metadata?.name) {
              this.$set(this.value, 'metadata', O.metadata);
              this.setVersion(this.defaultVersionId, () => {});
              this.chooseDefault = false;
            }
          });
        }
      },
      deep: true
    }
  },

  mounted() {
    const imageName = this.$route.query?.image || '';

    this.imageName = imageName;
  },

  methods: {
    async saveVMT(buttonCb) {
      if (!this.isAdd) {
        delete this.value.metadata.namespace;
        await this.save(buttonCb);
      }

      this.normalizeSpec();

      try {
        const versionInfo = await this.$store.dispatch('management/request', {
          method:  'POST',
          headers: {
            'content-type': 'application/json',
            accept:         'application/json',
          },
          url:  `v1/harvester.cattle.io.virtualmachinetemplateversions`,
          data: {
            apiVersion: 'harvester.cattle.io/v1alpha1',
            kind:       'harvester.cattle.io.virtualmachinetemplateversion',
            type:       'harvester.cattle.io.virtualmachinetemplateversion',
            spec:       {
              templateId: `harvester-system:${ this.value.metadata.name }`,
              keyPairIds: this.keyPairIds,
              vm:         { ...this.spec }
            }
          },
        });

        if (this.isDefaultVersion) {
          const defaultVersionId = versionInfo.id.replace('/', ':');

          this.defaultVersionId = defaultVersionId;
          this.chooseDefault = true;
        } else {
          buttonCb(true);
          this.done();
        }
      } catch (err) {
        const message = err.message;

        this.errors = [message];
      }
    },

    async setVersion(id, buttonCb) {
      delete this.value._type;

      const url = `v1/harvester.cattle.io.virtualmachinetemplates/default/${ this.value.metadata.name }`;

      this.value.spec.defaultVersionId = id.replace('/', ':');
      try {
        await this.value.save(buttonCb, url);
        buttonCb(true);
        this.done();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    }
  },
};
</script>

<template>
  <el-card class="box-card">
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

      <Checkbox v-if="isAdd" v-model="isDefaultVersion" label="Default version" type="checkbox" />
      <div class="spacer"></div>

      <ChooseImage v-model="imageName" />

      <div class="spacer"></div>

      <h2>CPU & Memory::</h2>
      <div class="row">
        <div class="col span-5">
          <LabeledInput v-model.number="spec.template.spec.domain.cpu.cores" v-int-number type="number" label="CPU Request(core)" required />
        </div>

        <div class="col span-7">
          <MemoryUnit v-model="memory" value-name="Memory" :value-col="8" :unit-col="4" />
        </div>
      </div>

      <div class="spacer"></div>

      <h2>Add disk storage:</h2>
      <DiskModal v-model="diskRows" />

      <div class="spacer"></div>

      <h2>Networks:</h2>
      <NetworkModal v-model="networkRows" />

      <div class="spacer"></div>

      <h2>Authentication:</h2>
      <AddSSHKey :ssh-key="sshKey" @update:sshKey="updateSSHKey" />

      <div class="spacer"></div>

      <Collapse :open.sync="showCloudInit" title="Advanced Options">
        <h3>Startup Script:</h3>
        <TextAreaAutoGrow ref="value" v-model="startScript" :min-height="160" />
      </Collapse>

      <div class="spacer"></div>

      <Footer :mode="mode" :errors="errors" @save="saveVMT" @done="done" />
    </div>
  </el-card>
</template>
