<script>
import LabeledInput from '@/components/form/LabeledInput';

export default {
  components: { LabeledInput },

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
    return { dialogVisible: false, description: null };
  },

  methods: {
    open() {
      this.description = this.spec?.metadata?.annotations?.description;
    },
    handleClose() {
      this.$emit('close');
    },
    save() {
      this.$set(this.spec.metadata.annotations, 'description', this.description);
      this.$emit('update');
      this.$emit('close');
    },
  }
};
</script>

<template>
  <el-dialog
    title="Edit Description"
    :visible="visible"
    width="50%"
    :before-close="handleClose"
    @open="open"
  >
    <LabeledInput
      key="description"
      v-model="description"
      label="Description"
      :mode="mode"
      :min-height="30"
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
