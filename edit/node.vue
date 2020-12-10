<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import Footer from '@/components/form/Footer';
import NameNsDescription from '@/components/form/NameNsDescription';
import LabeledInput from '@/components/form/LabeledInput';
import CreateEditView from '@/mixins/create-edit-view';
import { HOST_CUSTOM_NAME } from '@/config/labels-annotations';

export default {
  name: 'EditNode',

  components: {
    Footer,
    Tabbed,
    Tab,
    LabeledInput,
    NameNsDescription
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    return { customName: this.value.getAnnotationValue(HOST_CUSTOM_NAME) };
  },

  watch: {
    customName(neu) {
      this.value.setAnnotation(HOST_CUSTOM_NAME, neu);
    }
  },

};
</script>

<template>
  <div class="node">
    <NameNsDescription
      :value="value"
      :namespaced="false"
      :mode="mode"
    />

    <Tabbed ref="tabbed" class="mt-15" :side-tabs="true">
      <Tab name="basics" :label="t('vm.detail.tabs.basics')">
        <LabeledInput
          v-model="customName"
          :label="t('node.detail.basic.customName')"
          class="mb-20"
          :mode="mode"
        />
      </Tab>
    </Tabbed>
    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>

<style lang="scss" scoped>
</style>
