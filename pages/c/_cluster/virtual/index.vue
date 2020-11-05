<script type="text/javascript">
import { allHash } from '@/utils/promise';
import { METRIC, NODE, VM } from '@/config/types';
import { formatSi } from '@/utils/units';
import StateProgress from '@/components/StateProgress';
import Pie from './Pie';

export default {
  name:       'Overview',
  components: { Pie, StateProgress },

  async fetch() {
    const hash = {
      metricNodes: this.$store.dispatch('management/findAll', { type: METRIC.NODE }),
      nodes:       this.$store.dispatch('management/findAll', { type: NODE }),
      vms:         this.$store.dispatch('management/findAll', { type: VM }),
    };

    const res = await allHash(hash);

    for ( const k in res ) {
      this[k] = res[k];
    }
  },

  data() {
    return {
      vms:         [],
      nodes:       [],
      metricNodes: [],
      hostStatus:  {
        success: 0,
        warning: 0,
        error:   0
      },
      vmStatus: {
        Running: 0,
        Stopped: 0,
        Unknown: 0
      }
    };
  },

  computed: {
    cpusTotal() {
      let out = 0;

      this.metricNodes.forEach((node) => {
        out += node.cpuCapacity;
      });

      return out;
    },

    cpusUsageTotal() {
      let out = 0;

      this.metricNodes.forEach((node) => {
        out += node.cpuUsage;
      });

      return out;
    },

    memorysTotal() {
      let out = 0;

      this.metricNodes.forEach((node) => {
        out += node.memoryCapacity;
      });

      return out;
    },

    memorysUsageTotal() {
      let out = 0;

      this.metricNodes.forEach((node) => {
        out += node.memoryUsage;
      });

      return out;
    },

    storageUsage() {
      let out = 0;

      this.metricNodes.forEach((node) => {
        out += node.storageUsage;
      });

      return out;
    },

    storageTotal() {
      let out = 0;

      this.metricNodes.forEach((node) => {
        out += node.storageTotal;
      });

      return out;
    },

    memoryPrecent() {
      return (this.memorysUsageTotal / this.memorysTotal).toFixed(2) * 100;
    },

    cpuPrecent() {
      return (this.cpusUsageTotal / this.cpusTotal).toFixed(2) * 100;
    },

    storagePrecent() {
      return (this.storageUsage / this.storageTotal).toFixed(2) * 100;
    },

    nodesStatus() {
      let success = 0;
      let warning = 0;
      let error = 0;

      this.nodes.forEach((item) => {
        const status = item.getConditionStatus('Ready');

        if (status === 'True') {
          success += 1;
        } else if (status === 'False') {
          error += 1;
        } else if (status === 'Unknown') {
          warning += 1;
        }
      });

      this.$set(this.hostStatus, 'success', success);
      this.$set(this.hostStatus, 'error', error);
      this.$set(this.hostStatus, 'warning', warning);

      return [
        {
          number: success, text: 'Success', color: 'bg-success'
        },
        {
          number: warning, text: 'Unknown', color: 'bg-warning'
        },
        {
          number: error, text: 'Warning', color: 'bg-error'
        }
      ];
    },

    vmsStatus() {
      let Running = 0;
      let Stopped = 0;
      let Unknown = 0;

      this.vms.forEach((vm) => {
        const status = vm.actualState;

        if (status === 'Running') {
          Running += 1;
        } else if (status === 'Stopped' || status === 'Paused') {
          Stopped += 1;
        } else {
          Unknown += 1;
        }
      });

      this.$set(this.vmStatus, 'Running', Running);
      this.$set(this.vmStatus, 'Stopped', Stopped);
      this.$set(this.vmStatus, 'Unknown', Unknown);

      return [
        {
          number: Running, text: 'Running', color: 'bg-success'
        },
        {
          number: Stopped, text: 'Stopped', color: 'bg-error'
        },
        {
          number: Unknown, text: 'Unknown', color: 'bg-warning'
        }
      ];
    },
  },

  methods: {
    formatSi(val, format) {
      return formatSi(val, { ...format });
    },
  }
};
</script>

<template>
  <div id="echarts">
    <div class="row mb-20">
      <div class="col span-3 card">
        <div class="header">
          <h4>Host</h4>
        </div>

        <div class="content">
          <div class="left">
            {{ nodes.length }}
          </div>

          <div class="right">
            <div class="item">
              <span>
                <i class="icon icon-dot success"></i> Connected
              </span>
              <i>{{ hostStatus.success }}</i>
            </div>

            <div class="item">
              <span>
                <i class="icon icon-dot error"></i> Disconnected
              </span>
              <i>{{ hostStatus.error }}</i>
            </div>

            <div class="item">
              <span>
                <i class="icon icon-dot warning"></i> Unknown
              </span>
              <i>{{ hostStatus.warning }}</i>
            </div>
          </div>
        </div>

        <div class="bar">
          <StateProgress :bar-data="nodesStatus" />
        </div>
      </div>

      <div class="col span-3 card">
        <div class="chart">
          <Pie ref="Cpu" title="Cpu" :value="cpuPrecent">
            <span>Used: <i>{{ formatSi(cpusUsageTotal) }}</i></span>
            <hr>
            <span>Actual Total: <i>{{ formatSi(cpusTotal) }}</i></span>
          </Pie>
        </div>
      </div>

      <div class="col span-3 card">
        <div class="chart">
          <Pie ref="Memory" title="Memory" :value="memoryPrecent">
            <span>Used: <i>{{ formatSi(memorysUsageTotal, { increment: 1024 }) }}</i></span>
            <hr>
            <span>Actual Total: <i>{{ formatSi(memorysTotal, { increment: 1024 }) }}</i></span>
          </Pie>
        </div>
      </div>

      <div class="col span-3 card">
        <div class="chart">
          <Pie ref="storage" title="Storage Size" :value="storagePrecent">
            <span>Used: <i>{{ formatSi(storageUsage) }}</i></span>
            <hr>
            <span>Actual Total: <i>{{ formatSi(storageTotal) }}</i></span>
          </Pie>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col span-3 card">
        <div class="header">
          <h4>VM Instance</h4>
        </div>

        <div class="content">
          <div class="left">
            {{ vms.length }}
          </div>

          <div class="right">
            <div class="item">
              <span>
                <i class="icon icon-dot success"></i> Running
              </span>
              <i>{{ vmStatus.Running }}</i>
            </div>

            <div class="item">
              <span>
                <i class="icon icon-dot error"></i> Stopped
              </span>
              <i>{{ vmStatus.Stopped }}</i>
            </div>

            <div class="item">
              <span>
                <i class="icon icon-dot warning"></i> Unknown
              </span>
              <i>{{ vmStatus.Unknown }}</i>
            </div>
          </div>
        </div>

        <div class="bar">
          <StateProgress :bar-data="vmsStatus" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart {
  span {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
}

.bar {
  margin-top: 48px;
}

.content {
  display: flex;

  .success {
    color: var(--success);
  }

  .warning {
    color: var(--warning);
  }

  .error {
    color: var(--error);
  }

  .left {
    width: 50%;
    display: flex;
    padding-left: 20px;
    align-items: center;
    font-size: 40px;;
  }

  .right {
    width: 50%;
    .item {
      margin-bottom: 10px;
      i {
        margin-right: 10px;
      }

      display: flex;
      justify-content: space-between;
    }
  }
}

</style>
