<script>
import { POD } from '@/config/types';
import VmState from '@/components/formatter/vmState';
import ResourceState from '../../resource-state/index';
import LabelsModal from '../../labels-modal';
import AnnotationsModal from '../../annotations-modal';
import DescriptionModal from '../../description-modal';

const UNDEFINED = 'n/a';

export default {
  name: 'Details',

  components: {
    ResourceState,
    VmState,
    LabelsModal,
    AnnotationsModal,
    DescriptionModal,
  },

  props: {
    value: {
      type:     Object,
      required: true
    },
    resource: {
      type:     Object,
      required: true,
      default:  () => {
        return {};
      }
    },
    mode: {
      type:     String,
      required: true,
    },
  },

  fetch() {
    this.getPods();
  },

  data() {
    return {
      allPods: [],

      labelsModalShow:      false,
      annotationsModalShow: false,
      descriptionModalShow: false,
    };
  },

  computed: {
    name() {
      return this.value?.metadata?.name || UNDEFINED;
    },
    namespace() {
      return this.value?.metadata?.namespace || UNDEFINED;
    },
    creationTimestamp() {
      const date = new Date(this.value?.metadata?.creationTimestamp);

      return `${ date.getMonth() + 1 }/${ date.getDate() }/${ date.getUTCFullYear() }`;
    },
    ipAddress() {
      return this.resource?.status?.interfaces?.[0]?.ipAddress || UNDEFINED;
    },
    node() {
      return this.resource?.status?.nodeName || UNDEFINED;
    },
    hostname() {
      return this.resource?.spec?.hostname || UNDEFINED;
    },
    pod() {
      const pod = this.allPods.find((p) => {
        return p?.labels['vm.kubevirt.io/name'] === this.name;
      });

      return pod?.metadata?.name || UNDEFINED;
    },
    labelsCount() {
      const count = Object.keys(this.value?.metadata?.labels).length || 0;
      const unit = count > 1 ? 'Labels' : 'Label';

      return `${ count } ${ unit }`;
    },
    annotationsCount() {
      const count = Object.keys(this.value?.metadata?.annotations).length || 0;
      const unit = count > 1 ? 'Annotations' : 'Annotation';

      return `${ count } ${ unit }`;
    },
    disks() {
      const disks = this.value?.spec?.template?.spec?.domain?.devices?.disks || [];

      return disks.filter((disk) => {
        return !!disk.bootOrder;
      }).sort((a, b) => {
        if (a.bootOrder < b.bootOrder) {
          return -1;
        }

        return 1;
      });
    },
    flavor() {
      const domain = this.value?.spec?.template?.spec?.domain;

      return `${ domain.cpu.cores } vCPU , ${ domain.resources.requests.memory } Memory`;
    },
    isNamespace() {
      return 'Namespace';
    },
    isPod() {
      return 'Pod';
    },
    isNode() {
      return 'Node';
    },
    isDown() {
      return this.isEmpty(this.resource);
    },
  },

  methods: {
    async getPods() {
      const pods = await this.$store.dispatch('cluster/findAll', { type: POD });

      this.allPods = pods || [];
    },
    toggleLabelsModal(show) {
      this.labelsModalShow = show;
    },
    toggleAnnotationsModal(show) {
      this.annotationsModalShow = show;
    },
    toggleDescriptionModal(show) {
      this.descriptionModalShow = show;
    },
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    }
  }
};
</script>

<template>
  <div class="overview-details">
    <h2>{{ t("vm.detail.details.title.vmDetails") }}</h2>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.name") }}
          </label>
          <div>
            <span>{{ name }}</span>
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.status") }}
          </label>
          <div>
            <VmState v-model="value.id" :row="value" />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.namespace") }}
          </label>
          <div>
            <ResourceState v-model="isNamespace" />{{ namespace }}
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.pod") }}
          </label>
          <div>
            <ResourceState v-model="isPod" />{{ pod }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.labels") }}
          </label>
          <div>
            <a href="javascript:void(0)" @click="toggleLabelsModal(true)">
              {{ labelsCount }} <span class="icon icon-edit"></span>
            </a>
            <LabelsModal :spec="value" :mode="mode" :visible="labelsModalShow" @close="toggleLabelsModal(false)" />
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.bootOrder") }}
          </label>
          <div>
            <ul>
              <li v-for="(disk) in disks" :key="disk.bootOrder">
                {{ disk.bootOrder }}. {{ disk.name }} (Disk)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.annotations") }}
          </label>
          <div>
            <a href="javascript:void(0)" @click="toggleAnnotationsModal(true)">
              {{ annotationsCount }} <span class="icon icon-edit"></span>
            </a>
            <AnnotationsModal :spec="value" :mode="mode" :visible="annotationsModalShow" @close="toggleAnnotationsModal(false)" />
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.CDROMs") }}
          </label>
          <div>
            {{ t("vm.detail.notAvailable") }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.description") }}
          </label>
          <div>
            <a href="javascript:void(0)" @click="toggleDescriptionModal(true)">
              {{ value.metadata.annotations.description }} <span class="icon icon-edit"></span>
            </a>
            <DescriptionModal :spec="value" :mode="mode" :visible="descriptionModalShow" @close="toggleDescriptionModal(false)" />
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.ipAddress") }}
          </label>
          <div>
            {{ ipAddress }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.operatingSystem") }}
          </label>
          <div>
            {{ t("vm.detail.notAvailable") }}
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.hostname") }}
          </label>
          <div v-if="!isDown">
            {{ hostname }}
          </div>
          <div v-else>
            {{ t("vm.detail.details.down") }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.template") }}
          </label>
          <div>
            {{ t("vm.detail.notAvailable") }}
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.timeZone") }}
          </label>
          <div v-if="!isDown">
            {{ t("vm.detail.notAvailable") }}
          </div>
          <div v-else>
            {{ t("vm.detail.details.down") }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.created") }}
          </label>
          <div>
            {{ creationTimestamp }}
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.node") }}
          </label>
          <div>
            <ResourceState v-model="isNode" />{{ node }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.owner") }}
          </label>
          <div>
            {{ t("vm.detail.noOwner") }}
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.workloadProfile") }}
          </label>
          <div>
            {{ t("vm.detail.notAvailable") }}
          </div>
        </div>
      </div>
    </div>
    <el-divider></el-divider>
    <h2>{{ t("vm.detail.details.title.requirements") }}</h2>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.nodeSelector") }}
          </label>
          <div>
            {{ t("vm.detail.notAvailable") }}
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.flavor") }}
          </label>
          <div>
            {{ flavor }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.tolerations") }}
          </label>
          <div>
            {{ t("vm.detail.notAvailable") }}
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.dedicatedResources") }}
          </label>
          <div>
            {{ t("vm.detail.notAvailable") }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.affinityRules") }}
          </label>
          <div>
            {{ t("vm.detail.notAvailable") }}
          </div>
        </div>
      </div>
    </div>
    <el-divider></el-divider>
    <h2>{{ t("vm.detail.details.title.services") }}</h2>
    <el-divider></el-divider>
    <h2>{{ t("vm.detail.details.title.users") }}</h2>
  </div>
</template>

<style lang="scss" scoped>
  .overview-details {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: auto;
    grid-row-gap: 15px;

    h2 {
      margin-bottom: 15px;
    }

    ul {
      padding-left: 0px;
      list-style-type: none;
    }

    .badge-state {
      padding: 2px 5px;
      font-size: 12px;
      margin-right: 3px;
    }
  }
</style>
