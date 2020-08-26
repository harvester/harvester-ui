<script>
import ResourceState from '../../resource-state/index';

const UNDEFINED = 'n/a';

export default {
  name: 'Details',

  components: { ResourceState },

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
    ipAddress() {
      return this.resource?.status?.interfaces?.[0]?.ipAddress || UNDEFINED;
    },
    node() {
      return this.resource?.status?.nodeName || UNDEFINED;
    },
    hostname() {
      return this.resource?.spec?.hostname || UNDEFINED;
    },
    isNamespace() {
      return 'Namespace';
    },
    isNode() {
      return 'Node';
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
  <div class="overview-details">
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.name") }}
      </label>
      <div>
        <span>{{ name }}</span>
      </div>
    </div>
    <div class="labeled-input view">
      <label>
        {{ t("vm.detail.details.namespace") }}
      </label>
      <div>
        <ResourceState v-model="isNamespace" />{{ namespace }}
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
        <ResourceState v-model="isNode" /><span>{{ node }}</span>
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
        <span>{{ ipAddress }}</span>
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

<style lang="scss" scoped>
  .overview-details {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: auto;
    grid-row-gap: 15px;

    .badge-state {
      padding: 2px 5px;
      font-size: 12px;
      margin-right: 3px;
    }
  }
</style>
