<script>
import { IMAGE } from '@/config/types';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';

export default {
  name: 'Overview',

  components: {
    Tab,
    Tabbed
  },

  props: {
    mode: {
      type:     String,
      required: true,
    },
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    const container = this.value?.source?.registry?.url || '';
    const inter = 'virtio';

    return {
      inter,
      container,
      isShowAdvanced: false,
    };
  },

  computed: {
    description() {
      return this.value.metadata.description || '-';
    },

    source() {
      return this.value.spec?.source?.blank ? 'blank' : this.value?.source?.registry?.url ? 'container' : 'VM Image';
    },

    image() {
      const imageList = this.$store.getters['cluster/all'](IMAGE) || [];
      // const source = this.value.spec?.source?.blank ? 'blank' : this.value.spec?.source?.registry?.url ? 'container' : 'VM Image'; // eslint-disable-line
      // const image = source === 'VM Image' ? this.value.spec?.source?.http?.url : '-'; // eslint-disable-line

      const imageId = this.value?.metadata?.annotations?.['harvester.cattle.io/imageId'] || '';
      const imageResource = imageList.find( I => imageId === I.id);

      return imageResource?.spec?.displayName || '-';
    },

    storage() {
      return this.value.spec.pvc?.resources?.requests?.storage || '-';
    },

    storageClassName() {
      return this.value.spec?.pvc?.storageClassName || '-';
    },

    accessMode() {
      return this.value.spec?.pvc?.accessModes?.[0] || '-';
    },

    volumeMode() {
      return this.value.spec?.pvc?.volumeMode || '-';
    }
  }

};
</script>

<template>
  <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
    <Tab name="detail" :label="t('harvester.vmPage.detail.tabs.basics')" class="bordered-table">
      <div class="row mb-15">
        <div class="col span-4">
          <div class="labeled-input view">
            <label>
              {{ t('harvester.volumePage.source') }}
            </label>
            <div>
              {{ source }}
            </div>
          </div>
        </div>

        <div v-if="source !== 'blank'" class="col span-4">
          <div class="labeled-input view">
            <label>
              {{ t('harvester.volumePage.image') }}
            </label>
            <div>
              {{ image }}
            </div>
          </div>
        </div>

        <div class="col span-4">
          <div class="labeled-input view">
            <label>
              {{ t('harvester.volumePage.size') }}
            </label>
            <div>
              {{ storage }}
            </div>
          </div>
        </div>
      </div>
    </Tab>
  </Tabbed>
</template>

<style lang="scss">

</style>
