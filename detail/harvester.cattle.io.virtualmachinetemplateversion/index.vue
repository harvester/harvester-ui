<script>
import Checkbox from '@/components/form/Checkbox';
import { VM_TEMPLATE } from '@/config/types';
import VM_MIXIN from '@/mixins/vm';
import CruResource from '@/components/CruResource';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import CreateEditView from '@/mixins/create-edit-view';
import NameNsDescription from '@/components/form/NameNsDescription';
import { _ADD } from '@/config/query-params';
import { defaultAsyncData } from '@/components/ResourceDetail';
import Volume from '@/edit/kubevirt.io.virtualmachine/volume';
import Network from '@/edit/kubevirt.io.virtualmachine/network';
import CpuMemory from '@/edit/kubevirt.io.virtualmachine/CpuMemory';
import CloudConfig from '@/edit/kubevirt.io.virtualmachine/CloudConfig';
import ImageSelect from '@/edit/kubevirt.io.virtualmachine/Image';
import SSHKey from '@/edit/kubevirt.io.virtualmachine/SSHKey';

export default {
  name: 'EditVMTEMPLATE',

  components: {
    Volume,
    Network,
    CruResource,
    CpuMemory,
    ImageSelect,
    SSHKey,
    Checkbox,
    Tabbed,
    Tab,
    CloudConfig,
    NameNsDescription,
  },

  mixins: [CreateEditView, VM_MIXIN],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  asyncData(ctx) {
    const parentOverride = { displayName: 'Template' };
    const resource = ctx.params.resource;

    return defaultAsyncData(ctx, resource, parentOverride);
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
    } else {
      spec = choices.find( O => templateSpec.defaultVersionId === O.id )?.spec?.vm || null;
    }

    if ( !spec ) {
      spec = {
        dataVolumeTemplates: [],
        template:            {
          metadata: {},
          spec:     {
            domain: {
              cpu: {
                cores:   null,
                sockets: 1,
                threads: 1
              },
              devices: {
                interfaces:                 [{
                  masquerade: {},
                  model:      'virtio',
                  name:       'default'
                }],
                disks: [],
              },
              resources: { requests: { memory: null } }
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
      defaultVersion:   null,
      isRunning:        true,
      useTemplate:      false,
      isDefaultVersion:  false,
      keyPairIds:       [],
      pageType:         'template'
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
          const name = `${ I.metadata.namespace }/${ I.metadata.name }`;

          out.push(name);
        }
      });
      this.keyPairIds = out;
    }
  },

  created() {
    this.registerAfterHook(() => {
      this.saveVersion();
    });
  },

  mounted() {
    const imageName = this.$route.query?.image || '';

    this.imageName = imageName;
  },

  methods: {
    async saveVMT(buttonCb) {
      const isPass = this.verifyBefSave(buttonCb);

      if (!isPass) {
        return;
      }

      if (this.isCreate) {
        delete this.value.metadata.namespace;
      }
      await this.save(buttonCb);

      this.normalizeSpec();
    },

    async saveVersion() {
      this.normalizeSpec();

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
            templateId: `harvester-system/${ this.value.metadata.name }`,
            keyPairIds: this.keyPairIds,
            vm:         { ...this.spec }
          }
        },
      });

      try {
        if (this.isDefaultVersion) {
          this.defaultVersionId = versionInfo.id;
          this.setVersion(this.defaultVersionId, () => {});
        }
      } catch (err) {
        const message = err.message;

        this.errors = [message];
      }
    },

    verifyBefSave(buttonCb) {
      if (!this.spec.template.spec.domain.cpu.cores) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Cpu' })];
        buttonCb(false);

        return false;
      }

      if (!this.memory.match(/[0-9]/)) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Memory' })];
        buttonCb(false);

        return false;
      }

      return true;
    },

    async setVersion(id, buttonCb) {
      this.value.spec.defaultVersionId = id;
      try {
        const data = [{
          op: 'replace', path: '/spec/defaultVersionId', value: id
        }];

        await this.value.patch( data, { url: this.value.linkFor('view') });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    },
    validateMax(value) {
      if (value > 100) {
        this.$set(this.spec.template.spec.domain.cpu, 'cores', 100);
      }
    },
    updateCpuMemory(cpu, memory) {
      this.$set(this.spec.template.spec.domain.cpu, 'cores', cpu);
      this.$set(this, 'memory', memory);
    },
    onTabChanged({ tab }) {
      if (tab.name === 'advanced' && this.$refs.yamlEditor?.refresh) {
        this.$refs.yamlEditor.refresh();
      }
    },
  },
};
</script>

<template>
  <div>
    <NameNsDescription
      v-if="!isView"
      v-model="value"
      :mode="mode"
      name-label="vmtemplate.nameNsDescription.name"
      :namespaced="false"
    />

    <Checkbox v-if="isAdd" v-model="isDefaultVersion" class="mb-20" label="Default version" type="checkbox" />

    <CruResource
      :done-route="doneRoute"
      :resource="value"
      :mode="mode"
      :errors="errors"
      @apply-hooks="applyHooks"
      @finish="saveVMT"
    >
      <Tabbed :side-tabs="true" @changed="onTabChanged">
        <Tab name="Basic" label="Basic">
          <CpuMemory :cpu="spec.template.spec.domain.cpu.cores" :memory="memory" @updateCpuMemory="updateCpuMemory" />

          <div class="mb-20">
            <ImageSelect v-model="imageName" :disk-rows="diskRows" :required="false" :disabled="!isCreate" />
          </div>

          <div class="mb-20">
            <SSHKey v-model="sshKey" @update:sshKey="updateSSHKey" />
          </div>
        </Tab>

        <Tab
          name="Volume"
          label="Volumes"
          :weight="-1"
        >
          <Volume v-model="diskRows" :mode="mode" />
        </Tab>

        <Tab
          name="Network"
          label="Networks"
          :weight="-2"
        >
          <Network v-model="networkRows" :mode="mode" />
        </Tab>

        <Tab
          name="advanced"
          label="Advanced Options"
          :weight="-3"
        >
          <CloudConfig ref="yamlEditor" :user-script="userScript" :network-script="networkScript" @updateCloudConfig="updateCloudConfig" />

          <div class="spacer"></div>
          <Checkbox v-model="isUseMouseEnhancement" class="check" type="checkbox" label="Enable USB Tablet" />
        </Tab>
      </Tabbed>
    </CruResource>

    <!-- <h2>CPU & Memory::</h2>
    <div class="row">
      <div class="col span-5">
        <LabeledInput
          v-model.number="spec.template.spec.domain.cpu.cores"
          v-int-number
          min="1"
          type="number"
          label="CPU Request(core)"
          required
          @input="validateMax"
        />
      </div>

      <div class="col span-7">
        <MemoryUnit v-model="memory" value-name="Memory" :value-col="8" :unit-col="4" />
      </div>
    </div>

    <div class="spacer"></div>

    <h2>Add disk storage:</h2>
    <DiskModal v-model="diskRows" owner="template" />

    <div class="spacer"></div>

    <h2>Networks:</h2>
    <NetworkModal v-model="networkRows" />

    <div class="spacer"></div>

    <h2>Authentication:</h2>
    <AddSSHKey :ssh-key="sshKey" @update:sshKey="updateSSHKey" />

    <div class="spacer"></div>

    <Collapse :open.sync="showCloudInit" title="Advanced Options">
      <CloudConfig @updateCloudConfig="updateCloudConfig" />
    </Collapse>

    <div class="spacer"></div>

    <Footer :mode="mode" :errors="errors" @save="saveVMT" @done="done" /> -->
  </div>
</template>
