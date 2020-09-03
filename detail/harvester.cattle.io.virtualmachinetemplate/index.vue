<script>
/* eslint-disable */
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import Detail from './details.vue';
import Version from './versions.vue';
import { VM_TEMPLATE } from '@/config/types';

export default {
  name:       'DetailVMT',
  components: {
    Tab,
    Detail,
    Version,
    Tabbed,
    LabeledSelect,
    LabeledInput
  },

  props: {
    value: {
      type:     Object,
      required: true
    }
  },

  data() {
    const defaultVersion = this.value?.status?.defaultVersion;

    return {};
  },

  computed: {
    latestVersion() {
      return this.value?.status?.latestVersion || '-';
    },

    defaultVersion() {
      return this.value?.status?.defaultVersion || '-';
    },
    versions() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.version)
      return choices.filter( O => O.spec.templateId === this.value.id.replace('/', ':'))
    }
  },
};
</script>

<template>
  <div class="mt-20">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <div class="row">
          <div class="col span-11">
            <h2>Vm template details</h2>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col span-3">
          <div>template name</div>
          <div>{{ value.metadata.name }}</div>
        </div>

        <div class="col span-3">
          <div>Default template</div>
          <div>{{ defaultVersion }}</div>
        </div>

        <div class="col span-3">
          <div>Latest version</div>
          <div>{{ latestVersion }}</div>
        </div>
      </div>
    </el-card>

    <div class="spacer"></div>

    <Tabbed v-bind="$attrs">
      <Tab label="Detail" name="detail">
        <Detail :all-version="versions" :default-version="defaultVersion" />
      </Tab>

      <Tab label="Versions" name="version">
        <Version v-model="versions" :default-version="defaultVersion" />
      </Tab>
    </Tabbed>
  </div>
</template>

<style lang="scss" scoped>
.row {
  height: 54px;

  .col {
    div:first-child {
      line-height: 30px;
      font-size: 14px;
      font-weight: 600;
    }
  }
}
</style>
