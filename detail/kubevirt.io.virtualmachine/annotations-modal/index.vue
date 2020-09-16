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
      this.$emit('close');
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
    <span slot="footer">
      <button class="btn role-secondary btn-sm mr-20" @click="handleClose">
        Close
      </button>
      <button class="btn role-tertiary bg-primary btn-sm mr-20" @click="save">
        Save
      </button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.tip {
  font-size: 13px;
  font-style: italic;
}
</style>
