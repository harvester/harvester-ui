<script>
import LabeledSelect from '@/components/form/LabeledSelect';
import LabeledInput from '@/components/form/LabeledInput';
import UnitInput from '@/components/form/UnitInput';
import { sortBy } from '@/utils/sort';
import { formatSi, parseSi } from '@/utils/units';
import { IMAGE } from '@/config/types';
import { InterfaceOption } from '@/config/map';

export default {
  components: {
    LabeledSelect,
    UnitInput,
    LabeledInput,
  },

  props: {
    value: {
      type:    Object,
      default: () => {
        return {};
      }
    },

    mode: {
      type:    String,
      default: ''
    }
  },

  data() {
    const source = this.value?.source?.blank ? 'blank' : this.value?.source?.registry?.url ? 'container' : 'url';
    const image = source === 'url' ? this.$store.getters['cluster/all'](IMAGE).find( (I) => {
      return I?.status?.downloadUrl === this.value?.source?.http?.url;
    })?.id : '';

    const container = this.value?.source?.registry?.url || '';
    const storage = this.getSize(this.value.pvc?.resources?.requests?.storage || null);
    const inter = 'virtio';

    return {
      inter,
      container,
      image,
      source,
      storage,
    };
  },

  computed: {
    isCreate() {
      return this.mode === 'create';
    },

    isBlank() {
      return this.source === 'blank';
    },

    isVmImage() {
      return this.source === 'url';
    },

    isContainer() {
      return this.source === 'container';
    },

    sourceOption() {
      return [{
        value: 'blank',
        label: 'New'
      }, {
        value: 'url',
        label: 'VM Image'
      }
      // , {
      //   value: 'container',
      //   label: 'Container'
      // },
      // {
      //   value: 'pvc',
      //   label: 'Clone Disk'
      // }, {
      //   value: 'existingPVC',
      //   label: 'Use Existing PVC'
      // }
      ];
    },

    interfaceOption() {
      return InterfaceOption;
    },

    ImageOption() {
      const choices = this.$store.getters['cluster/all'](IMAGE);

      return sortBy(
        choices
          .map((obj) => {
            return {
              label: obj.spec.displayName,
              value: obj.id
            };
          }),
        'label'
      );
    },

    imgUrl() {
      const choices = this.$store.getters['cluster/all'](IMAGE);

      return choices.find( (I) => {
        return I.id === this.image;
      })
      ?.status?.downloadUrl;
    }
  },

  methods: {
    update() {
      let source = null;
      let imageAnnotations = '';

      if (this.isBlank) {
        source = { blank: {} };
      }

      if (this.isVmImage) {
        source = { http: { url: this.imgUrl } };
      }

      if (this.isVmImage && this.image) {
        imageAnnotations = { 'harvester.cattle.io/imageId': this.image };
      } else {
        imageAnnotations = {};
      }

      const spec = {
        ...this.value,
        pvc: {
          ...this.value.pvc,
          resources: { requests: { storage: this.storage ? `${ this.storage }Gi` : null } },
        },
        source,
      };

      this.$emit('update:annotation', imageAnnotations);

      this.$emit('input', spec);
    },

    getSize(storage) {
      if (!storage) {
        return null;
      }

      const kibUnitSize = parseSi(storage);

      return formatSi(kibUnitSize, {
        addSuffix:   false,
        increment:   1024,
        minExponent: 3,
        maxExponent: 3
      });
    }
  }
};
</script>

<template>
  <div @input="update">
    <LabeledSelect
      v-model="source"
      label="Source"
      :options="sourceOption"
      :disabled="!isCreate"
      required
      :mode="mode"
      class="mb-20"
      @input="update"
    />

    <LabeledInput
      v-if="isContainer"
      v-model="container"
      label="Container Image"
      class="mb-20"
      :mode="mode"
      required
    />

    <LabeledSelect
      v-if="isVmImage"
      v-model="image"
      label="Select an Image"
      :options="ImageOption"
      :disabled="!isCreate"
      required
      :mode="mode"
      class="mb-20"
      @input="update"
    />

    <UnitInput
      v-model="storage"
      label="Size"
      suffix="iB"
      :input-exponent="3"
      :output-exponent="3"
      :disabled="!isCreate"
      required
      class="mb-20"
      @input="update"
    />
  </div>
</template>
