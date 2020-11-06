<script>
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';
import NetworkSetting from './NetworkSetting';

export default {
  name: 'Networks',

  components: { Footer, NetworkSetting },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    const spec = this.value.spec;

    // if (!spec) {
    //   spec = { pvc: { resources: { requests: { storage: '' } } } };
    //   this.value.spec = spec;
    // }

    return {
      spec,
      randow: Math.random(),
      index:  0,
      errors: []
    };
  },

  computed: {
    isNetworkSetting() {
      return this.value.metadata.name === 'network-setting';
    }
  },

  watch: {},

  methods: {},
};
</script>

<template>
  <div>
    <NetworkSetting v-if="isNetworkSetting" v-model="value" />
    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>
