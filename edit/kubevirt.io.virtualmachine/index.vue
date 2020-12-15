<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import { safeLoad } from 'js-yaml';
import Banner from '@/components/Banner';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import Checkbox from '@/components/form/Checkbox';
import CruResource from '@/components/CruResource';
import RadioGroup from '@/components/form/RadioGroup';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import NameNsDescription from '@/components/form/NameNsDescription';

import SSHKey from '@/edit/kubevirt.io.virtualmachine/SSHKey';
import Volume from '@/edit/kubevirt.io.virtualmachine/volume';
import Network from '@/edit/kubevirt.io.virtualmachine/network';
import ImageSelect from '@/edit/kubevirt.io.virtualmachine/Image';
import CpuMemory from '@/edit/kubevirt.io.virtualmachine/CpuMemory';
import CloudConfig from '@/edit/kubevirt.io.virtualmachine/CloudConfig';

import VM_MIXIN from '@/mixins/vm';
import CreateEditView from '@/mixins/create-edit-view';
import { cleanForNew } from '@/plugins/steve/normalize';
import { VM_TEMPLATE, VM, IMAGE } from '@/config/types';
import { HARVESTER_CREATOR, HARVESTER_SSH_NAMES, HARVESTER_DISK_NAMES, HARVESTER_NETWORK_IPS } from '@/config/labels-annotations';

