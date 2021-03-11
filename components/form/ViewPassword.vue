<script>
import LabelValue from '@/components/LabelValue';

export default {
  components: { LabelValue },

  props: {
    name: {
      type:    String,
      default: 'password'
    },

    value: {
      type:    String,
      default: ''
    },

    showValue: {
      type:    Boolean,
      default: false
    }
  },

  data() {
    return { isShowValue: this.showValue };
  },

  computed: {
    realValue() {
      return this.isShowValue ? this.value : this.value.replace(/[\d\D]/g, '*');
    }
  },

  methods: {
    toggle() {
      this.isShowValue = !this.isShowValue;
    }
  }
};
</script>

<template>
  <LabelValue :value="realValue">
    <template #name>
      <div class="name">
        {{ name }} <i class="icons icon-h-eye hand" @click="toggle"></i>
      </div>
    </template>
  </LabelValue>
</template>

<style lang="scss" scoped>
.name {
  display: flex;
  align-items: center;
}
.icon-h-eye {
  margin-left: 5px;
  color: var(--link-text);
}
</style>
