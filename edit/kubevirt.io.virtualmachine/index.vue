<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import { safeLoad } from 'js-yaml';
import { cleanForNew } from '@/plugins/steve/normalize';
import { defaultAsyncData } from '@/components/ResourceDetail';
import Footer from '@/components/form/Footer';
import Collapse from '@/components/Collapse';
import RadioGroup from '@/components/form/RadioGroup';
import Checkbox from '@/components/form/Checkbox';
import AddSSHKey from '@/components/form/AddSSHKey';
import DiskModal from '@/components/form/DiskModal';
import LabeledInput from '@/components/form/LabeledInput';
import NetworkModal from '@/components/form/NetworkModal';
import LabeledSelect from '@/components/form/LabeledSelect';
import { VM_TEMPLATE, VM, IMAGE } from '@/config/types';
import MemoryUnit from '@/components/form/MemoryUnit';
import { HARVESTER_CREATOR, HAVERSTER_SSH_NAMES } from '@/config/labels-annotations';
import CreateEditView from '@/mixins/create-edit-view';
import VM_MIXIN from '@/mixins/vm';
import NameDescriptionCount from './NameDescriptionCount';
import CloudConfig from './CloudConfig';
import ChooseImage from './ChooseImage';

const baseSpec = {
  dataVolumeTemplates: [],
  running:             true,
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
          inputs: [{
            bus:  'usb',
            name: 'tablet',
            type: 'tablet'
          }],
          interfaces: [{
            masquerade: {},
            model:      'virtio',
            name:       'default'
          }],
          disks: [],
        },
        resources: { requests: { memory: '' } }
      },
      hostname: '',
      networks: [{
        name: 'default',
        pod:  {}
      }],
      volumes: []
    }
  }
};

