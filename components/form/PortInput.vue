<script>
export default {
  props: {
    row: {
      type:     Object,
      required: true
    }
  },

  data() {
    return {
      pattern:  /^([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$/,
      oldValue: this.row.port
    };
  },

  methods: {
    input(neu) {
      if (this.pattern.test(neu) || neu === '') {
        this.oldValue = neu;
      } else {
        this.row.port = this.oldValue;
      }
    }
  }
};
</script>

<template>
  <input
    v-model="row.port"
    type="text"
    placeholder="e.g. 8080"
    @input="input($event.target.value)"
  >
</template>

<style lang="scss"></style>
