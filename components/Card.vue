<script>
export default {
  props:      {
    title: {
      type:     String,
      default: ''
    },
    content: {
      type:    String,
      default: ''
    },
    buttonAction: {
      type:    Function,
      default: null
    },
    buttonText: {
      type:    String,
      default: 'go'
    },
  },

  computed: {
    hasTitle() {
      return (!!this.$slots.title || !!this.$scopedSlots.title) || !!this.title;
    },
    hasAction() {
      return (!!this.$slots.actions || !!this.$scopedSlots.actions) || !!this.buttonAction;
    }
  }
};
</script>

<template>
  <div class="card-container">
    <div v-if="hasTitle" class="card-title">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div class="card-body">
      <slot name="body">
        {{ content }}
      </slot>
    </div>
    <div v-if="hasAction" class="card-actions">
      <slot name="actions">
        <button class="btn role-primary" @click="buttonAction">
          {{ buttonText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<style lang='scss'>
 .card-container {
   border: 1px solid  var(--border);
   background: var(--nav-bg);
   display: grid;
   & .card-body {
     overflow: auto;
     padding: 20px;
   }
   & .card-actions {
     align-self: end;
     display: flex;
     justify-content: center;
     padding: 20px;

     button {
       margin: 0 5px;
     }
   }
   & .card-title {
     padding: 20px;
     display: flex;
     justify-content: space-between;
     align-items: center;
     background: var(--card-header);

     h4 {
       margin: 0;
     }
   }
 }
</style>
