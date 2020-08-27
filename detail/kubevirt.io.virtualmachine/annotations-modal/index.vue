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
      this.$emit('close');
    },
    save() {
      this.$emit('update');
    },
  }
};
</script>

<template>
  <el-dialog
    title="Edit Annotations"
    :visible="visible"
    width="50%"
    :before-close="handleClose"
  >
    <KeyValue
      key="annotations"
      v-model="spec.metadata.annotations"
      :mode="mode"
      :initial-empty-row="true"
      :pad-left="false"
      :read-allowed="false"
    />
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
      <el-button type="primary" @click="save">保 存</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.tip {
  font-size: 13px;
  font-style: italic;
}
</style>
