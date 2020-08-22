<script>
import { getFileSize } from '@/utils/units';

export default {
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
        <div class="col span-3">
          <div>Url</div>
          <div>{{ value.spec.url }}</div>
        </div>

        <div class="col span-3">
          <div>Notes</div>
          <div>{{ description }}</div>
        </div>

        <div class="col span-3">
          <div>DownloadUrl</div>
          <div>{{ downloadUrl }}</div>
        </div>

        <div class="col span-3">
          <div>DownloadedBytes</div>
          <div>{{ formattedValue }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.row {
  height: 54px;
  div:first-child {
    border-right: 1px solid #eaeded;
  }

  .col {
    div:first-child {
      line-height: 30px;
      font-size: 14px;
      font-weight: 600;
    }
  }
}
</style>
