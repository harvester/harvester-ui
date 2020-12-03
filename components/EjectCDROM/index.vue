<script>
import { mapState, mapGetters } from 'vuex';
import Card from '@/components/Card';
import CDROMS from './cdroms';

export default {
  components: { Card, CDROMS },

  data() {
    return { diskNames: [] };
  },

  computed:   {
    ...mapState('action-menu', ['showEjectCDROM', 'toEject']),
    ...mapGetters({ t: 'i18n/t' }),

    isDeleteDisabled() {
      return this.diskNames.length === 0;
    }

  },

  watch: {
    showEjectCDROM(show) {
      if (show) {
        this.$modal.show('ejectCDROM');
      } else {
        this.$modal.hide('ejectCDROM');
      }
      this.diskNames = [];
    }
  },

  methods: {
    close() {
      this.$store.commit('action-menu/toggleEjectCDROM');
    },

    updateNames(names) {
      this.diskNames = names;
    },

    async remove() {
      try {
        await this.toEject.doAction('ejectCdRom', { diskNames: this.diskNames });
        this.close();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    },

  }
};
</script>

<template>
  <modal
    class="eject-modal"
    name="ejectCDROM"
    styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 100vh;"
    height="auto"
    :scrollable="true"
  >
    <Card>
      <h4 slot="title" class="text-default-text">
        Eject CDROM
      </h4>

      <div slot="body" class="pl-10 pr-10">
        <span class="text-info">Select the volume you want to delete:</span>
        <CDROMS v-model="toEject" class="mt-15" @change="updateNames" />
      </div>

      <div slot="actions">
        <button class="btn role-secondary" @click="close">
          Cancel
        </button>

        <button class="btn bg-error" :disabled="isDeleteDisabled" @click="remove">
          Delete
        </button>
      </div>
    </Card>
  </modal>
</template>

<style lang='scss'>
  .eject-modal {
    border-radius: var(--border-radius);
    overflow: scroll;
    max-height: 100vh;
    & ::-webkit-scrollbar-corner {
      background: rgba(0,0,0,0);
    }
  }
</style>
