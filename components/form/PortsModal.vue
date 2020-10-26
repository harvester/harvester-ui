<script>
import Card from '@/components/Card';
import PortInputGroup from '@/components/form/PortInputGroup';

export default {
  components: { PortInputGroup, Card },

  props: {
    visible: {
      type:    Boolean,
      default: false
    },
    rows: {
      type:    Object,
      default: () => {
        return {};
      }
    }
  },

  data() {
    return { dialogVisible: false };
  },

  watch: {
    visible(neu) {
      if (neu) {
        this.open();
      }
    }
  },

  methods: {
    hide() {
      this.$modal.hide('portModal');
      this.$emit('close');
    },
    open() {
      this.$modal.show('portModal');
    }
  }
};
</script>

<template>
  <modal
    name="portModal"
    width="50%"
    :click-to-close="false"
  >
    <Card>
      <template #title>
        <h4 slot="title" class="text-default-text">
          View Ports
        </h4>
      </template>

      <template #body>
        <PortInputGroup v-model="rows" mode="view" />
      </template>

      <template #actions>
        <button class="btn role-secondary btn-sm mr-20" @click="hide">
          Close
        </button>
      </template>
    </Card>
  </modal>
</template>

<style lang="scss" scoped>
.tip {
  font-size: 13px;
  font-style: italic;
}
</style>
