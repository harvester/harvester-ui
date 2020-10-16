<script>
/*
    Tab component for resource CRU pages featuring:
    Labels and Annotation tabs with content filtered by create-edit-view mixin
    Slots for more tabs, 'before' and 'after' labels and annotations
*/
import CreateEditView from '@/mixins/create-edit-view';
import KeyValue from '@/components/form/KeyValue';

export default {
  components: { KeyValue },

  mixins: [CreateEditView],

  props: {
    // resource instance
    value: {
      type:    Object,
      default: () => {
        return {};
      }
    },
    // create-edit-view mode
    mode: {
      type:    String,
      default: 'create'
    }
  },
  computed: {
    hasCustomTabs() {
      return !!this.$slots['before'];
    }
  }
};
</script>

<template>
  <a-tabs v-if="!isView || hasCustomTabs" v-bind="$attrs" type="card">
    <slot name="before" />
    <a-tab-pane v-if="!isView" key="labels" :tab="t('resourceTabs.tabs.labels')">
      <KeyValue
        key="labels"
        v-model="value.metadata.labels"
        :mode="mode"
        :initial-empty-row="true"
        :pad-left="false"
        :read-allowed="false"
        :protip="false"
      />
    </a-tab-pane>
    <a-tab-pane v-if="!isView" key="annotations" :tab="t('resourceTabs.tabs.annotations')">
      <KeyValue
        key="annotations"
        v-model="value.metadata.annotations"
        :mode="mode"
        :initial-empty-row="true"
        :pad-left="false"
        :read-allowed="false"
        :protip="false"
      />
    </a-tab-pane>
  </a-tabs>
</template>
