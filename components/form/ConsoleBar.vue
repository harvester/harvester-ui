<script>
import { getPrefix } from '@/utils/url';
import ButtonDropdown from '@/components/ButtonDropdown';

export default {
  name: 'ConsoleBar',

  components: { ButtonDropdown },

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
    }
  },

  methods: {
    handleDropdown(c) {
      this.show(c);
    },
    show(type) {
      const prefix = getPrefix();
      let uid = this.resource.metadata?.ownerReferences?.[0]?.uid;

      if (uid === undefined) {
        uid = this.resource.metadata.uid;
      }

      let url = `//${ window.location.host }/#/console/${ uid }/${ type }`;

      if (prefix) {
        url = `//${ window.location.host }/${ prefix }/#/console/${ uid }/${ type }`;
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
    <!-- <el-dropdown
      v-if="!isDown"
      size="mini"
      split-button
      @click="show('vnc')"
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
    </el-dropdown> -->

    <ButtonDropdown size="xs">
      <template #button-content="{ buttonSize }">
        <button :class="buttonSize" @click="show('vnc')">
          &nbsp;Console
        </button>
      </template>
      <template #popover-content>
        <ul class="list-unstyled menu" style="margin: -1px;">
          <li class="hand" @click="show('vnc')">
            Open in Web VNC
          </li>

          <li class="hand" @click="show('serial')">
            Open in Serial Console
          </li>
        </ul>
      </template>
    </ButtonDropdown>
  </div>
</template>

<style lang="scss" scoped>
.btn-xs,
.btn-group-xs > .btn,
.btn-xs .btn-label {
    font-size: 13px !important;
    line-height: 17px !important;
}
</style>
