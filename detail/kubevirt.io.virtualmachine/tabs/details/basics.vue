<script>
import IPAddress from '@/components/formatter/ipAddress';
import ConsoleBar from '@/components/form/ConsoleBar';
import { IMAGE } from '@/config/types';
import CreateEditView from '@/mixins/create-edit-view';

const UNDEFINED = 'n/a';

export default {
  name: 'Details',

  components: {
    ConsoleBar,
    IPAddress,
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
    return { };
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

    isDown() {
      return this.isEmpty(this.resource);
    },

    machineType() {
      return this.value?.spec?.template?.spec?.domain?.machine?.type || undefined;
    }
  },

  methods: {
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
    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("harvester.vmPage.detail.details.name") }}
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
            {{ t("harvester.fields.image") }}
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
            {{ t("harvester.vmPage.detail.details.hostname") }}
          </label>
          <div v-if="!isDown">
            {{ hostname || t("harvester.vmPage.detail.GuestAgentNotInstalled") }}
          </div>
          <div v-else>
            {{ t("harvester.vmPage.detail.details.down") }}
          </div>
        </div>
      </div>

      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("harvester.vmPage.detail.details.node") }}
          </label>
          <div v-if="!isDown">
            <span>{{ node }}</span>
          </div>
          <div v-else>
            {{ t("harvester.vmPage.detail.details.down") }}
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("harvester.vmPage.detail.details.ipAddress") }}
          </label>
          <div>
            <IPAddress v-model="value.id" :row="value" />
          </div>
        </div>
      </div>

      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("harvester.vmPage.detail.details.created") }}
          </label>
          <div>
            {{ creationTimestamp }}
          </div>
        </div>
      </div>
    </div>

    <hr class="section-divider" />

    <h2>{{ t('harvester.vmPage.detail.tabs.configurations') }}</h2>

    <div class="row">
      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("harvester.vmPage.detail.details.bootOrder") }}
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
            {{ t("harvester.vmPage.detail.details.CDROMs") }}
          </label>
          <div>
            <div>
              <ul v-if="cdroms.length > 0">
                <li v-for="(rom) in cdroms" :key="rom.name">
                  {{ rom.name }}
                </li>
              </ul>
              <span v-else>
                {{ t("harvester.vmPage.detail.notAvailable") }}
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
            {{ t("harvester.vmPage.detail.details.operatingSystem") }}
          </label>
          <div>
            {{ operatingSystem || t("harvester.vmPage.detail.GuestAgentNotInstalled") }}
          </div>
        </div>
      </div>
      <div class="labeled-input view">
        <label>
          {{ t("harvester.vmPage.detail.details.flavor") }}
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
            {{ t("harvester.vmPage.detail.details.timeZone") }}
          </label>
          <div>
            {{ timeZone || t("harvester.vmPage.detail.GuestAgentNotInstalled") }}
          </div>
        </div>
      </div>

      <div class="col span-6">
        <div class="labeled-input view">
          <label>
            {{ t("harvester.vmPage.input.MachineType") }}
          </label>
          <div>
            {{ machineType }}
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
