<script>
import DiskModal from '@/components/form/DiskModal';
import ModalWithCard from '@/components/ModalWithCard';
import NetworkModal from '@/components/form/NetworkModal';
import VM_MIXIN from '@/mixins/vm';

export default {
  name: 'Inventory',

  components: {
    DiskModal,
    NetworkModal,
    ModalWithCard
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
      spec:       this.value.spec,
      cdrowName:  [],
      nameString: ''
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
      const nameString = diskNames.join(', ');

      if (diskNames.length === 0) {
        return;
      }
      this.nameString = nameString;

      this.$refs.CDROM.open();
    },
    getCheckCdrow() {
      const diskNames = [];

      for (let i = 0; i < this.diskRows.length; i++) {
        if (this.diskRows[i]?.isEjectCdRow) {
          diskNames.push(this.diskRows[i].name);
        }
      }

      return diskNames;
    },

    async beforeClose(event) {
      const diskNames = this.getCheckCdrow();

      try {
        await this.value.doAction('ejectCdRom', { diskNames });
        this.$refs.CDROM.hide();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    }
  }
};
</script>

<template>
  <div class="vm-inventory">
    <h2>Disks</h2>
    <button type="button" class="btn btn-sm bg-primary mb-10" :disabled="!showEjectAction" @click="ejectCdrow">
      Eject CDROM
    </button>
    <DiskModal v-model="diskRows" class="mb-20" :row-actions="false" :is-eject-cdrow="true" />

    <h2>Networks</h2>
    <NetworkModal v-model="networkRows" :row-actions="false" />

    <ModalWithCard ref="CDROM" name="CDROM" close-text="No" save-text="Yes" @beforeClose="beforeClose">
      <template #title>
        Eject CD-ROM
      </template>

      <template #content>
        {{ `Are you sure you want to eject CD-ROM ${ nameString } ,this action will restart the virtual machine` }}
      </template>
    </ModalWithCard>
  </div>
</template>
