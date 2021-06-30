<script>
export default {
  props: {
    value: {
      type:    [String, Object],
      default: () => {}
    },
    row: {
      type:     Object,
      required: true
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },

  computed: {
    formatValue() {
      return '';
    },

    vms() {
      return this.row.attachVMs;
    },
  },

  methods: {
    vmDisplayName(vm) {
      return vm.metadata.name || 'N/A';
    },
  },
};
</script>

<template>
  <div>
    <span v-if="col.type !== 'attached'">
      {{ formatValue }}
    </span>

    <span else>
      <span v-for="vm in vms" :key="vm.id" class="block">
        <n-link v-if="vm.detailLocation" :to="vm.detailLocation">
          {{ vmDisplayName(vm) }}
        </n-link>
      </span>
    </span>
  </div>
</template>