export default {
  name: 'EditVM',

  components: {
    Footer,
    Checkbox,
    Collapse,
    DiskModal,
    MemoryUnit,
    RadioGroup,
    AddSSHKey,
    ChooseImage,
    CloudConfig,
    NetworkModal,
    NameDescriptionCount,
    LabeledInput,
    LabeledSelect,
  },

  mixins: [CreateEditView, VM_MIXIN],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  asyncData(ctx) {
    const resource = ctx.params.resource;

    return defaultAsyncData(ctx, resource, { displayName: 'Virtual Machine' });
  },

  data() {
    let spec = this.value.spec;

    if ( !spec ) {
      spec = _.cloneDeep(baseSpec);
      this.value.spec = spec;
    }

    return {
      baseSpec,
      isSingle:              true,
      count:                 1,
      realHostname:          '',
      spec,
      templateName:          '',
      templateVersion:       '',
      namespace:             'default',
      isRunning:             true,
      useTemplate:           false,
      pageType:              'vm',
      isLanuchFromTemplate:     false,
      isUseMouseEnhancement:    true
    };
  },

  computed: {
    templateOption() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.template);

      return choices.map( (T) => {
        return {
          label: T.metadata.name,
          value: T.id
        };
      });
    },

    curTemplateResource() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.template);

      return choices.find( O => O.id === this.templateName);
    },

    curVersionResource() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.version);

      return choices.find( O => O.id === this.templateVersion);
    },

    versionOption() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.version);
      const templateId = this.templateName;
      const defaultVersionNumber = this.curTemplateResource?.defaultVersionNumber;

      return choices.filter( O => O.spec.templateId === templateId).map( (T) => {
        const version = T?.status?.version; // versionNumber
        const label = defaultVersionNumber === version ? `${ version } (default)` : version; // ns:name
        const value = T.id;

        return {
          label,
          value
        };
      });
    },

    hostname: {
      get() {
        return this.spec.template.spec.hostname;
      },
      set(neu) {
        try {
          this.useCustomHostname = false;
          if (neu || neu.length > 0) {
            this.useCustomHostname = true;
            const oldCloudConfig = safeLoad(this.getCloudInit());

            oldCloudConfig.hostname = neu;

            this.$set(this.spec.template.spec, 'hostname', neu);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('---watch hostname has error');
        }
      }
    },

    nameLabel() {
      return this.isSingle ? 'Name' : 'Prefix Name';
    },

    hostnameLabel() {
      return this.isSingle ? 'Host Name' : 'Host Prefix Name';
    },

    ...mapGetters({ t: 'i18n/t' })
  },

  watch: {
    async templateVersion(version) {
      const choices = await this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.version });

      const id = version;
      const templateSpec = choices.find( (V) => {
        return V.id === id;
      });
      const sshKey = [];

      if (templateSpec.spec?.keyPairIds?.length > 0) {
        templateSpec.spec.keyPairIds.map( (O) => {
          const ssh = O.split('/')[1];

          sshKey.push(ssh);
        });
      }

      const cloudScript = templateSpec?.spec?.vm?.template?.spec?.volumes?.find( (V) => {
        return V.cloudInitNoCloud !== undefined;
      })?.cloudInitNoCloud;

      this.$set(this, 'userScript', cloudScript?.userData);
      this.$set(this, 'networkScript', cloudScript?.networkData);
      this.$set(this, 'sshKey', sshKey);
      this.$refs.ssh.updateSSH(sshKey);
      this.$set(this, 'spec', templateSpec.spec.vm);
    },

    async templateName(id) {
      const choices = await this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.template });
      const template = choices.find( O => O.id === id);

      if (template.spec.defaultVersionId && !this.isLanuchFromTemplate) {
        this.templateVersion = template.spec.defaultVersionId;
      }

      this.isLanuchFromTemplate = false;
    },
    useTemplate(neu) {
      if (neu === false) {
        const spec = _.cloneDeep(this.baseSpec);

        this.$set(this, 'spec', spec);
        this.$set(this.value, 'spec', spec);
        this.templateName = '';
        this.templateVersion = '';
      }
    },
    isUseMouseEnhancement(neu) {
      if (neu) {
        Object.assign(this.spec.template.spec.domain.devices, {
          inputs: [{
            bus:  'usb',
            name: 'tablet',
            type: 'tablet'
          }]
        });
      } else {
        this.$delete(this.spec.template.spec.domain.devices, 'inputs');
      }
    }
  },

  created() {
    this.imageName = this.$route.query?.image || '';
    this.registerAfterHook(() => { // when fetch end, need add type to find correct schema
      this.$set(this.value, 'type', VM);

      if (!this.isSingle) {
        this.getClone();
      }
    });

    this.registerBeforeHook(() => {
      Object.assign(this.value.metadata.labels, { [HARVESTER_CREATOR]: 'harvester' });
      Object.assign(this.value.spec.template.metadata.annotations, { [HAVERSTER_SSH_NAMES]: JSON.stringify(this.sshKey) });

      return this.validateBefore();
    }, 'validate');

    this.registerFailureHook(() => {
      this.$set(this.value, 'type', VM);
    });
  },

  mounted() {
    this.getImages();
    if (this.$route.query?.templateId) {
      this.templateName = this.$route.query?.templateId;
      this.templateVersion = this.$route.query?.version;
      this.isLanuchFromTemplate = true;
      this.useTemplate = true;
    }
  },

  methods: {
    saveVM(buttonCb) {
      const url = `v1/${ VM }s`;

      this.normalizeSpec();
      const realHostname = this.useCustomHostname ? this.value.spec.template.spec.hostname : this.value.metadata.name;

      this.$set(this.value.spec.template.spec, 'hostname', realHostname);
      const noFetch = !this.isSingle;

      this.save(buttonCb, url, noFetch);
    },

    validateBefore(buttonCb) {
      if (!this.imageName) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Image' })];

        return false;
      }

      if (!this.spec.template.spec.domain.cpu.cores) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Cpu' })];

        return false;
      }

      if (!this.memory.match(/[0-9]/)) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Memory' })];

        return false;
      }
      this.$delete(this.value, 'type'); // vm api don't type attribuet, the error will be reported

      return true;
    },

    getImages() {
      this.$store.dispatch('cluster/findAll', { type: IMAGE });
    },

    async getClone() {
      const baseName = this.value.metadata.name;
      const baseHostname = this.useCustomHostname ? this.value.spec.template.spec.hostname : this.value.metadata.name;
      const join = baseName.endsWith('-') ? '' : '-';
      const countLength = this.count.toString().length;

      for (let i = 1; i <= this.count; i++) {
        const suffix = i?.toString()?.padStart(countLength, '0');

        cleanForNew(this.value);

        this.value.metadata.name = `${ baseName }${ join }${ suffix }`;
        const hostname = `${ baseHostname }${ join }${ suffix }`;

        this.normalizeSpec();
        this.$set(this.value.spec.template.spec, 'hostname', hostname);
        this.$delete(this.value, 'type');
        await this.value.save({ url: `v1/${ VM }s` });
      }
      this.value.id = '';
    },
    validateMax(value) {
      if (value > 100) {
        this.$set(this.spec.template.spec.domain.cpu, 'cores', 100);
      }
    },
    validataCount(count) {
      if (count > 10) {
        this.$set(this, 'count', 10);
      }
    }
  },
};
</script>