export default {
  name: 'EditVM',

  components: {
    Tab,
    Tabbed,
    Banner,
    Checkbox,
    RadioGroup,
    CruResource,
    LabeledInput,
    LabeledSelect,
    NameNsDescription,
    Volume,
    SSHKey,
    Network,
    CpuMemory,
    ImageSelect,
    CloudConfig,
  },

  mixins: [CreateEditView, VM_MIXIN],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    return {
      count:                 1,
      realHostname:          '',
      templateName:          '',
      templateVersion:       '',
      namespace:             'default',
      isSingle:              true,
      isRunning:             true,
      useTemplate:           false,
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
      const defaultVersionNumber = this.curTemplateResource?.defaultVersionNumber;

      return choices.filter( O => O.spec.templateId === this.templateName).map( (T) => {
        const version = T?.status?.version; // versionNumber
        const label = defaultVersionNumber === version ? `${ version } (default)` : version;
        const value = T.id;

        return { label, value };
      });
    },

    hostname: {
      get() {
        return this.spec?.template?.spec?.hostname;
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
      return this.isSingle ? 'vm.nameNsDescription.name.singleLabel' : 'vm.nameNsDescription.name.multipleLabel';
    },

    hostnameLabel() {
      return this.isSingle ? this.t('harvester.vmPage.hostName.label') : this.t('harvester.vmPage.hostPrefixName.label');
    },

    ...mapGetters({ t: 'i18n/t' })
  },

  watch: {
    async templateVersion(id) {
      if (!id) {
        return;
      }

      const choices = await this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.version });
      const templateSpec = choices.find( V => V.id === id);
      const sshKey = [];

      if (templateSpec?.spec?.keyPairIds?.length > 0) { // TODO: ssh should use namespace:name
        templateSpec.spec.keyPairIds.map( (O) => {
          const ssh = O.split('/')[1];

          sshKey.push(ssh);
        });
      }

      const cloudScript = templateSpec?.spec?.vm?.template?.spec?.volumes?.find( (V) => {
        return V.cloudInitNoCloud !== undefined;
      })?.cloudInitNoCloud; // TODO: use modals

      this.$set(this, 'userScript', cloudScript?.userData);
      this.$set(this, 'networkScript', cloudScript?.networkData);
      this.$set(this, 'sshKey', sshKey);
      // this.$refs.ssh.updateSSH(sshKey);
      this.changeSpec(templateSpec?.spec?.vm);
    },

    async templateName(id) {
      if (!id) {
        return;
      }

      const choices = await this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.template });
      const template = choices.find( O => O.id === id);

      this.templateVersion = template.defaultVersionId;
    },

    useTemplate(neu) {
      if (neu === false) {
        const spec = _.cloneDeep(this.baseSpec);

        this.changeSpec(spec);
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
    this.imageName = this.$route.query?.image || this.imageName;

    this.registerBeforeHook(() => {
      Object.assign(this.value.metadata.labels, {
        ...this.value.metadata.labels,
        [HARVESTER_CREATOR]: 'harvester',
      });

      Object.assign(this.value.spec.template.metadata.annotations, {
        ...this.value.spec.template.metadata.annotations,
        [HARVESTER_SSH_NAMES]: JSON.stringify(this.sshKey)
      });

      Object.assign(this.value.metadata.annotations, {
        ...this.value.metadata.annotations,
        [HARVESTER_NETWORK_IPS]: JSON.stringify(this.value.networkIps)
      });

      this.$set(this.value.metadata, 'namespace', 'default'); // TODO: set default namespace
    });

    this.registerFailureHook(() => {
      this.$set(this.value, 'type', VM);
    });

    this.registerAfterHook(() => {
      if ( this.mode === 'edit' && this.value?.hasAction('restart')) {
        this.value.doAction('restart', {});
      }
    });
  },

  mounted() {
    this.getImages();
    const templateName = this.$route.query?.templateId;
    const templateVersion = this.$route.query?.version;

    if (templateName && templateVersion) {
      this.templateName = templateName;
      this.templateVersion = templateVersion;
      this.useTemplate = true;
    }
  },

  methods: {
    saveVM(buttonCb) {
      if (this.isSingle) {
        this.saveSingle(buttonCb);
      } else {
        this.saveMultiple(buttonCb);
      }
    },

    async saveSingle(buttonCb) {
      const url = `v1/${ VM }s`;

      this.normalizeSpec();
      const realHostname = this.useCustomHostname ? this.value.spec.template.spec.hostname : this.value.metadata.name;

      this.$set(this.value.spec.template.spec, 'hostname', realHostname);
      await this.save(buttonCb, url);
    },

    async saveMultiple(buttonCb) {
      const baseName = this.value.metadata.name || '';
      const baseHostname = this.useCustomHostname ? this.value.spec.template.spec.hostname : this.value.metadata.name;
      const join = baseName.endsWith('-') ? '' : '-';
      const countLength = this.count.toString().length;

      //  Object.assign(spec.template.metadata.annotations, { [HARVESTER_DISK_NAMES]: JSON.stringify(diskNameLables) });

      if (this.count < 1 || this.count === undefined) {
        this.errors = ['"Count" should be between 1 and 10'];
        buttonCb(false);

        return;
      }

      for (let i = 1; i <= this.count; i++) {
        this.$set(this.value, 'type', VM);

        const suffix = i?.toString()?.padStart(countLength, '0');

        cleanForNew(this.value);
        this.value.metadata.name = `${ baseName }${ join }${ suffix }`;
        const hostname = `${ baseHostname }${ join }${ suffix }`;

        this.normalizeSpec();
        this.$set(this.value.spec.template.spec, 'hostname', hostname);
        this.$delete(this.value.spec.template.metadata.annotations, [HARVESTER_DISK_NAMES]);

        try {
          await this.save(buttonCb);
        } catch (err) {
          return Promise.reject(new Error(err));
        }
      }
      this.value.id = '';
    },

    changeSpec(spec) {
      const diskRows = this.getDiskRows(spec);
      const networkRows = this.getNetworkRows(spec);
      const imageName = this.getRootImage(spec);

      this.$set(this.value, 'spec', spec);
      this.$set(this, 'spec', spec);
      this.$set(this, 'diskRows', diskRows);
      this.$set(this, 'networkRows', networkRows);
      this.$set(this, 'imageName', imageName);
    },

    getImages() {
      this.$store.dispatch('cluster/findAll', { type: IMAGE });
    },

    validataCount(count) {
      if (count > 10) {
        this.$set(this, 'count', 10);
      }
    },

    updateCpuMemory(cpu, memory) {
      this.$set(this.spec.template.spec.domain.cpu, 'cores', cpu);
      this.$set(this, 'memory', memory);
    },

    onTabChanged({ tab }) { // yamlEdit component is lazyload
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
      @finish="saveVM"
    >
      <div v-if="isCreate" class="mb-20">
        <RadioGroup
          v-model="isSingle"
          name="model"
          :options="[true,false]"
          :labels="[t('harvester.vmPage.input.singleInstance'), t('harvester.vmPage.input.multipleInstance')]"
          :mode="mode"
        />
      </div>

      <NameNsDescription
        v-model="value"
        :mode="mode"
        :has-extra="!isSingle"
        :name-label="nameLabel"
        :namespaced="false"
        :extra-columns="isSingle ? [] :['type']"
      >
        <template v-slot:type>
          <LabeledInput
            v-if="!isSingle"
            v-model.number="count"
            v-int-number
            type="number"
            :label="t('harvester.fields.count')"
            required
            @input="validataCount"
          />
        </template>
      </NameNsDescription>

      <div class="min-spacer"></div>

      <Checkbox v-if="isCreate" v-model="useTemplate" class="check mb-20" type="checkbox" :label="t('harvester.vmPage.useTemplate')" />

      <div v-if="useTemplate" class="row mb-20">
        <div class="col span-6">
          <LabeledSelect v-model="templateName" :label="t('harvester.vmPage.input.template')" :options="templateOption" />
        </div>

        <div class="col span-6">
          <LabeledSelect v-model="templateVersion" :label="t('harvester.vmPage.input.version')" :options="versionOption" />
        </div>
      </div>

      <Tabbed :side-tabs="true" @changed="onTabChanged">
        <Tab name="Basics" :label="t('vm.detail.tabs.basics')">
          <CpuMemory :cpu="spec.template.spec.domain.cpu.cores" :memory="memory" @updateCpuMemory="updateCpuMemory" />

          <div class="mb-20">
            <ImageSelect v-model="imageName" :disk-rows="diskRows" :disabled="!isCreate" />
          </div>

          <div class="mb-20">
            <SSHKey v-model="sshKey" @update:sshKey="updateSSHKey" />
          </div>
        </Tab>

        <Tab
          name="Volume"
          :label="t('harvester.tab.volume')"
          :weight="-1"
        >
          <Volume v-model="diskRows" :mode="mode" />
        </Tab>

        <Tab
          name="Network"
          :label="t('harvester.tab.network')"
          :weight="-2"
        >
          <Network v-model="networkRows" :mode="mode" />
        </Tab>

        <Tab
          name="advanced"
          :label="t('harvester.tab.advanced')"
          :weight="-3"
        >
          <LabeledInput v-model="hostname" class="labeled-input--tooltip mb-20" required :placeholder="t('harvester.vmPage.hostName.placeholder')">
            <template #label>
              <label class="has-tooltip" :style="{'color':'var(--input-label)'}">
                {{ hostnameLabel }}
              </label>
            </template>
          </LabeledInput>

          <CloudConfig ref="yamlEditor" :user-script="userScript" :network-script="networkScript" @updateCloudConfig="updateCloudConfig" />

          <div class="spacer"></div>
          <Checkbox v-model="isUseMouseEnhancement" class="check" type="checkbox" :label="t('harvester.vmPage.enableUsb')" />
        </Tab>
      </Tabbed>

      <template #extend>
        <div class="mt-20">
          <Checkbox v-model="isRunning" class="check mb-20" type="checkbox" :label="t('harvester.vmPage.createRunning')" />

          <Banner v-if="isEdit" color="warning">
            {{ t('harvester.vmPage.restartTip') }}
          </Banner>
        </div>
      </template>
    </CruResource>
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
}
</style>
