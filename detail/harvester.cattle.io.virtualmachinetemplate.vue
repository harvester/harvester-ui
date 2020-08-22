<script>
/* eslint-disable */
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';

export default {
  components: {
    Tab,
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
    return {};
  },

  computed: {
    latestVersion() {
      return this.value?.status?.latestVersion || '-';
    },

    defaultVersion() {
      return this.value?.status?.defaultVersion || '-';
    }
  }
};
</script>

<template>
  <div class="mt-20">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <h2>Vm template details</h2>
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
        <h1>Detail</h1>
      </Tab>

      <Tab label="Versions" name="version">
        <h1>version</h1>
      </Tab>
    </Tabbed>
  </div>
</template>

<style lang="scss" scoped>
.row {
  height: 54px;
  div:first-child {
    border-right: 1px solid #eaeded;
  }

  .col {
    div:first-child {
      line-height: 30px;
      font-size: 14px;
      font-weight: 600;
    }
  }
}
</style>