<template>
  <div id="vm">
    <div class="row mb-20">
      <div class="col span-12">
        <RadioGroup
          v-model="isSingle"
          name="model"
          :options="[true,false]"
          :labels="['Single Instance', 'Multiple Instance']"
          :mode="mode"
        />
      </div>
    </div>
    <NameDescriptionCount
      v-model="value"
      :mode="mode"
      :has-extra="!isSingle"
      :name-label="nameLabel"
      :namespaced="false"
      :extra-columns="['type']"
    >
      <template v-slot:type>
        <LabeledInput
          v-if="!isSingle"
          v-model.number="count"
          v-int-number
          type="number"
          min="1"
          label="count"
          required
          @input="validataCount"
        />
      </template>
    </NameDescriptionCount>

    <div class="min-spacer"></div>
    <Checkbox v-model="useTemplate" class="check" type="checkbox" label="Use VM Template:" />

    <div v-if="useTemplate" class="row mb-20">
      <div class="col span-6">
        <LabeledSelect v-model="templateName" label="template" :options="templateOption" />
      </div>

      <div class="col span-6">
        <LabeledSelect v-model="templateVersion" label="version" :options="versionOption" />
      </div>
    </div>

    <div class="spacer"></div>

    <ChooseImage v-model="imageName" />

    <div class="spacer"></div>

    <h2>CPU & Memory:</h2>
    <div class="row">
      <div class="col span-6">
        <LabeledInput
          v-model.number="spec.template.spec.domain.cpu.cores"
          v-int-number
          min="1"
          type="number"
          label="CPU (core)"
          required
          @input="validateMax"
        />
      </div>

      <div class="col span-6">
        <MemoryUnit v-model="memory" value-name="Memory" :value-col="8" :unit-col="4" />
      </div>
    </div>

    <div class="spacer"></div>

    <h2>Disks:</h2>
    <DiskModal v-model="diskRows" class="vm__disk-modal" :namespace="value.metadata.namespace" />

    <div class="spacer"></div>

    <h2>Networks:</h2>
    <NetworkModal v-model="networkRows" :namespace="value.metadata.namespace" />

    <div class="spacer"></div>

    <h2>Authentication:</h2>
    <AddSSHKey ref="ssh" :ssh-key="sshKey" @update:sshKey="updateSSHKey" />

    <div class="spacer"></div>

    <Collapse :open.sync="showCloudInit" title="Advanced Details">
      <LabeledInput v-model="hostname" class="labeled-input--tooltip mb-20" required placeholder="default to the virtual machine name.">
        <template #label>
          <label class="has-tooltip" :style="{'color':'var(--input-label)'}">
            {{ hostnameLabel }}
            <i v-tooltip="'Give an identifying name you will remember them by. Your hostname name can only contain alphanumeric characters, dashes.'" class="icon icon-info" style="font-size: 14px" />
          </label>
        </template>
      </LabeledInput>

      <CloudConfig :user-script="userScript" :network-script="networkScript" @updateCloudConfig="updateCloudConfig" />

      <div class="spacer"></div>
      <Checkbox v-model="isUseMouseEnhancement" class="check" type="checkbox" label="Enable USB Tablet" />
    </Collapse>

    <div class="spacer"></div>
    <Checkbox v-model="isRunning" class="check" type="checkbox" label="Start virtual machine on creation" />
    <Footer :mode="mode" :errors="errors" @save="saveVM" @done="done" />
  </div>
</template>

<style lang="scss">
#vm {
  .radio-group {
    display: flex;

    .radio-container {
      margin-right: 30px;
    }
  }

  .tip {
    color: #8e8e92;
  }

  .label {
    color: var(--input-label);
  }

  .sortable-table {
    border: 1px solid var(--input-border);
    border-radius: calc(3 * var(--border-radius));

    thead tr {
      background-color: rgb(247, 251, 252);
      height: 60px;

      th {
        padding-left: 20px;

        &:first-child {
          border-top-left-radius: calc(3 * var(--border-radius));
        }

        &:last-child {
          border-top-right-radius: calc(3 * var(--border-radius));
        }

        span {
          color: rgb(134, 196, 211);
        }
      }
    }

    tbody tr {
      td {
        height: 60px;
        padding-left: 20px;
        color: var(--help-text);

        &:last-child {
          padding-left: 0;
        }
      }
    }
  }
}
</style>
