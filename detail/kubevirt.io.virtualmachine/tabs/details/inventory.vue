<script>
import ModalWithCard from '@/components/ModalWithCard';
import NetworkModal from '@/components/form/NetworkModal';
import SortableTable from '@/components/SortableTable';
import VM_MIXIN from '@/mixins/vm';
import Checkbox from '@/components/form/Checkbox';

export default {
  name: 'Inventory',

  components: {
    Checkbox,
    NetworkModal,
    SortableTable,
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
      nameString: '',
      rows:       [],
      hasChecked: false
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
      return this.value.hasAction('ejectCdRom') && this.hasChecked;
    },
    hasAction() {
      return this.value.hasAction('ejectCdRom');
    },
    headers() {
      const out = [{
        name:  'name',
        label: 'Name',
        value: 'name',
      },
      {
        name:  'Source',
        label: 'Source',
        value: 'source',
      },
      {
        name:      'Size',
        label:     'Size',
        value:     'size',
      },
      {
        name:  'Interface',
        label: 'Bus',
        value: 'bus',
      },
      {
        name:  'Storage Class',
        label: 'Storage Class',
        value: 'storageClassName',
      }, {
        name:  'bootOrder',
        label: 'Boot Order',
        value: 'bootOrder',
      }];

      out.unshift({
        name:      '',
        label:     '',
        value:     '',
        width:      30,
      });

      return out;
    },
  },
  watch: {
    value: {
      handler(neu) {
        this.$set(this, 'spec', this.value.spec);
      },
      deep: true
    },
    diskRows: {
      handler(neu) {
        this.rows = neu;
      },
      deep: true
    },
    rows: {
      handler(neu) {
        this.getCheckCdrow();
      },
      deep: true
    },
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

      this.hasChecked = false;

      for (let i = 0; i < this.diskRows.length; i++) {
        if (this.diskRows[i]?.isEjectCdRow) {
          this.hasChecked = true;
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

    <SortableTable
      class="mb-20"
      key-field="id"
      :rows="rows"
      :search="false"
      :headers="headers"
      :row-actions-width="160"
      :row-actions="false"
      :table-actions="false"
    >
      <template slot="cell:" slot-scope="scope" class="state-col">
        <div class="state">
          <Checkbox v-if="scope.row.type === 'cd-rom'" v-model="scope.row.isEjectCdRow" class="selection-checkbox" :disabled="!hasAction" type="checkbox" />
        </div>
      </template>
    </SortableTable>

    <h2>Networks</h2>
    <NetworkModal v-model="networkRows" :row-actions="false" />

    <ModalWithCard ref="CDROM" name="CDROM" close-text="No" save-text="Yes" @beforeClose="beforeClose">
      <template #title>
        Eject CDROM
      </template>

      <template #content>
        Are you sure you want to eject CD-ROM
        <span class="text-info">{{ nameString }}</span>, this action will restart the virtual machine
      </template>
    </ModalWithCard>
  </div>
</template>
