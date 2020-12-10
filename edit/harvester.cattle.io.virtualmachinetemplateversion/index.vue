<script>
import Checkbox from '@/components/form/Checkbox';
import { VM_TEMPLATE } from '@/config/types';
import VM_MIXIN from '@/mixins/vm';
import randomstring from 'randomstring';
import { cleanForNew } from '@/plugins/steve/normalize';
import CruResource from '@/components/CruResource';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import { HARVESTER_SSH_NAMES, HARVESTER_TEMPLATE_VERSION_CUSTOM_NAME } from '@/config/labels-annotations';
import CreateEditView from '@/mixins/create-edit-view';
import { defaultAsyncData } from '@/components/ResourceDetail';
import Volume from '@/edit/kubevirt.io.virtualmachine/volume';
import LabeledInput from '@/components/form/LabeledInput';
import Network from '@/edit/kubevirt.io.virtualmachine/network';
import CpuMemory from '@/edit/kubevirt.io.virtualmachine/CpuMemory';
import CloudConfig from '@/edit/kubevirt.io.virtualmachine/CloudConfig';
import ImageSelect from '@/edit/kubevirt.io.virtualmachine/Image';
import SSHKey from '@/edit/kubevirt.io.virtualmachine/SSHKey';

export default {
  name: 'EditVMTemplate',

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
    LabeledInput,
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
    const choicesTemplate = this.$store.getters['cluster/all'](VM_TEMPLATE.template);
    const choicesVersion = this.$store.getters['cluster/all'](VM_TEMPLATE.version);
    const templateId = this.$route.query.templateId;
    const versionId = this.$route.query.versionId;
    let templateValue = choicesTemplate.find( V => V.id === templateId) || null;
    let templateSpec = templateValue?.spec;

    if (!templateValue) {
      templateSpec = {
        description:      '',
        defaultVersionId: ''
      };

      templateValue = {
        metadata: { name: '' },
        spec:     templateSpec,
        type:     VM_TEMPLATE.template
      };
    }

    if (versionId) {
      const versionValue = choicesVersion.find( V => V.id === versionId);

      this.$set(this.value, 'spec', versionValue.spec);
      this.$set(this.value.spec, 'vm', versionValue.spec.vm);
    }

    return {
      templateId,
      templateValue,
      templateSpec,
      templateName:     '',
      templates:        [],
      versionName:      '',
      versionOption:    [],
      description:      '',
      templateVersion:  [],
      defaultVersion:   null,
      useTemplate:      false,
      isDefaultVersion: false,
      keyPairIds:       [],
    };
  },

  computed: {
    isVersionEdit() {
      return Boolean(this.$route.query.templateId);
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
    this.registerBeforeHook(() => {
      if (!this.spec.template.metadata.annotations) {
        this.$set(this.spec.template.metadata, 'annotations', {});
      }
      Object.assign(this.spec.template.metadata.annotations, { [HARVESTER_SSH_NAMES]: JSON.stringify(this.sshKey) });
    });

    this.registerAfterHook(async() => {
      if (this.isDefaultVersion) { // Set the default version according to annotation:[HARVESTER_TEMPLATE_VERSION_CUSTOM_NAME]
        const choicesVersion = await this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.version, opt: { force: true } });

        const currentVersion = choicesVersion.find( V => V.getAnnotationValue(HARVESTER_TEMPLATE_VERSION_CUSTOM_NAME) === this.customName);

        if (currentVersion) {
          try {
            this.templateValue.defaultVersionId = currentVersion.id;
            const data = [{
              op: 'replace', path: '/spec/defaultVersionId', value: currentVersion.id
            }];

            const proxyResource = await this.$store.dispatch('cluster/create', this.templateValue);

            await proxyResource.patch( data, { url: proxyResource.linkFor('view') });
          } catch (err) {
            return Promise.reject(new Error(err.message));
          }
        }
      }
    });
  },

  mounted() {
    const imageName = this.$route.query?.image || '';

    this.imageName = imageName;
  },

  methods: {
    async saveVMT(buttonCb) {
      this.normalizeSpec();
      if (this.isCreate) { // namespace does not need
        delete this.value.metadata.namespace;
      }

      const proxyTemplate = await this.$store.dispatch('cluster/create', this.templateValue);
      const templates = await this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.template });
      const template = templates.find( O => O.metadata.name === proxyTemplate.metadata.name);

      if (!template) {
        if (proxyTemplate?.metadata?.name) {
          await proxyTemplate.save();
        } else {
          this.errors = ['"Name" is required'];
          buttonCb(false);

          return;
        }
      }

      cleanForNew(this.value);
      this.customName = randomstring.generate(10);
      this.$set(this.value.metadata, 'annotations', {
        ...this.value.metadata.annotations,
        [HARVESTER_TEMPLATE_VERSION_CUSTOM_NAME]: this.customName
      });

      const name = proxyTemplate.metadata.name || template.metadata.name;

      this.$set(this.value.spec, 'templateId', `harvester-system/${ name }`);
      this.$set(this.value.spec, 'keyPairIds', this.keyPairIds);
      this.$set(this.value.spec, 'vm', this.spec);
      await this.save(buttonCb);
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
  <div id="vm">
    <CruResource
      :done-route="doneRoute"
      :resource="value"
      :mode="mode"
      :errors="errors"
      @apply-hooks="applyHooks"
      @finish="saveVMT"
    >
      <div class="row mb-20">
        <div class="col span-6">
          <LabeledInput v-model="templateValue.metadata.name" :disabled="isVersionEdit" label="Template Name" required />
        </div>
        <div class="col span-6">
          <LabeledInput v-model="templateValue.spec.description" label="Description" />
        </div>
      </div>

      <Checkbox v-if="isVersionEdit" v-model="isDefaultVersion" class="mb-20" label="Default version" type="checkbox" />
      <Tabbed :side-tabs="true" @changed="onTabChanged">
        <Tab name="Basics" :label="t('vm.detail.tabs.basics')">
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
  </div>
</template>
