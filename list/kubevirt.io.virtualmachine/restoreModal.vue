<script>
import randomstring from 'randomstring';
import { exceptionToErrorsArray } from '@/utils/error';
import { HARVESTER_BACKUP } from '@/config/types';
import { allHash } from '@/utils/promise';
import { createNamespacedHelpers, mapGetters } from 'vuex';
import LabeledSelect from '@/components/form/LabeledSelect';

const { mapState } = createNamespacedHelpers('kubevirt.io.virtualmachine');

export default {
  name: 'RestoreModal',

  components: { LabeledSelect },

  async fetch() {
    const hash = await allHash({ backups: this.$store.dispatch('cluster/findAll', { type: HARVESTER_BACKUP }) });

    this.backups = hash.backups;
  },

  data() {
    return {
      backups:    [],
      backupName: ''
    };
  },

  computed: {
    ...mapState(['actionResources', 'isShowRestore']),
    ...mapGetters({ t: 'i18n/t' }),

    backupOption() {
      const attachBackup = this.backups.filter( (B) => {
        return B.attachVM === this.actionResources?.metadata?.name;
      });

      return attachBackup.map( (O) => {
        return {
          value: O.metadata.name,
          label: O.metadata.name
        };
      });
    },
  },

  watch: {
    isShowRestore: {
      handler(show) {
        if (show) {
          this.$nextTick(() => {
            this.$modal.show('restore-modal');
          });
        } else {
          this.$modal.hide('restore-modal');
        }
      },
      immediate: true
    }
  },

  methods: {
    closeRestore() {
      this.$store.commit('kubevirt.io.virtualmachine/toggleRestoreModal');
      this.backupName = '';
    },

    async saveRestore() {
      const name = `restore-${ this.backupName }-${ randomstring.generate(5).toLowerCase() }`;

      if (!this.backupName) {
        this.$notify({
          title:    this.t('harvester.notification.title.warning'),
          duration: 5000,
          message:  this.t('harvester.backUpPage.restoreModal.message.backup'),
          type:     'warning'
        });

        return;
      }

      try {
        const res = await this.actionResources.doAction('restore', { backupName: this.backupName, name });

        if (res._status === 200 || res._status === 204) {
          this.$notify({
            title:    this.t('harvester.notification.title.succeed'),
            message:  `Restore ${ this.backupName } succeed`,
            type:     'success'
          });
        }

        this.closeRestore();
      } catch (err) {
        this.$notify({
          title:    this.t('harvester.notification.title.error'),
          duration: 0,
          message:  err?.data || exceptionToErrorsArray(err) || err,
          type:     'error'
        });

        this.closeRestore();
      }
    }
  },
};
</script>

<template>
  <modal
    styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 100vh;"
    name="restore-modal"
    :click-to-close="false"
    :width="800"
    :height="180"
    :pivot-y="0.001"
  >
    <div class="p-20">
      <h2>{{ t('harvester.backUpPage.restoreModal.title') }}</h2>
      <div>
        <LabeledSelect
          v-model="backupName"
          :label="t('harvester.backUpPage.restoreModal.selectBackup')"
          :localized-label="true"
          :options="backupOption"
        />
      </div>

      <div class="footer mt-20">
        <button class="btn btn-sm role-secondary mr-10" @click="closeRestore">
          {{ t('generic.close') }}
        </button>

        <button class="btn btn-sm bg-primary" @click="saveRestore">
          {{ t('generic.create') }}
        </button>
      </div>
    </div>
  </modal>
</template>

<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: center;
}
</style>
