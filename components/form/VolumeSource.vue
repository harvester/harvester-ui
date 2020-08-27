<script>
import LabeledSelect from '@/components/form/LabeledSelect';
import LabeledInput from '@/components/form/LabeledInput';
import Collapse from '@/components/Collapse';
import MemoryUnit from '@/components/form/MemoryUnit';
import { sortBy } from '@/utils/sort';
import { STORAGE_CLASS, PVC, IMAGE } from '@/config/types';
import { InterfaceOption } from '@/config/map';

export default {
  components: {
    LabeledSelect,
    Collapse,
    MemoryUnit,
    LabeledInput
  },

  props: {
    value: {
      type:    Object,
      default: () => {
        return {};
      }
    }
  },

  data() {
    const source = this.value?.source?.blank ? 'blank' : this.value?.source?.registry?.url ? 'container' : 'url';
    const image = source === 'url' ? this.$store.getters['cluster/all'](IMAGE).find( (I) => {
      return I?.status?.downloadUrl === this.value?.source?.http?.url;
    })?.spec?.displayName : '';

    const accessMode = this.value?.pvc?.accessModes?.[0] || 'ReadWriteOnce';
    const storageClassName = this.value?.pvc?.storageClassName;
    const volumeMode = this.value?.pvc?.volumeMode || 'FileSystem';
    const container = this.value?.source?.registry?.url || '';
    const storage = this.value.pvc?.resources?.requests?.storage || '';
    const inter = 'virtio';

    return {
      inter,
      container,
      image,
      source,
      storage,
      accessMode,
      volumeMode,
      storageClassName,
      isShowAdvanced: false,
    };
  },

  computed: {
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
        label: 'Blank'
      }, {
        value: 'url',
        label: 'VM Image'
      }, {
        value: 'container',
        label: 'Container'
      },
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

    storageOption() {
      const choices = this.$store.getters['cluster/all'](STORAGE_CLASS);

      choices.map( (O) => {
        if (O.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class']) {
          this.storageClassName = O.metadata.name;
        }
      });

      return sortBy(
        choices
          .map((obj) => {
            return {
              label: obj.metadata.name,
              value: obj.metadata.name
            };
          }),
        'label'
      );
    },

    volumeModeOption() {
      return [{
        label: 'FileSystem',
        value: 'Filesystem'
      }, {
        label: 'Block',
        value: 'Block'
      }];
    },

    accessModeOption() {
      return [{
        label: 'Single User(RWO)',
        value: 'ReadWriteOnce'
      }, {
        label: 'Shared Access(RWX)',
        value: 'ReadWriteMany'
      }, {
        label: 'Read Only(ROX)',
        value: 'ReadOnlyMany'
      }];
    },

    ImageOption() {
      const choices = this.$store.getters['cluster/all'](IMAGE);

      return sortBy(
        choices
          .map((obj) => {
            return {
              label: obj.spec.displayName,
              value: obj.spec.displayName
            };
          }),
        'label'
      );
    },

    imgUrl() {
      const choices = this.$store.getters['cluster/all'](IMAGE);

      return choices.find( (I) => {
        return I.spec.displayName === this.image;
      })
      ?.status?.downloadUrl;
    }
  },

  methods: {
    update() {
      const source = this.isBlank ? { blank: {} } : this.container ? { registry: { url: this.container } } : { http: { url: this.imgUrl } };

      const spec = {
        ...this.value,
        pvc: {
          ...this.value.pvc,
          resources:        { requests: { storage: this.storage } },
          accessModes:      [this.accessMode],
          volumeMode:       this.volumeMode,
          storageClassName: this.storageClassName
        },
        source,
      };

      this.$emit('input', spec);
    },
  }
};
</script>

<template>
  <div @input="update">
    <LabeledSelect
      v-model="source"
      label="Source"
      :options="sourceOption"
      required
      class="mb-20"
      @input="update"
    />

    <MemoryUnit v-model="storage" value-name="Size (GiB)" class="mb-20" />

    <LabeledInput
      v-if="isContainer"
      v-model="container"
      label="Container Image"
      class="mb-20"
      required
    />

    <LabeledSelect
      v-if="isVmImage"
      v-model="image"
      label="Select Image"
      :options="ImageOption"
      required
      class="mb-20"
      @input="update"
    />

    <LabeledSelect
      v-if="!isContainer"
      v-model="storageClassName"
      label="Storage Class"
      :options="storageOption"
      required
      class="mb-20"
      @input="update"
    />

    <Collapse :open.sync="isShowAdvanced">
      <LabeledSelect v-model="volumeMode" label="Volume Mode" :options="volumeModeOption" class="mb-20" />

      <LabeledSelect v-model="accessMode" label="Access Model" :options="accessModeOption" />
    </Collapse>
  </div>
</template>
