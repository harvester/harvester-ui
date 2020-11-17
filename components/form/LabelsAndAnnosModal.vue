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

};
</script>

<template>
  <div v-if="!isView">
    <div class="row mb-20">
      <div class="col span-12">
        <h2>Labels</h2>
        <KeyValue
          key="labels"
          v-model="value.metadata.labels"
          :mode="mode"
          :pad-left="false"
          :read-allowed="false"
          :protip="false"
          add-label="Add Label"
        />
      </div>
    </div>
    <div class="row">
      <div class="col span-12">
        <h2>Annotations</h2>
        <KeyValue
          key="annotations"
          v-model="value.metadata.annotations"
          :mode="mode"
          :pad-left="false"
          :read-allowed="false"
          :protip="false"
          add-label="Add Annotation"
        />
      </div>
    </div>
  </div>
</template>
