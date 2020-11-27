<script>
import IPAddress from '@/components/formatter/ipAddress';
import ConsoleBar from '@/components/form/ConsoleBar';
import { IMAGE, POD } from '@/config/types';

import { DESCRIPTION } from '@/config/labels-annotations';
import CreateEditView from '@/mixins/create-edit-view';
import LabelsModal from '../../labels-modal';
import AnnotationsModal from '../../annotations-modal';
import DescriptionModal from '../../description-modal';

const UNDEFINED = 'n/a';

export default {
  name: 'Details',

  components: {
    ConsoleBar,
    IPAddress,
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
    },
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

    creationTimestamp() {
      const date = new Date(this.value?.metadata?.creationTimestamp);

      if (!date.getMonth) {
        return UNDEFINED;
      }

      return `${ date.getMonth() + 1 }/${ date.getDate() }/${ date.getUTCFullYear() }`;
    },

    node() {
      return this.resource?.status?.nodeName || UNDEFINED;
    },

    hostname() {
      return this.resource?.spec?.hostname || this.resource?.status?.guestOSInfo?.hostname;
    },

    imageName() {
      const imageList = this.$store.getters['cluster/all'](IMAGE) || [];
      const imageId = this.value?.spec?.dataVolumeTemplates?.[0]?.metadata?.annotations?.['harvester.cattle.io/imageId'] || '';
      const image = imageList.find( I => imageId === I.id);

      return image?.spec?.displayName || '-';
    },

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

    description() {
      return this.value?.metadata?.annotations?.[DESCRIPTION];
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
    getDeviceType(o) {
      if (o.disk) {
        return 'Disk';
      } else {
        return 'CD-ROM';
      }
    },
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    }
  }
};
</script>

<template>
  <div class="overview-basics">
    <h2>Basics</h2>

    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.name") }}
          </label>
          <div>
            <div class="smart-row">
              <div class="console">
                {{ name }} <ConsoleBar :resource="value" class="cosoleBut" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            Image
          </label>
          <div>
            {{ imageName }}
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.hostname") }}
          </label>
          <div v-if="!isDown">
            {{ hostname || t("vm.detail.GuestAgentNotInstalled") }}
          </div>
          <div v-else>
            {{ t("vm.detail.details.down") }}
          </div>
        </div>
      </div>

      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("vm.detail.details.node") }}
          </label>
          <div v-if="!isDown">
            <span>{{ node }}</span>
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
            {{ t("vm.detail.details.ipAddress") }}
          </label>
          <div>
            <IPAddress v-model="value.id" :row="value" :is-list="true" />
          </div>
        </div>
      </div>

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
    </div>

    <hr class="section-divider" />

    <h2>Configurations</h2>

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
              mode="edit"
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
              mode="edit"
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
              {{ description }} <span class="icon icon-edit"></span>
            </a>
            <DescriptionModal
              :spec="value"
              mode="edit"
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
  .cosoleBut {
    position: relative;
    top: -20px;
    left: 38px;
  }

  .overview-basics {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: auto;
    grid-row-gap: 15px;

    .badge-state {
      padding: 2px 5px;
      font-size: 12px;
      margin-right: 3px;
    }

    .smart-row {
      display: flex;
      flex-direction: row;

      .console {
        display: flex;
      }
    }

    &__name {
      flex: 1;
    }

    &__ssh-key {
      min-width: 150px;
    }
  }
</style>
