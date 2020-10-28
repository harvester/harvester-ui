<script>
import CopyToClipboardText from '@/components/formatter/CopyToClipboardText';
import { getFileSize } from '@/utils/units';
import Card from '@/components/Card';

export default {
  components: { CopyToClipboardText, Card },

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    return {};
  },

  computed: {
    formattedValue() {
      return getFileSize(this.value?.status?.downloadedBytes) || '-';
    },

    downloadUrl() {
      return this.value?.status?.downloadUrl || '-';
    },

    description() {
      return this.value.spec.description || '-';
    },

    errorMessage() {
      return this.value.getStatusConditionOfType('imported')?.reason || '-';
    }
  }
};
</script>

<template>
  <Card class="mt-20">
    <template #body>
      <div class="row">
        <div class="col span-12">
          <div>Url</div>
          <div><CopyToClipboardText v-model="value.spec.url" /></div>
        </div>
      </div>

      <div class="row">
        <div class="col span-12">
          <div>Size</div>
          <div>{{ formattedValue }}</div>
        </div>
      </div>

      <div class="row">
        <div class="col span-12">
          <div>Description</div>
          <div>{{ description }}</div>
        </div>
      </div>

      <div v-if="errorMessage !== '-'" class="row">
        <div class="col span-12">
          <div>Message</div>
          <div :class="{ 'error': errorMessage !== '-' }">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.row {
  height: 54px;
  margin-bottom: 10px;

  .col {
    div:first-child {
      line-height: 30px;
      font-size: 14px;
      font-weight: 600;
    }
  }
}
.error {
  color: var(--error);
}
</style>
