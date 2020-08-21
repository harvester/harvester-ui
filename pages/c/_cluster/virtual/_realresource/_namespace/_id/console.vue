<script>
/* eslint-disable */
import { watchQuery, asyncData } from '@/components/ResourceDetail';
import Console from '@/components/form/Console';

export default {
  layout: 'blank',
  name:       'ClusterResourceCreate',
  components: { Console },
  watchQuery,
  asyncData
};
</script>

<template>
  <div>
    <Console v-model="value" />
  </div>
</template>
