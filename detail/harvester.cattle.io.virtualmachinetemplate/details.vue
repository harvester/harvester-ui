<script>
import _ from 'lodash';
import LabeledSelect from '@/components/form/LabeledSelect';
import DiskModal from '@/components/form/DiskModal';
import NetworkModal from '@/components/form/NetworkModal';
import VM_MIXIN from '@/mixins/vm';
import { IMAGE } from '@/config/types';
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
          label = `${ O.status.version } (default)`;
        } else {
          label = O.status.version;
        }

        return {
          label,
          value: O.status.version
        };
      });
    },
    cpu() {
      return this.current?.spec?.vm?.template?.spec?.domain?.cpu?.cores || '-';
    },

    memory() {
      return this.current?.spec?.vm?.template?.spec?.domain?.resources?.requests?.memory || '-';
    },

    imageName() {
      const imageList = this.$store.getters['cluster/all'](IMAGE) || [];
      const imageId = this.current?.spec?.vm?.dataVolumeTemplates?.[0]?.metadata?.annotations?.['harvester.cattle.io/imageId'] || '';
      const image = imageList.find( I => imageId === I.id);

      return image?.spec?.displayName || '-';
    }
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
      <div class="col span-1 center">
        <div class="labeled-input view">
          <label>
            Cpu
          </label>
          <div>
            {{ cpu }}
          </div>
        </div>
      </div>
      <div class="col span-1 center">
        <div class="labeled-input view">
          <label>
            Memory
          </label>
          <div>
            {{ memory }}
          </div>
        </div>
      </div>
      <div class="col span-5 center">
        <div class="labeled-input view">
          <label>
            Image
          </label>
          <div>
            {{ imageName }}
          </div>
        </div>
      </div>
      <div class="col span-1 action">
        <Action :resource="current">
        </action>
      </div>
    </div>

    <template>
      <el-tabs v-model="activeName">
        <el-tab-pane label="Disks" name="disk">
          <DiskModal v-model="diskRows" :row-actions="false" />
        </el-tab-pane>

        <el-tab-pane label="Networks" name="network">
          <NetworkModal v-model="networkRows" :row-actions="false" />
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.action {
  display: flex;
  justify-content: flex-end;
}
.center {
  margin-top: 10px;
}
</style>
