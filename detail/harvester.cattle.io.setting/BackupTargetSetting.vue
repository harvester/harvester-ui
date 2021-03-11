<script>
import Banner from '@/components/Banner';
import LabelValue from '@/components/LabelValue';
import ViewPassword from '@/components/form/ViewPassword';

export default {
  name:       'Detail',
  components: {
    Banner, LabelValue, ViewPassword
  },

  props:      {
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    let parseDefaultValue = {};

    try {
      parseDefaultValue = JSON.parse(this.value.value);
    } catch (error) {
      parseDefaultValue = JSON.parse(this.value.default);
    }
    const type = this.value.getAnnotationValue('networks.harvester.cattle.io/type');

    return {
      type,
      parseDefaultValue
    };
  },

  computed: {
    endpoint() {
      return this.parseDefaultValue?.endpoint || '-';
    },

    virtualHostedStyle() {
      return String(this.parseDefaultValue?.virtualHostedStyle);
    },

    accessKeyId() {
      return this.parseDefaultValue?.accessKeyId;
    },

    secretAccessKey() {
      return this.parseDefaultValue?.secretAccessKey;
    },

    cert() {
      return this.parseDefaultValue?.cert || '-';
    },

    statusText() {
      return this.value?.configuredCondition?.reason;
    }
  }
};
</script>

<template>
  <div>
    <div class="row mb-15">
      <div class="col span-6">
        <LabelValue :name="t('harvester.fields.type')" :value="parseDefaultValue.type" />
      </div>

      <div class="col span-6">
        <LabelValue name="Endpoint" :value="endpoint" />
      </div>
    </div>

    <template v-if="value.isS3">
      <div class="row mb-15">
        <div class="col span-6">
          <LabelValue name="BucketName" :value="parseDefaultValue.bucketName" />
        </div>

        <div class="col span-6">
          <LabelValue name="BucketRegion" :value="parseDefaultValue.bucketRegion" />
        </div>
      </div>

      <div v-if="accessKeyId" class="row mb-15">
        <div class="col span-6">
          <LabelValue name="AccessKeyId" :value="accessKeyId" />
        </div>

        <div class="col span-6">
          <ViewPassword name="SecretAccessKey" :value="secretAccessKey" />
        </div>
      </div>

      <div class="row mb-15">
        <div class="col span-6">
          <LabelValue name="Certificate" :value="cert" />
        </div>

        <div class="col span-6">
          <LabelValue name="VirtualHostedStyle" :value="virtualHostedStyle" />
        </div>
      </div>
    </template>

    <Banner
      v-if="statusText"
      color="error"
    >
      {{ statusText }}
    </Banner>
  </div>
</template>

<style lang="scss" scoped>

</style>
