<script>
import KeyValue from '@/components/form/KeyValue';

export default {
  components: { KeyValue },

  props: {
    spec: {
      type:     Object,
      required: true,
    },
    visible: {
      type:    Boolean,
      default: false
    },
    mode: {
      type:     String,
      default: 'view'
    }
  },

  data() {
    return { dialogVisible: false };
  },

  methods: {
    handleClose() {
      this.$emit('modal-close');
    }
  }
};
</script>

<template>
  <el-dialog
    title="Edit Labels"
    :visible="visible"
    width="50%"
    :before-close="handleClose"
  >
    <KeyValue
      key="labels"
      v-model="spec.metadata.labels"
      :mode="mode"
      :initial-empty-row="true"
      :pad-left="false"
      :read-allowed="false"
    />
  </el-dialog>
</template>

<style lang="scss" scoped>
.tip {
  font-size: 13px;
  font-style: italic;
}
</style>
