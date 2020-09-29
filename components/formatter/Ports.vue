<script>
import PortsModal from '@/components/form/PortsModal';

export default {
  components: { PortsModal },

  props: {
    value: {
      type:    Array,
      default: () => []
    }
  },

  data() {
    return { dialogVisible: false };
  },

  computed: {
    hasPorts() {
      return this.value.length > 0;
    },
    ports() {
      return this.value.reduce((a, p, index) => `${ a }${ p.port }${ index < this.value.length - 1 ? ',' : '' }`, '', 0);
    },
    formattedPorts() {
      return { ports: this.value };
    }
  },

  methods: {
    open() {
      this.dialogVisible = true;
    },
    close() {
      this.dialogVisible = false;
    }
  }
};
</script>

<template>
  <div>
    {{ ports }}
    <el-button v-if="hasPorts" size="mini" type="text" icon="el-icon-view" @click="open"></el-button>
    <PortsModal :visible="dialogVisible" :rows="formattedPorts" @close="close" />
  </div>
</template>
