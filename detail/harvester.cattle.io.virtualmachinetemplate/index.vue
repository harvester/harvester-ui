<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import { VM_TEMPLATE } from '@/config/types';
import { defaultAsyncData } from '@/components/ResourceDetail';
import Detail from './details.vue';
import Version from './versions.vue';

export default {
  name:       'DetailVMT',
  components: {
    Tab,
    Detail,
    Version,
    Tabbed,
  },

  props: {
    value: {
      type:     Object,
      required: true
    }
  },

  asyncData(ctx) {
    const parentOverride = { displayName: 'Template' };
    const resource = ctx.params.resource;

    return defaultAsyncData(ctx, resource, parentOverride);
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
    },

    description() {
      return this.value?.spec?.description || '-';
    },

    versions() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.version);

      return choices.filter( O => O.spec.templateId === this.value.id );
    }
  },
};
</script>

<template>
  <div class="mt-20">
    <Tabbed v-bind="$attrs" :side-tabs="true">
      <Tab label="Detail" name="detail">
        <div class="row">
          <div class="col span-3">
            <div>Default template</div>
            <div>{{ defaultVersion }}</div>
          </div>

          <div class="col span-3">
            <div>Latest version</div>
            <div>{{ latestVersion }}</div>
          </div>

          <div class="col span-6">
            <div>Description</div>
            <div>{{ description }}</div>
          </div>
        </div>

        <div class="spacer"></div>

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
