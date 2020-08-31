<script>
import CopyToClipboardText from '@/components/formatter/CopyToClipboardText';
import { getFileSize } from '@/utils/units';

export default {
  components: { CopyToClipboardText },

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
  <div class="mt-20">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <h2>{{ value.spec.displayName }}</h2>
      </div>

      <div class="row">
        <div class="col span-12">
          <div>Url</div>
          <div><CopyToClipboardText v-model="value.spec.url" /></div>
        </div>
      </div>

      <div class="row">
        <div class="col span-12">
          <div>Message</div>
          <div :class="{ 'error': errorMessage !== '-' }">
            {{ errorMessage }}
          </div>
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
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.row {
  height: 54px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eaeded;

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
