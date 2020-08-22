<script>
import NovncConsole from '@/components/NovncConsole';
import { VMI } from '@/config/types';

export default {
  components: { NovncConsole },

  props: {
    value: {
      type:     Object,
      required: true,
    }
  },

  computed: {
    url() {
      const isDev = process.env.dev;

      const ip = !isDev ? `${ window.location.hostname }:${ window.location.port }` : process.env.api.split('//')[1];

      return `wss://${ ip }${ this.value?.getVMIApiPath }`;
    },
  }
};
</script>

<template>
  <div id="app">
    <NovncConsole v-if="url" :url="url" />
  </div>
</template>
