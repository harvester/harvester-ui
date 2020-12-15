<script>
import CopyToClipboardText from '@/components/formatter/CopyToClipboardText';
import { getFileSize } from '@/utils/units';
import { DESCRIPTION } from '@/config/labels-annotations';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';

export default {
  components: {
    CopyToClipboardText,
    Tab,
    Tabbed
  },

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
      return this.value?.metadata?.annotations?.[DESCRIPTION] || '-';
    },

    errorMessage() {
      return this.value.getStatusConditionOfType('imported')?.reason || '-';
    }
  }
};
</script>

<template>
  <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
    <Tab name="detail" :label="t('vm.detail.tabs.basics')" class="bordered-table">
      <div class="row">
        <div class="col span-12">
          <div>{{ t('harvester.imagePage.url') }}</div>
          <div><CopyToClipboardText v-model="value.spec.url" /></div>
        </div>
      </div>

      <div class="row">
        <div class="col span-12">
          <div>{{ t('harvester.imagePage.size') }}</div>
          <div>{{ formattedValue }}</div>
        </div>
      </div>

      <div class="row">
        <div class="col span-12">
          <div>{{ t('nameNsDescription.description.label') }}</div>
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
    </Tab>
  </Tabbed>
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
