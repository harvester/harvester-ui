<script>
import LinkDetail from '@/components/formatter/LinkDetail';
import ConsoleBar from '@/components/form/ConsoleBar';

export default {
  components: { LinkDetail, ConsoleBar },

  props: {
    value: {
      type:     [String, Date],
      default: ''
    },

    row: {
      type:     Object,
      required: true
    },
  },
};
</script>

<template>
  <div class="vm-list">
    <span class="overflow">
      <LinkDetail v-model="row.metadata.name" :row="row" />
    </span>
    <ConsoleBar :resource="row" class="console mr-10" />
  </div>
</template>

<style lang="scss">
  .vm-list {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .overflow{
      width:220px;
      overflow:hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow:ellipsis;
    }

    .console {
      width: 122px;
    }
  }
</style>
