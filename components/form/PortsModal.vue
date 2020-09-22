<script>
import PortInputGroup from '@/components/form/PortInputGroup';

export default {
  components: { PortInputGroup },

  props: {
    visible: {
      type:    Boolean,
      default: false
    },
    rows: {
      type:    Object,
      default: () => {
        return {};
      }
    }
  },

  data() {
    return { dialogVisible: false };
  },

  methods: {
    handleClose() {
      this.$emit('close');
    },
  }
};
</script>

<template>
  <el-dialog
    title="View Ports"
    :visible="visible"
    width="50%"
    :before-close="handleClose"
  >
    <PortInputGroup v-model="rows" mode="view" />
    <span slot="footer">
      <button class="btn role-secondary btn-sm mr-20" @click="handleClose">
        Close
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
