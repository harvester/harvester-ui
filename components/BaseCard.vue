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
    }
  }
};
</script>

<template>
  <div class="card">
    <div class="card-title">
      <slot name="title">
        <h4>{{ title }}</h4>
      </slot>
    </div>
    <div class="card-body">
      <slot name="body">
        {{ content }}
      </slot>
    </div>
  </div>
</template>

<style lang='scss' scoped>
 .card {
   border: 1px solid  var(--border);
   border-radius: 4px;
   box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  //  background: var(--nav-bg);
   display: grid;

   & .card-title {
     padding: 20px;
     display: flex;
     border-radius: 2px 2px 0 0;
     justify-content: space-between;
     border-bottom: 1px solid #e8e8e8;
     align-items: center;
    //  background: var(--card-header);

     h4 {
       margin: 0;
     }
   }

   & .card-body {
     overflow: auto;
     padding: 20px;
   }
 }
</style>
