<script>
import { VMI } from '@/config/types';

const _FAILED = 'Failed';
const _SUCCEEDED = 'Succeeded';
const _MIGRATING = 'Migrating';

export default {
  props: {
    vmResource: {
      type:     Object,
      required: true
    },
    showSuccess: {
      type:     Boolean,
      default: true
    }
  },

  computed: {
    vmiResource() {
      const vmiList = this.$store.getters['cluster/all'](VMI) || [];
      const vmi = vmiList.find( (VMI) => {
        return VMI?.metadata?.ownerReferences?.[0]?.uid === this.vmResource?.metadata?.uid;
      });

      return vmi;
    },
    state() {
      const isComplete = this.vmiResource?.migrationState?.status === 'success' || this.vmiResource?.migrationState?.status === 'aborted';

      if (isComplete && this.showSuccess === false) {
        return '';
      } else {
        const phase = this.vmiResource?.vmimResource?.status?.phase;

        if (phase && phase === _FAILED) {
          return _FAILED;
        } else if (phase && phase === _SUCCEEDED) {
          return _SUCCEEDED;
        } else if (phase) {
          return _MIGRATING;
        }

        return '';
      }
    }
  }
};
</script>

<template>
  <div v-if="state">
    <span v-if="!showSuccess">/</span>
    <span :class="{'badge-state': true, [vmiResource.migrationStateBackground]: true}">
      {{ state }}
    </span>
  </div>
</template>

<style lang="scss">
  .badge-state {
    padding: 5px 10px;
    border: 1px solid transparent;
    border-radius: 20px;

    &.bg-info {
      border-color: var(--primary);
    }

    &.bg-error {
      border-color: var(--error);
    }

    &.bg-warning {
      border-color: var(--warning);
    }

    // Successful states are de-emphasized by using [text-]color instead of background-color
    &.bg-success {
      color: var(--success);
      border-color: var(--success);
      background: transparent;
    }
  }

  .sortable-table TD .badge-state {
    @include clip;
    display: inline-block;
    max-width: 100%;
    position: relative;
    padding: 2px 10px 1px 10px;
    font-size: 1em;
    max-width: 200px;
    font-size: .85em;
    vertical-align: middle;
  }
</style>
