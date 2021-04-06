<script>
import { createNamespacedHelpers, mapGetters } from 'vuex';
import AsyncButton from '@/components/AsyncButton';
import Card from '@/components/Card';
import { exceptionToErrorsArray } from '@/utils/error';
import LabeledSelect from '@/components/form/LabeledSelect';
import { HOST_CUSTOM_NAME } from '@/config/labels-annotations';
import { NODE, VMI } from '@/config/types';

const { mapState } = createNamespacedHelpers('kubevirt.io.virtualmachine');

export default {
  components: {
    Card,
    AsyncButton,
    LabeledSelect,
  },

  data() {
    return { nodeName: '' };
  },

  computed:   {
    ...mapState(['isShowMigration', 'actionResources']),
    ...mapGetters({ t: 'i18n/t' }),

    vmi() {
      const vmiResources = this.$store.getters['cluster/all'](VMI);
      const resource = vmiResources.find(VMI => VMI.id === this.actionResources?.id) || null;

      return resource;
    },

    nodeNameList() {
      const nodes = this.$store.getters['cluster/all'](NODE);

      return nodes.filter((n) => {
        // do not allow to migrate to self node
        return n.id !== this.vmi?.status?.nodeName;
      }).map((n) => {
        let label = n?.metadata?.name;
        const value = n?.metadata?.name;
        const custom = n?.metadata?.annotations?.[HOST_CUSTOM_NAME];

        if (custom) {
          label = custom;
        }

        return {
          label,
          value
        };
      });
    },
  },

  watch: {
    isShowMigration: {
      handler(show) {
        if (show) {
          this.$nextTick(() => {
            this.$modal.show('migration-modal');
          });
        } else {
          this.$modal.hide('migration-modal');
        }
      },
      immediate: true
    },
  },

  methods: {
    close() {
      this.$store.commit('kubevirt.io.virtualmachine/toggleMigrationModal');
      this.nodeName = '';
    },

    async apply(buttonDone) {
      if (!this.actionResources) {
        return buttonDone(false);
      }

      if (!this.nodeName) {
        const name = this.$store.getters['i18n/t']('harvester.vmPage.migrationModal.fields.nodeName.label');
        const message = this.$store.getters['i18n/t']('validation.required', { key: name });

        this.$notify({
          title:    this.t('harvester.notification.title.warning'),
          duration: 5000,
          message,
          type:     'warning'
        });

        return buttonDone(false);
      }

      try {
        await this.actionResources.doAction('migrate', { nodeName: this.nodeName });

        buttonDone(true);
        this.close();
      } catch (err) {
        this.$notify({
          title:    this.t('harvester.notification.title.error'),
          duration: 0,
          message:  err?.data || exceptionToErrorsArray(err) || err,
          type:     'error'
        });

        buttonDone(false);
      }
    },

  }
};
</script>

<template>
  <modal
    class="migration-modal"
    name="migration-modal"
    styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 100vh;"
    height="auto"
    :scrollable="true"
    :click-to-close="false"
  >
    <Card>
      <h4 slot="title" class="text-default-text">
        {{ t('harvester.vmPage.migrationModal.title') }}
      </h4>

      <div slot="body" class="pl-10 pr-10">
        <LabeledSelect
          v-model="nodeName"
          :label="t('harvester.vmPage.migrationModal.fields.nodeName.label')"
          :placeholder="t('harvester.vmPage.migrationModal.fields.nodeName.placeholder')"
          :options="nodeNameList"
        />
      </div>

      <div slot="actions">
        <button class="btn role-secondary" @click="close">
          {{ t('generic.cancel') }}
        </button>

        <AsyncButton
          mode="apply"
          @click="apply"
        />
      </div>
    </Card>
  </modal>
</template>

<style lang='scss'>
  .migration-modal {
    border-radius: var(--border-radius);
    overflow: scroll;
    max-height: 100vh;
    & ::-webkit-scrollbar-corner {
      background: rgba(0,0,0,0);
    }
  }
</style>
