<script>
import IPAddress from '@/components/formatter/ipAddress';
import ConsoleBar from '@/components/form/ConsoleBar';

const UNDEFINED = 'n/a';

export default {
  name: 'Details',

  components: {
    ConsoleBar,
    IPAddress,
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

  data() {
    return {};
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

      if (!date.getMonth) {
        return UNDEFINED;
      }

      return `${ date.getMonth() + 1 }/${ date.getDate() }/${ date.getUTCFullYear() }`;
    },
    node() {
      return this.resource?.status?.nodeName || UNDEFINED;
    },
    hostname() {
      return this.resource?.spec?.hostname || UNDEFINED;
    },
    isDown() {
      return this.isEmpty(this.resource);
    },
  },

  methods: {
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    }
  }
};
</script>

<template>
  <div class="overview-basics">
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.name") }}
      </label>
      <div>
        <div class="smart-row">
          <div class="overview-basics__name">
            {{ name }}
          </div>
          <div class="overview-basics__ssh-bar">
            <ConsoleBar :resource="resource" />
          </div>
        </div>
      </div>
    </div>
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.namespace") }}
      </label>
      <div>
        {{ namespace }}
      </div>
    </div>
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
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.ipAddress") }}
      </label>
      <div>
        <IPAddress v-model="value.id" :row="value" />
      </div>
    </div>
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.created") }}
      </label>
      <div>
        {{ creationTimestamp }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
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
    }

    &__name {
      flex: 1;
    }

    &__ssh-key {
      min-width: 150px;
    }
  }
</style>
