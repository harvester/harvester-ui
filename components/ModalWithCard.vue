<script>
import Card from '@/components/Card';

export default {
  name: 'ModalWithCard',

  components: { Card },

  props:      {
    name: {
      type:     String,
      required: true
    }
  },

  methods: {
    hide() {
      this.$modal.hide(this.name);
    },
    open() {
      this.$modal.show(this.name);
    }
  }
};
</script>

<template>
  <modal
    :name="name"
    width="50%"
    :click-to-close="false"
  >
    <Card>
      <template #title>
        <h4 slot="title" class="text-default-text">
          <slot name="title"></slot>
        </h4>
      </template>

      <template #body>
        <slot name="content"></slot>
      </template>

      <template #actions>
        <slot name="footer"></slot>
      </template>
    </Card>
  </modal>
</template>
