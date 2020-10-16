<script>
import { sortBy } from '@/utils/sort';
import { STORAGE_CLASS, PVC, IMAGE } from '@/config/types';
import { InterfaceOption, MemoryUnit as MemoryUnitOption } from '@/config/map';

export default {
  components: {},

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
    })?.spec?.displayName : '';

    const accessMode = this.value?.pvc?.accessModes?.[0] || 'ReadWriteOnce';
    const storageClassName = this.value?.pvc?.storageClassName;
    const volumeMode = this.value?.pvc?.volumeMode || 'Filesystem';
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
      MemoryUnitOption
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
    },

    size: {
      get() {
        const arr = this.storage.split(/(?=[A-Z])+/);

        if (arr.length === 2) {
          return arr[0];
        } else {
          return '';
        }
      },
      set(neu) {
        this.storage = `${ neu }${ this.unit }`;
      }
    },

    unit: {
      get() {
        const arr = this.storage.split(/(?=[A-Z])+/);

        return arr[1] || arr[0] || 'Gi';
      },

      set(neu) {
        this.storage = `${ this.size }${ neu }`;
      }
    }
  },

  watch: {
    size(neu) {
      if (neu === 'null') {
        this.size = 1;
      }
    }
  },

  methods: {
    update() {
      const source = this.isBlank ? { blank: {} } : this.container ? { registry: { url: this.container } } : { http: { url: this.imgUrl } };
      let imageAnnotations = '';

      if (this.isVmImage && this.image) {
        imageAnnotations = { 'harvester.cattle.io/imageId': this.image };
      } else {
        imageAnnotations = {};
      }
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

      this.$emit('update:annotation', imageAnnotations);

      this.$emit('input', spec);
    },
  }
};
</script>

<template>
  <div @input="update">
    <a-form layout="vertical">
      <a-form-item label="Source" required>
        <a-select
          v-model="source"
          :options="sourceOption"
          show-search
          @change="update"
        />
      </a-form-item>

      <a-form-item v-if="isContainer" label="Container Image" required>
        <a-input
          v-model="container"
        />
      </a-form-item>

      <a-form-item v-if="isVmImage" label="Select an Image" required>
        <a-select
          v-model="image"
          :options="ImageOption"
          show-search
          @change="update"
        />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="18">
          <a-form-item label="Size" required>
            <a-input-number
              v-model="size"
              :min="1"
              :max="999999"
              :step="1"
              style="width: 100%;"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="Unit" required>
            <a-select
              v-model="unit"
              :options="MemoryUnitOption"
              show-search
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Storage Class" required>
        <a-select
          v-model="storageClassName"
          :options="storageOption"
          show-search
          @change="update"
        />
      </a-form-item>

      <a-collapse>
        <a-collapse-panel key="1" header="Advanced Configuration">
          <a-form-item label="Volume Mode">
            <a-select
              v-model="volumeMode"
              :options="volumeModeOption"
              show-search
            />
          </a-form-item>

          <a-form-item label="Access Model">
            <a-select
              v-model="accessMode"
              :options="accessModeOption"
              show-search
            />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </div>
</template>
