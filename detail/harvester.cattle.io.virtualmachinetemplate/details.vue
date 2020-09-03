<script>
import _ from 'lodash';
import LabeledSelect from '@/components/form/LabeledSelect';
import DiskModal from '@/components/form/DiskModal';
import NetworkModal from '@/components/form/NetworkModal';
import VM_MIXIN from '@/mixins/vm';
import Action from './action';

export default {
  components: {
    LabeledSelect, DiskModal, NetworkModal, Action
  },
  mixins: [VM_MIXIN],

  props:      {
    allVersion: {
      type:    Array,
      default: () => {
        return [];
      }
    },

    defaultVersion: {
      type:    Number,
      default: null
    }
  },

  data() {
    return {
      currentVersion: this.defaultVersion,
      activeName:     'network',
      spec:           {},
      current:        {}
    };
  },

  computed: {
    allVersionOption() {
      return this.allVersion.map( (O) => {
        let label = '';

        if (O.status.version === this.defaultVersion) {
          label = `${ O.status.version } (默认)`;
        } else {
          label = O.status.version;
        }

        return {
          label,
          value: O.status.version
        };
      });
    },
  },

  watch: {
    currentVersion: {
      handler(version) {
        const current = this.allVersion.find( (V) => {
          return V.status.version === version;
        });

        if (!current) {
          return;
        }
        this.$set(this, 'current', current);
        this.$set(this, 'spec', current.spec.vm);
      },
      immediate: true
    },
    allVersion: {
      handler(neu) {
        const current = neu.find( (V) => {
          return V.status.version === this.defaultVersion;
        });

        this.$set(this, 'current', current);
        if (current) {
          const spec = current.spec.vm;

          this.$set(this, 'spec', spec);
        }
      }
    }
  }
};
</script>

<template>
  <div>
    <div class="row mb-40">
      <div class="col span-4">
        <LabeledSelect
          v-model="currentVersion"
          :options="allVersionOption"
          label="Version"
        />
      </div>
      <div class="col span-7"></div>
      <div class="col span-1">
        <Action :resource="current">
        </action>
      </div>
    </div>

    <template>
      <el-tabs v-model="activeName">
        <el-tab-pane label="Network Interfaces" name="network">
          <NetworkModal v-model="networkRows" :row-actions="false" />
        </el-tab-pane>
        <el-tab-pane label="Disk" name="disk">
          <DiskModal v-model="diskRows" :row-actions="false" />
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>
