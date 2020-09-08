<script>
import { getPrefix } from '@/utils/url';

export default {
  name: 'ConsoleBar',

  props: {
    resource: {
      type:     Object,
      required: true,
      default:  () => {
        return {};
      }
    },
  },

  data() {
    return { };
  },

  computed: {
    isDown() {
      return this.isEmpty(this.resource);
    },
  },

  methods: {
    handleDropdown(c) {
      switch (c) {
      case 'vnc':
        this.showVnc();
        break;
      case 'serial':
        this.showSerial();
        break;
      }
    },
    showVnc() {
      const prefix = getPrefix();
      let uid = this.resource.metadata?.ownerReferences?.[0]?.uid;

      if (uid === undefined) {
        uid = this.resource.metadata.uid;
      }

      let url = `//${ window.location.host }/#/console/${ uid }/vnc`;

      if (prefix) {
        url = `//${ window.location.host }/${ prefix }/#/console/${ uid }/vnc`;
      }

      window.open(url, '_blank', 'toolbars=0,width=900,height=700,left=0,top=0');
    },
    showSerial() {
      const prefix = getPrefix();
      let uid = this.resource.metadata?.ownerReferences?.[0]?.uid;

      if (uid === undefined) {
        uid = this.resource.metadata.uid;
      }

      let url = `//${ window.location.host }/#/console/${ uid }/serial`;

      if (prefix) {
        url = `//${ window.location.host }/${ prefix }/#/console/${ uid }/serial`;
      }

      window.open(url, '_blank', 'toolbars=0,width=900,height=700,left=0,top=0');
    },
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    }
  }
};
</script>

<template>
  <div class="overview-web-console">
    <el-dropdown
      v-if="!isDown"
      size="mini"
      split-button
      @click="showVnc()"
      @command="handleDropdown"
    >
      <span class="el-icon-connection">&nbsp;Console</span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="vnc">
          Open in Web VNC
        </el-dropdown-item>
        <el-dropdown-item command="serial">
          Open in Serial Console
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<style lang="scss"></style>
