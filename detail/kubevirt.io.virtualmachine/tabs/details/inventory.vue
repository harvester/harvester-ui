<script>
import { allHash } from '@/utils/promise';
import { SSH } from '@/config/types';
import DiskModal from '@/components/form/DiskModal';
import NetworkModal from '@/components/form/NetworkModal';
import VM_MIXIN from '@/mixins/vm';
import SSHModal from '../../ssh-modal/';

export default {
  name: 'Inventory',

  components: {
    SSHModal,
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

  async fetch() {
    const hash = await allHash({ ssh: this.$store.dispatch('cluster/findAll', { type: SSH }) });
  },

  data() {
    return {
      sshKeysShow: false,

      spec: this.value.spec
    };
  },

  computed: {
    ssh() {
      const ssh = this.$store.getters['cluster/all'](SSH);

      return ssh;
    },
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

  watch: {},

  methods: {
    toggleModal(b) {
      this.sshKeysShow = b;
    }
  }
};
</script>

<template>
  <div class="vm-inventory">
    <h2>Disks</h2>
    <DiskModal v-model="diskRows" :can-edit="false" />
    <el-divider></el-divider>
    <h2>Networks</h2>
    <NetworkModal v-model="networkRows" :can-edit="false" />

    <SSHModal
      v-model="ssh"
      :visible="sshKeysShow"
      @close="toggleModal(false)"
    />
  </div>
</template>

<style lang="scss" scoped></style>
