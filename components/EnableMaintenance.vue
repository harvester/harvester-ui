<script>
import { mapState, mapGetters } from 'vuex';
import AsyncButton from '@/components/AsyncButton';
import Card from '@/components/Card';
import Banner from '@/components/Banner';
import { exceptionToErrorsArray } from '@/utils/error';

export default {
  components: {
    Card,
    AsyncButton,
    Banner,
  },

  data() {
    return { errors: [] };
  },

  computed:   {
    ...mapState('action-menu', ['showEnableMaintenance', 'toEnable']),
    ...mapGetters({ t: 'i18n/t' }),
  },

  watch: {
    showEnableMaintenance(show) {
      if (show) {
        this.$modal.show('enableMaintenance');
      } else {
        this.$modal.hide('enableMaintenance');
      }
    }
  },

  methods: {
    close() {
      this.$store.commit('action-menu/toggleEnableMaintenance');
    },

    apply(buttonDone) {
      this.errors = [];

      try {
        this.toEnable.doAction('enableMaintenanceMode', {});
        buttonDone(true);
        this.close();
      } catch (e) {
        this.errors = exceptionToErrorsArray(e);
        buttonDone(false);
      }
    }
  }
};
</script>

<template>
  <modal
    class="maintenance-modal"
    name="enableMaintenance"
    styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 100vh;"
    height="auto"
    :scrollable="true"
  >
    <Card>
      <h4 slot="title" class="text-default-text">
        {{ t('enableMaintenance.title') }}
      </h4>

      <div slot="body" class="pl-10 pr-10">
        <Banner color="warning" :label="t('enableMaintenance.protip')" class="mt-20" />
        <Banner v-for="(err, i) in errors" :key="i" color="error" :label="err" />
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
  .maintenance-modal {
    border-radius: var(--border-radius);
    overflow: scroll;
    max-height: 100vh;
    & ::-webkit-scrollbar-corner {
      background: rgba(0,0,0,0);
    }
  }
</style>
