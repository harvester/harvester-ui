<script>
import DiskModal from '@/components/form/DiskModal';
import NetworkModal from '@/components/form/NetworkModal';
import VM_MIXIN from '@/mixins/vm';

export default {
  name: 'Inventory',

  components: {
    DiskModal,
    NetworkModal,
  },

  mixins: [VM_MIXIN],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    return { spec: this.value.spec };
  },

  computed: {
    nics() {
      const count = this.value?.spec?.template?.spec?.domain?.devices?.interfaces?.length || 0;
      const unit = count > 1 ? 'NICs' : 'NIC';

      return `${ count } ${ unit }`;
    },
    disks() {
      const count = this.value?.spec?.template?.spec?.domain?.devices?.disks?.length || 0;
      const unit = count > 1 ? 'DISKs' : 'DISK';

      return `${ count } ${ unit }`;
    },
  },
};
</script>

<template>
  <div class="vm-inventory">
    <h2>Disks</h2>
    <DiskModal v-model="diskRows" :row-actions="false" />
    <el-divider></el-divider>
    <h2>Networks</h2>
    <NetworkModal v-model="networkRows" :row-actions="false" />
  </div>
</template>

<style lang="scss" scoped></style>
