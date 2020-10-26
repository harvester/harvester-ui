<script>
export default {
  props: {
    total: {
      type:     Number,
      required: true
    },
    pageSize: {
      type:    Number,
      default: 10
    }
  }
};
</script>

<template>
  <div class="paging">
    <button
      type="button"
      class="btn btn-sm role-multi-action"
      :disabled="page == 1"
      @click="goToPage('first')"
    >
      <i class="icon icon-chevron-beginning" />
    </button>
    <button
      type="button"
      class="btn btn-sm role-multi-action"
      :disabled="page == 1"
      @click="goToPage('prev')"
    >
      <i class="icon icon-chevron-left" />
    </button>
    <span>
      {{ pagingDisplay }}
    </span>
    <button
      type="button"
      class="btn btn-sm role-multi-action"
      :disabled="page == totalPages"
      @click="goToPage('next')"
    >
      <i class="icon icon-chevron-right" />
    </button>
    <button
      type="button"
      class="btn btn-sm role-multi-action"
      :disabled="page == totalPages"
      @click="goToPage('last')"
    >
      <i class="icon icon-chevron-end" />
    </button>
  </div>
</template>

<style lang="sass" scoped>

</style>
