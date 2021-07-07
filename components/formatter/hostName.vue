<script>
import LinkDetail from '@/components/formatter/LinkDetail';
import { HOST_CONSOLE_URL } from '@/config/labels-annotations';

export default {
  components: { LinkDetail },

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

  computed: {
    consoleUrl() {
      return this.row.getAnnotationValue(HOST_CONSOLE_URL);
    }
  },

  methods: {
    goto() {
      window.open(this.consoleUrl, '_blank');
    }
  },
};
</script>

<template>
  <div class="host-list">
    <span class="overflow">
      <LinkDetail v-model="row.nameDisplay" :row="row" />
    </span>
    <button v-if="consoleUrl" type="button" class="btn btn-sm role-primary console mr-10" @click="goto">
      <span>Console</span>
    </button>
  </div>
</template>

<style lang="scss">
  .host-list {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .overflow{
      flex: 1;
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
