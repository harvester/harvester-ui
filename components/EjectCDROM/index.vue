<script>
import { mapState, mapGetters } from 'vuex';
import Card from '@/components/Card';
import Banner from '@/components/Banner';
import CDROMS from './cdroms';

export default {
  components: {
    Card, CDROMS, Banner
  },

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
    width="400"
    height="auto"
    :scrollable="true"
  >
    <Card>
      <h4 slot="title" class="text-default-text">
        {{ t('harvester.vmPage.modal.ejectCDROM.title') }}
      </h4>

      <div slot="body" class="pl-10 pr-10">
        <span class="text-info">
          {{ t('harvester.vmPage.modal.ejectCDROM.operationTip') }}
        </span>
        <CDROMS v-model="toEject" class="mt-15" @change="updateNames" />

        <Banner color="warning">
          <span>{{ t('harvester.vmPage.modal.ejectCDROM.warnTip') }}</span>
        </Banner>
      </div>

      <template slot="actions">
        <div class="actions">
          <button class="btn role-secondary" @click="close">
            {{ t('generic.cancel') }}
          </button>

          <button class="btn bg-error ml-20" :disabled="isDeleteDisabled" @click="remove">
            {{ t('harvester.vmPage.modal.ejectCDROM.delete') }}
          </button>
        </div>
      </template>
    </Card>
  </modal>
</template>

<style lang='scss' scoped>
  .eject-modal {
    border-radius: var(--border-radius);
    overflow: scroll;
    max-height: 100vh;
    & ::-webkit-scrollbar-corner {
      background: rgba(0,0,0,0);
    }

    .actions {
      display: flex;
      width: 100%;
      justify-content: center;
    }
  }
</style>
