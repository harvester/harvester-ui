<script>
import cloneDeep from 'lodash/cloneDeep';
import ProgressBarMulti from '@/components/ProgressBarMulti';

export default {
  components: { ProgressBarMulti },
  props:      {
    value: {
      type:     [String, Number],
      default: 0
    },
    row: {
      type:     Object,
      default: () => {}
    },
    col: {
      type:     Object,
      default: () => {}
    },
  },
  computed: {
    percentage() {
      const value = Number.parseFloat(this.value);
      let color = 'bg-success';

      if (value < 30) {
        color = 'bg-secondary';
      } else if (value < 70) {
        color = 'bg-warning';
      }

      return [{
        value,
        color
      }];
    },
    state() {
      cloneDeep(this.row);

      return this.row.stateDisplay;
    },
    errorMessage() {
      return this.row.getStatusConditionOfType('imported')?.reason;
    }
  },
};
</script>

<template>
  <div class="parent">
    <div>
      <ProgressBarMulti :values="percentage" :min="0" :max="100" />
    </div>
    <span v-if="state === 'Failed'" class="error">{{ errorMessage }}</span>
  </div>
</template>

<style lang="scss">
.parent {
  width: 80%;

  .progress {
    background-color: darken(#EBEEF5, 15%);
    width: 100%;
  }

}

.error {
  color: var(--error);
}
</style>
