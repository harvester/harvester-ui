<script>
import { IMAGE } from '@/config/types';

export default {
  name: 'Overview',

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
  <div class="mt-20">
    <div class="row mb-15">
      <div class="col span-4">
        <div class="labeled-input view">
          <label>
            Source
          </label>
          <div>
            {{ source }}
          </div>
        </div>
      </div>

      <div v-if="source !== 'blank'" class="col span-4">
        <div class="labeled-input view">
          <label>
            Image
          </label>
          <div>
            {{ image }}
          </div>
        </div>
      </div>

      <div class="col span-4">
        <div class="labeled-input view">
          <label>
            Storage
          </label>
          <div>
            {{ storage }}
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col span-4">
        <div class="labeled-input view">
          <label>
            StorageClass
          </label>
          <div>
            {{ storageClassName }}
          </div>
        </div>
      </div>

      <div class="col span-4">
        <div class="labeled-input view">
          <label>
            AccessMode
          </label>
          <div>
            {{ accessMode }}
          </div>
        </div>
      </div>

      <div class="col span-4">
        <div class="labeled-input view">
          <label>
            VolumeMode
          </label>
          <div>
            {{ volumeMode }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">

</style>
