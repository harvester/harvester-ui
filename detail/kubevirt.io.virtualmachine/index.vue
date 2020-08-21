<script>
import Console from '@/components/form/Console';
import { VMI } from '@/config/types';
export default {
  components: { Console },

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  computed: {
    vmi() {
      const vmiList = this.$store.getters['cluster/all'](VMI) || [];
      const vmi = vmiList.find( (VMI) => {
        return VMI?.metadata?.ownerReferences?.[0]?.uid === this.value?.metadata?.uid;
      });

      return vmi;
    }
  }
};
</script>

<template>
  <div id="app">
    <Console v-model="vmi" />
  </div>
</template>
