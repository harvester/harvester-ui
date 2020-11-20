<script>
import LabeledSelect from '@/components/form/LabeledSelect';
import LabeledInput from '@/components/form/LabeledInput';

export default {
  components: { LabeledSelect },

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
    const accessMode = this.value?.pvc?.accessModes?.[0] || 'ReadWriteOnce';
    const volumeMode = this.value?.pvc?.volumeMode || 'Filesystem';

    return {
      accessMode,
      volumeMode,
    };
  },

  computed: {
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
  },

  created() {
    this.update();
  },

  methods: {
    update() {
      const spec = {
        ...this.value,
        pvc: {
          ...this.value.pvc,
          accessModes: [this.accessMode],
          volumeMode:  this.volumeMode,
        }
      };

      this.$emit('input', spec);
    },
  }
};
</script>

<template>
  <div @input="update">
    <LabeledSelect
      v-model="volumeMode"
      label="Volume Mode"
      :mode="mode"
      :options="volumeModeOption"
      class="mb-20"
      @input="update"
    />

    <!-- <LabeledSelect v-model="accessMode" label="Access Mode" :mode="mode" :options="accessModeOption" @input="update" /> -->
  </div>
</template>
