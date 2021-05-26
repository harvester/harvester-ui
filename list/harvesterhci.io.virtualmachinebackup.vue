<script>
import { allHash } from '@/utils/promise';
import Banner from '@/components/Banner';
import { STATE, AGE, NAME } from '@/config/table-headers';
import Loading from '@/components/Loading';
import ResourceTable from '@/components/ResourceTable';
import { HCI } from '@/config/types';
import Masthead from '@/components/ResourceList/Masthead';

export default {
  name:       'ListBackup',
  components: {
    ResourceTable, Banner, Loading, Masthead
  },

  props: {
    schema: {
      type:     Object,
      required: true,
    }
  },

  async fetch() {
    const hash = await allHash({
      settings: this.$store.dispatch('cluster/findAll', { type: HCI.SETTING }),
      rows:             this.$store.dispatch('cluster/findAll', { type: HCI.BACKUP }),
    });

    this.rows = hash.rows;
    this.settings = hash.settings;
  },

  data() {
    const params = { ...this.$route.params };

    const resource = params.resource;

    return {
      rows:     [],
      settings: [],
      resource
    };
  },

  computed: {
    headers() {
      return [
        { ...STATE },
        {
          ...NAME,
          width: 200
        },
        {
          name:      'sourceName',
          labelKey:  'harvester.tableHeaders.targetVm',
          value:     'attachVM',
          align:     'left',
          formatter: 'AttachVMWithName'
        },
        {
          name:      'backupTarget',
          labelKey:  'harvester.tableHeaders.backupTarget',
          value:     'backupTarget',
          align:     'left',
          formatter: 'BackupTargetValidation'
        },
        {
          name:     'readyToUse',
          labelKey:  'harvester.tableHeaders.readyToUse',
          value:    'status.readyToUse',
          align:    'left',
        },
        AGE
      ];
    },

    backupTargetResource() {
      return this.settings.find( O => O.id === 'backup-target');
    },

    backupLength() {
      const choices = this.$store.getters['cluster/all'](HCI.BACKUP);

      return choices.length;
    },

    isEmptyValue() {
      return !this.backupTargetResource.value && !this.backupTargetResource?.errorBackupTargetMessage;
    },

    hasBakcupError() {
      return this.backupTargetResource?.bakcupError;
    },

    errorMessage() {
      return this.backupTargetResource?.errorBackupTargetMessage;
    },
  },

  watch: {
    hasBakcupError: {
      handler(neu) {
        const type = this.$route.params.resource;
        const setting = !!neu ? '' : 'harvesterhci.io.setting/backup-target?mode=edit';

        this.$store.commit('cluster/setConfig', {
          type,
          data: {
            disableCreateButton: neu,
            setting
          }
        });
      },
      immediate: true
    }
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <Masthead
      :schema="schema"
      :resource="resource"
      :create-button-label="t('harvester.backUpPage.createText')"
    >
    </Masthead>

    <Banner
      v-if="hasBakcupError"
      color="error"
    >
      <div v-if="isEmptyValue">
        {{ t('harvester.backUpPage.message.noSetting.prefix') }}
        <nuxt-link to="harvesterhci.io.setting/backup-target?mode=edit">
          {{ t('harvester.backUpPage.message.noSetting.middle') }}
        </nuxt-link>
        {{ t('harvester.backUpPage.message.noSetting.suffic') }}
      </div>

      <div v-else>
        {{ t('harvester.backUpPage.message.errorTip.prefix') }}
        <nuxt-link to="harvesterhci.io.setting/backup-target?mode=edit">
          {{ t('harvester.backUpPage.message.errorTip.middle') }}
        </nuxt-link> {{ t('harvester.backUpPage.message.errorTip.suffic') }} {{ errorMessage }}
      </div>
    </Banner>

    <ResourceTable
      v-bind="$attrs"
      :headers="headers"
      default-sort-by="age"
      :groupable="true"
      :rows="[...rows]"
      key-field="_key"
      v-on="$listeners"
    />
  </div>
</template>
