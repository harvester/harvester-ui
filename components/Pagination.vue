<script>
export default {
  name:  'PageComponent',
  props: {
    pageConfig: {
      type:    Object,
      require: true,
      default() {
        return {
          pageSize:  10,
          pageNo:    0,
          total:     0,
          pageTotal: 0
        };
      }
    },
    pagingLabel: {
      type:    String,
      default: 'sortableTable.paging.generic'
    },
  },
  data() {
    return {
      showPageNo:  8,
      currentPage: 0
    };
  },
  computed: {
    pageTotal() {
      const config = this.pageConfig;

      if (config.pageTotal) {
        return config.pageTotal;
      } else if (config.pageSize && config.total) {
        return Math.ceil(config.total / config.pageSize);
      } else {
        return 0;
      }
    },

    pagingDisplay() {
      const opt = {
        ...(this.pagingParams || {}),

        count: this.pageConfig.total,
        pages: this.pageTotal,
        from:  this.indexFrom,
        to:    this.indexTo,
      };

      return this.$store.getters['i18n/t'](this.pagingLabel, opt);
    },

    indexFrom() {
      return Math.max(0, 1 + this.pageConfig.pageSize * (this.currentPage - 1));
    },

    indexTo() {
      return Math.min(this.pageConfig.total, this.indexFrom + this.pageConfig.pageSize - 1);
    },

    showPaging() {
      return this.currentPage && this.pageTotal > 1;
    },
  },
  created() {
    this.currentPage = this.pageConfig.pageNo || 0;
  },
  methods: {
    firstPage() {
      this.currentPage = 1;
      this.$emit('changeCurrentPage', this.currentPage);
    },
    lastPage() {
      this.currentPage = this.pageTotal;
      this.$emit('changeCurrentPage', this.currentPage);
    },
    prePage() {
      this.currentPage -= 1;
      this.$emit('changeCurrentPage', this.currentPage);
    },
    nextPage() {
      this.currentPage += 1;
      this.$emit('changeCurrentPage', this.currentPage);
    },
    changeCurrentPage(i) {
      this.currentPage = i;
      this.$emit('changeCurrentPage', this.currentPage);
    }
  }
};
</script>

<template>
  <div v-if="showPaging" class="paging">
    <button
      type="button"
      class="btn btn-sm role-multi-action"
      :disabled="currentPage == 1"
      @click="firstPage"
    >
      <i class="icon icon-chevron-beginning" />
    </button>
    <button
      type="button"
      class="btn btn-sm role-multi-action"
      :disabled="currentPage == 1"
      @click="prePage"
    >
      <i class="icon icon-chevron-left" />
    </button>
    <span>
      {{ pagingDisplay }}
    </span>
    <button
      type="button"
      class="btn btn-sm role-multi-action"
      :disabled="currentPage == pageTotal"
      @click="nextPage"
    >
      <i class="icon icon-chevron-right" />
    </button>
    <button
      type="button"
      class="btn btn-sm role-multi-action"
      :disabled="currentPage == pageTotal"
      @click="lastPage"
    >
      <i class="icon icon-chevron-end" />
    </button>
  </div>
</template>
