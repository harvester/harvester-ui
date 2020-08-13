<script>
import _ from 'lodash';

const VMIPhase = {
  Pending:    'Pending',
  Scheduling: 'Scheduling',
  Scheduled:  'Scheduled',
  Running:    'Running',
  Succeeded:  'Succeeded',
  Failed:     'Failed',
  Unknown:    'Unknown',
};

const RunStrategy = {
  Always:         'Always',
  RerunOnFailure: 'RerunOnFailure',
  Halted:         'Halted',
  Manual:         'Manual',
};

const StateChangeRequest = {
  Start: 'Start',
  Stop:  'Stop',
};

export default {
  props: {
    value: {
      type:     String,
      default: ''
    },
    row: {
      type:     Object,
      required: true
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },

  async fetch() {
    const VMI = 'kubevirt.io.virtualmachineinstance';
    const choices = await this.$store.dispatch('cluster/findAll', { type: VMI });
    const vmiResource = choices.find(VMI => VMI.id === this.value) || null;
    this.vmiResource = vmiResource;
  },

  data() {
    return { vmiResource: null };
  },

  computed: {
    state() {
      return this.isPause() ||
      this.isVMError() ||
      this.isBeingStopped() ||
      this.isOff() ||
      this.isRunning() ||
      this.isStarting() ||
      this.isPend();
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
  },

  methods: {
    isPend() {
      return this.getStatusPhase(this.vmiResource) === VMIPhase.Pending ? 'Pending' : null
    },
    isPause() {
      const conditions = this.vmiResource?.status?.conditions || [];

      return conditions.filter( (O) => {
        return O.type === 'Paused';
      }).length > 0 ? 'Paused' : null;
    },
    isVMError() {
      const vmFailureCond = this.getStatusConditionOfType(this.row, 'Failure');

      if (vmFailureCond) {
        return 'Error';
      }

      return null;
    },
    isRunning() {
      if (this.getStatusPhase(this.vmiResource) === VMIPhase.Running) {
        return VMIPhase.Running;
      }

      return null;
    },
    isOff() {
      const vm = this.row;

      return vm && !this.isVMExpectedRunning(vm) ? 'Off' : null;
    },
    isBeingStopped() {
      const vm = this.row;

      if (vm && !this.isVMExpectedRunning(vm) && this.isVMCreated(vm)) {
        return 'Stoping';
      }

      return null;
    },
    isStarting() {
      const vm = this.row;

      if (vm && this.isVMExpectedRunning(vm) && this.isVMCreated(vm)) {
        return 'Starting';
      }

      return null;
    },
    getStatusPhase(entity) {
      return entity?.status?.phase;
    },
    getStatusConditionOfType(statusResource, type) {
      return this.getStatusConditions(statusResource).find(condition => condition.type === type);
    },
    getStatusConditions(statusResource, defaultValue = []) {
      return _.get(statusResource, 'status.conditions') === undefined ? defaultValue : statusResource.status.conditions;
    },
    isVMExpectedRunning(vm) {
      if (!vm?.spec) {
        return false;
      }
      const { running, runStrategy } = vm.spec;

      if (running !== null) {
        return running;
      }

      if (runStrategy !== null) {
        let changeRequests;

        switch (runStrategy) {
        case RunStrategy.Halted:
          return false;
        case RunStrategy.Always:
        case RunStrategy.RerunOnFailure:
          return true;
        case RunStrategy.Manual:
        default:
          changeRequests = new Set(
            (vm.status?.stateChangeRequests || []).map(chRequest => chRequest?.action),
          );

          if (changeRequests.has(StateChangeRequest.Stop)) {
            return false;
          }
          if (changeRequests.has(StateChangeRequest.Start)) {
            return true;
          }

          return this.isVMCreated(vm);
        }
      }

      return false;
    },
    isVMCreated() {
      const vm = this.row;

      return !!vm?.status?.created;
    }
  }
};
</script>

<template>
  <span :class="{'badge-state': true, 'bg-success': isRun, 'bg-error': isError, 'bg-warning': isOf}">
    <template v-if="state === 'Running'">
      <i class="el-icon-refresh"></i> {{state}}
    </template>
    <template v-else-if="state === 'Off'">
      <i class="el-icon-remove-outline"></i> {{state}}
    </template>
    <template v-else-if="state === 'Stopping'">
      <i class="el-icon-video-pause"></i> {{state}}
    </template>
  </span>
</template>

<style lang="scss" scoped>
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
</style>
