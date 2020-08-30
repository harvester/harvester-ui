<script>
/* eslint-disable */
import LabeledSelect from '@/components/form/LabeledSelect';
import DiskModal from '@/components/form/DiskModal';
import NetworkModal from '@/components/form/NetworkModal';
import VM_MIXIN from '@/mixins/vm';
export default {
  components: {
    LabeledSelect, DiskModal, NetworkModal
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
      activeName: 'network',
      spec: {}
    };
  },

  computed: {
    allVersionOption() {
      return this.allVersion.map( (O) => {
        return {
          label: O.status.version,
          value: O.status.version
        };
      });
    },
  },

  watch: {
    currentVersion(version) {
      const current = this.allVersion.find( (V) => {
        return V.status.version === version;
      });

      this.$set(this, 'spec', current.spec.vm);
    },
    allVersion: {
      handler(neu) {
        const current = neu.find( (V) => {
          return V.status.version === this.defaultVersion;
        });
        console.log('-----a', current, neu, this.defaultVersion)
        if (current) {
          const spec = current.spec.vm;
          this.$set(this, 'spec', spec)
        }
      },
      immediate: true
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
    </div>

    <template>
      <el-tabs v-model="activeName">
        <el-tab-pane label="Network Interfaces" name="network">
          <NetworkModal v-model="networkRows" />
        </el-tab-pane>
        <el-tab-pane label="Disk" name="disk">
          <DiskModal v-model="diskRows" />
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<style lang="scss" scoped>

</style>
