<script>
import CreateEditView from '@/mixins/create-edit-view';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import Password from '@/components/form/Password';
import Tip from '@/components/Tip';

export default {
  name: 'BackupTarget',

  components: {
    LabeledInput, LabeledSelect, Tip, Password
  },
  mixins:     [CreateEditView],
  props:      {
    value: {
      type:     Object,
      required: true,
    },

    mode: {
      type:    String,
      default: 'create',
    },
  },

  data() {
    let parseDefaultValue = {};

    try {
      parseDefaultValue = JSON.parse(this.value.value);
    } catch (error) {
      parseDefaultValue = JSON.parse(this.value.default);
    }

    return {
      parseDefaultValue,
      errors: []
    };
  },

  computed: {
    typeOption() {
      return [{
        value: 'nfs',
        label: 'NFS'
      }, {
        value: 's3',
        label: 'S3'
      }];
    },

    virtualHostedStyleType() {
      return [{
        value: true,
        label: 'True'
      }, {
        value: false,
        label: 'False'
      }];
    },

    isS3() {
      return this.parseDefaultValue.type === 's3';
    },

    endpointPlaceholder() {
      return this.isS3 ? '' : 'nfs://server:/path/';
    }
  },

  watch: {
    'parseDefaultValue.type'(neu) {
      delete this.parseDefaultValue.accessKeyId;
      delete this.parseDefaultValue.secretAccessKey;
      delete this.parseDefaultValue.bucketName;
      delete this.parseDefaultValue.bucketRegion;
      delete this.parseDefaultValue.cert;
      delete this.parseDefaultValue.endpoint;
    }
  },

  created() {
    this.update();
  },

  methods: {
    update() {
      const value = JSON.stringify(this.parseDefaultValue);

      this.$set(this.value, 'value', value);
    }
  }
};
</script>

<template>
  <div class="row" @input="update">
    <div class="col span-12">
      <LabeledSelect v-model="parseDefaultValue.type" class="mb-20" :label="t('harvester.fields.type')" :options="typeOption" @input="update" />

      <LabeledInput v-model="parseDefaultValue.endpoint" class="mb-5" :placeholder="endpointPlaceholder" :mode="mode" label="Endpoint" />
      <Tip class="mb-20" icon="icons icon-h-question" :text="t('harvester.backUpPage.backupTargetTip')" />

      <template v-if="isS3">
        <LabeledInput
          v-model="parseDefaultValue.bucketName"
          class="mb-20"
          :mode="mode"
          label="BucketName"
          required
        />

        <LabeledInput
          v-model="parseDefaultValue.bucketRegion"
          class="mb-20"
          :mode="mode"
          label="BucketRegion"
          required
        />

        <LabeledInput
          v-model="parseDefaultValue.accessKeyId"
          :placeholder="t('harvester.settingPage.placeholder.accessKeyId')"
          class="mb-20"
          :mode="mode"
          label="AccessKeyId"
          required
        />

        <Password
          v-model="parseDefaultValue.secretAccessKey"
          class="mb-20"
          :mode="mode"
          :placeholder="t('harvester.settingPage.placeholder.secretAccessKey')"
          label="SecretAccessKey"
          required
        />

        <LabeledInput
          v-model="parseDefaultValue.cert"
          type="multiline"
          class="mb-20"
          :placeholder="t('harvester.settingPage.placeholder.cert')"
          :mode="mode"
          :min-height="120"
          label="Certificate"
        />

        <LabeledSelect v-model="parseDefaultValue.virtualHostedStyle" class="mb-20" label="VirtualHostedStyle" :options="virtualHostedStyleType" @input="update" />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
p {
  display: flex;
  align-items: center;
}
.icon-h-question {
  font-size: 24px;
}
.tip {
  font-size: 15px;
}
</style>
