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
    }
  },

  data() {
    return {
      spec:      this.value.spec,
      cdrowName: []
    };
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
    showEjectAction() {
      return this.value.hasAction('ejectCdRom');
    }
  },
  watch: {
    value: {
      handler(neu) {
        this.$set(this, 'spec', this.value.spec);
      },
      deep: true
    }
  },

  methods: {
    ejectCdrow() {
      const diskNames = this.getCheckCdrow();
      const nameSring = diskNames.join(', ');

      if (diskNames.length === 0) {
        return;
      }

      this.$confirm(`Are you sure you want to eject CD-ROM ${ nameSring } ,this action will restart the virtual machine`, 'Eject CD-ROM', {
        confirmButtonText:  'Yes',
        cancelButtonText:   'No',
        cancelButtonClass:  'bg-primary',
        confirmButtonClass: 'bg-primary'
      })
        .then(async() => {
          await this.value.doAction('ejectCdRom', { diskNames });
        });
    },
    getCheckCdrow() {
      const diskNames = [];

      for (let i = 0; i < this.diskRows.length; i++) {
        if (this.diskRows[i]?.isEjectCdRow) {
          diskNames.push(this.diskRows[i].name);
        }
      }

      return diskNames;
    }
  }
};
</script>

<template>
  <div class="vm-inventory">
    <h2>Disks</h2>
    <button type="button" class="btn btn-sm bg-primary mb-10" :disabled="!showEjectAction" @click="ejectCdrow">
      Eject CD-ROW
    </button>
    <DiskModal v-model="diskRows" :row-actions="false" :is-eject-cdrow="true" />
    <el-divider></el-divider>
    <h2>Networks</h2>
    <NetworkModal v-model="networkRows" :row-actions="false" />
  </div>
</template>
