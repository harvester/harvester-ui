<script>
import { POD } from '@/config/types';
import { DESCRIPTION } from '@/config/labels-annotations';
import CreateEditView from '@/mixins/create-edit-view';
import LabelsModal from '../../labels-modal';
import AnnotationsModal from '../../annotations-modal';
import DescriptionModal from '../../description-modal';

const UNDEFINED = 'n/a';

// const TEMPLATE_WORKLOAD_LABEL = 'workload.template.kubevirt.io'; // eslint-disbale-line
// const LABEL_USED_TEMPLATE_NAME = 'vm.kubevirt.io/template'; // eslint-disbale-line

export default {
  name: 'Configurations',

  components: {
    LabelsModal,
    AnnotationsModal,
    DescriptionModal,
  },

  mixins: [CreateEditView],

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
    }
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
    pod() {
      const pod = this.allPods.find((p) => {
        const ownerReferences = p?.metadata?.ownerReferences || [];

        return !!ownerReferences.find((r) => {
          return r.kind === 'VirtualMachineInstance' && r.name === this.value.metadata.name;
        });
      });

      return pod?.metadata?.name || UNDEFINED;
    },
    labelsCount() {
      const count = Object.keys(this.value?.metadata?.labels || {}).length;
      const unit = count > 1 ? 'Labels' : 'Label';

      return `${ count } ${ unit }`;
    },
    annotationsCount() {
      let count = 0;

      Object.keys(this.value?.metadata?.annotations || {}).forEach((key) => {
        if (key !== DESCRIPTION) {
          count++;
        }
      });

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
    cdroms() {
      const disks = this.value?.spec?.template?.spec?.domain?.devices?.disks || [];

      return disks.filter((disk) => {
        return !!disk.cdrom;
      });
    },
    flavor() {
      const domain = this.value?.spec?.template?.spec?.domain;

      return `${ domain.cpu.cores } vCPU , ${ domain.resources.requests.memory } Memory`;
    },
    timeZone() {
      return this.resource?.status?.guestOSInfo?.timezone;
    },
    operatingSystem() {
      return this.resource?.status?.guestOSInfo?.prettyName;
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
    done() {},
    update() {
      this.save(() => {});
    },
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    },
    getDeviceType(o) {
      if (o.disk) {
        return 'Disk';
      } else {
        return 'CD-ROM';
      }
    },
  }
};
</script>

<template>
  <div class="overview-details">
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.pod") }}
          </label>
          <div v-if="!isDown">
            {{ pod }}
          </div>
          <div v-else>
            {{ t("vm.detail.details.down") }}
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.labels") }}
          </label>
          <div>
            <a href="javascript:void(0)" @click="toggleLabelsModal(true)">
              {{ labelsCount }} <span class="icon icon-edit"></span>
            </a>
            <LabelsModal
              :spec="value"
              :mode="mode"
              :visible="labelsModalShow"
              @close="toggleLabelsModal(false)"
              @update="update"
            />
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
            <AnnotationsModal
              :spec="value"
              :mode="mode"
              :visible="annotationsModalShow"
              @close="toggleAnnotationsModal(false)"
              @update="update"
            />
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.description") }}
          </label>
          <div>
            <a href="javascript:void(0)" @click="toggleDescriptionModal(true)">
              {{ value.metadata.annotations.description }} <span class="icon icon-edit"></span>
            </a>
            <DescriptionModal
              :spec="value"
              :mode="mode"
              :visible="descriptionModalShow"
              @close="toggleDescriptionModal(false)"
              @update="update"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.bootOrder") }}
          </label>
          <div>
            <ul>
              <li v-for="(disk) in disks" :key="disk.bootOrder">
                {{ disk.bootOrder }}. {{ disk.name }} ({{ getDeviceType(disk) }})
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.CDROMs") }}
          </label>
          <div>
            <div>
              <ul v-if="cdroms.length > 0">
                <li v-for="(rom) in cdroms" :key="rom.name">
                  {{ rom.name }}
                </li>
              </ul>
              <span v-else>
                {{ t("vm.detail.notAvailable") }}
              </span>
            </div>
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
            {{ operatingSystem || t("vm.detail.GuestAgentNotInstalled") }}
          </div>
        </div>
      </div>
      <div class="labeled-input view">
        <label>
          {{ t("vm.detail.details.flavor") }}
        </label>
        <div>
          {{ flavor }}
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.timeZone") }}
          </label>
          <div>
            {{ timeZone || t("vm.detail.GuestAgentNotInstalled") }}
          </div>
        </div>
      </div>
    </div>
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
