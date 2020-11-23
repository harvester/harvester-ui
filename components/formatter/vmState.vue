<script>
export default {
  props: {
    value: {
      type:     String,
      default: ''
    },
    row: {
      type:     Object,
      required: true
    }
  },

  computed: {
    state() {
      return this.row.actualState;
    },
    isRun() {
      return this.state === 'Running';
    },
    isOf() {
      return this.state === 'Off';
    },
    isPending() {
      return this.state === 'Pending';
    },
    isError() {
      return this.state === 'Error';
    },
    isStop() {
      return this.state === 'Stoping';
    },
    isStart() {
      return this.state === 'Starting';
    },
    isOther() {
      return this.state !== 'Off' && this.state !== 'Running' && this.state !== 'Stoping';
    },
    bg() {
      return this.row?.stateBackground;
    },
    // 'badge-state': true, 'bg-success': isRun, 'bg-error': isError, 'bg-warning': isOf, 'bg-tip': isOther,
  },
};
</script>

<template>
  <span :key="state" :class="{'badge-state': true, [bg]: true}">
    <template>
      {{ state }}
    </template>
  </span>
</template>

<style lang="scss" scoped>
.badge-state {
    padding: 5px 10px;
    border: 1px solid transparent;
    border-radius: 20px;
    max-width: 250px !important;

    &.bg-info {
      border-color: var(--primary);
    }

    &.bg-error {
      border-color: var(--error);
    }

    &.bg-warning {
      border-color: var(--warning);
    }

    &.bg-tip {
      border-color: wheat;
    }

    // Successful states are de-emphasized by using [text-]color instead of background-color
    &.bg-success {
      color: var(--success);
      border-color: var(--success);
      background: transparent;
    }
  }
</style>
