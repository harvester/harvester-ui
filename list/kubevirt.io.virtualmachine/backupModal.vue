<script>
import { createNamespacedHelpers } from 'vuex';
import { exceptionToErrorsArray } from '@/utils/error';
import LabeledInput from '@/components/form/LabeledInput';

const { mapState } = createNamespacedHelpers('kubevirt.io.virtualmachine');

export default {
  name: 'BackupModal',

  components: { LabeledInput },

  data() {
    return { backUpName: '' };
  },

  computed: { ...mapState(['isShowBackUp', 'actionResources']) },

  watch: {
    isShowBackUp: {
      handler(show) {
        if (show) {
          this.$nextTick(() => {
            this.$modal.show('backup-modal');
          });
        } else {
          this.$modal.hide('backup-modal');
        }
      },
      immediate: true
    },
  },

  methods: {
    close() {
      this.$store.commit('kubevirt.io.virtualmachine/toggleBackupModal');
      this.backUpName = '';
    },

    async save() {
      if (this.actionResources) {
        if (!this.backUpName) {
          const name = this.$store.getters['i18n/t']('harvester.fields.name');
          const message = this.$store.getters['i18n/t']('validation.required', { key: name });

          this.$notify({
            duration: 5000,
            title:    'Warning',
            message,
            type:     'warning'
          });

          return;
        }

        try {
          const res = await this.actionResources.doAction('backup', { name: this.backUpName });

          this.$store.commit('kubevirt.io.virtualmachine/toggleBackupModal');

          if (res._status === 200 || res._status === 204) {
            this.$notify({
              duration: 5000,
              title:    'Succeed',
              message:  `Backup ${ this.backUpName } successfully created`,
              type:     'success'
            });
          }

          this.backUpName = '';
        } catch (err) {
          this.$notify({
            duration: 0,
            title:    'Error',
            message:  err?.data || exceptionToErrorsArray(err) || err,
            type:     'error'
          });
        }
      }
    },
  }
};
</script>

<template>
  <modal
    styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 100vh;"
    name="backup-modal"
    :click-to-close="false"
    :width="800"
    :height="180"
    :pivot-y="0.001"
  >
    <div class="p-20">
      <h2>{{ t('harvester.backUpPage.backupModal.addBackup') }}</h2>
      <LabeledInput
        v-model="backUpName"
        :label="t('generic.name')"
      />

      <div class="footer mt-20">
        <button class="btn btn-sm role-secondary mr-10" @click="close">
          {{ t('generic.close') }}
        </button>

        <button class="btn btn-sm bg-primary" @click="save">
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
