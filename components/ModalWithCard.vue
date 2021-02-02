<script>
import Card from '@/components/Card';

export default {
  name: 'ModalWithCard',

  components: { Card },

  props:      {
    name: {
      type:     String,
      required: true
    },

    closeText: {
      type:    String,
      default: 'Close'
    },

    saveText: {
      type:    String,
      default: 'Save'
    },
    width: {
      type:    [String, Number],
      default: '50%'
    },
    height: {
      type:    [String, Number],
      default: 'auto'
    }
  },

  methods: {
    hide() {
      this.$modal.hide(this.name);
    },
    open() {
      this.$modal.show(this.name);
    },
    save(event) {
      this.$emit('beforeClose', event);
    }
  }
};

</script>

<template>
  <modal
    :name="name"
    :width="width"
    :click-to-close="false"
    :height="height"
    styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 100vh;"
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
        <slot name="footer">
          <button class="btn role-secondary btn-sm mr-20" @click.prevent="hide">
            {{ closeText }}
          </button>
          <button class="btn role-tertiary bg-primary btn-sm mr-20" @click.prevent="save">
            {{ saveText }}
          </button>
        </slot>
      </template>
    </Card>
  </modal>
</template>
