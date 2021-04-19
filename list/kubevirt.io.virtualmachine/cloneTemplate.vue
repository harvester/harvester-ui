<script>
import { exceptionToErrorsArray } from '@/utils/error';
import { createNamespacedHelpers, mapGetters } from 'vuex';
import LabeledInput from '@/components/form/LabeledInput';

const { mapState } = createNamespacedHelpers('kubevirt.io.virtualmachine');

export default {
  name: 'RestoreModal',

  components: { LabeledInput },

  data() {
    return {
      templateName: '',
      description:  ''
    };
  },

  computed: {
    ...mapState(['actionResources', 'isShowCloneTemplate']),
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
    isShowCloneTemplate: {
      handler(show) {
        if (show) {
          this.$nextTick(() => {
            this.$modal.show('cloneVM-modal');
          });
        } else {
          this.$modal.hide('cloneVM-modal');
        }
      },
      immediate: true
    }
  },

  methods: {
    closeModal() {
      this.$store.commit('kubevirt.io.virtualmachine/toggleCloneTemplateModal');
      this.templateName = '';
      this.description = '';
    },

    async saveRestore() {
      if (!this.templateName) {
        this.$notify({
          title:    this.t('harvester.notification.title.warning'),
          duration: 5000,
          message:  this.t('harvester.vmPage.createTemplate.message.tip'),
          type:     'warning'
        });

        return;
      }

      try {
        const res = await this.actionResources.doAction('createTemplate', { name: this.templateName, description: this.description });

        if (res._status === 200 || res._status === 204) {
          this.$notify({
            title:    this.t('harvester.notification.title.succeed'),
            message:  this.t('harvester.vmPage.createTemplate.message.success', { templateName: this.templateName }),
            type:     'success'
          });
        }

        this.closeModal();
      } catch (err) {
        this.$notify({
          title:    this.t('harvester.notification.title.error'),
          duration: 0,
          message:  err?.data || exceptionToErrorsArray(err) || err,
          type:     'error'
        });

        this.closeModal();
      }
    }
  },
};
</script>

<template>
  <modal
    styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 100vh;"
    name="cloneVM-modal"
    :click-to-close="false"
    :width="800"
    :height="260"
    :pivot-y="0.001"
  >
    <div class="p-20">
      <h2>{{ t('harvester.vmPage.createTemplate.title') }}</h2>
      <div>
        <LabeledInput
          v-model="templateName"
          class="mb-20"
          :label="t('harvester.vmPage.createTemplate.fields.name')"
        />

        <LabeledInput
          v-model="description"
          :label="t('harvester.vmPage.createTemplate.fields.description')"
        />
      </div>

      <div class="footer mt-20">
        <button class="btn btn-sm role-secondary mr-10" @click="closeModal">
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
