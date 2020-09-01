<script>
import { allHash } from '@/utils/promise';
import { SSH } from '@/config/types';

export default {
  props: {
    resource: {
      type:     Object,
      required: true,
    },
    pullRight: {
      type:     Boolean,
      required: false,
      default:  false
    }
  },

  async fetch() {
    const hash = await allHash({ ssh: this.$store.dispatch('cluster/findAll', { type: SSH }) });
  },

  data() {
    return {
      visible: false,
      allssh:  [],
      sshkeys: [],
    };
  },

  computed: {
    pullRightStyle() {
      return {
        float:   'right',
        padding: '3px 0'
      };
    }
  },

  watch: {
    allssh() {
      let userData = '';

      this.sshKeys = [];

      if (!this.resource || !this.resource.spec || !this.resource.spec.volumes) {
        return;
      }

      this.resource.spec.volumes.forEach((v) => {
        if (v.cloudInitNoCloud) {
          userData = v.cloudInitNoCloud.userData;
        }
      });

      this.sshkeys = this.allssh.filter((ssh) => {
        return userData.includes(ssh.spec.publicKey);
      }).map((ssh) => {
        return {
          ...ssh,
          showKey: false
        };
      });
    }
  },

  methods: {
    handleClose() {
      this.toggleModal(false);
    },
    open() {
      const ssh = this.$store.getters['cluster/all'](SSH);

      this.allssh = ssh || [];
    },
    toggleModal(b) {
      this.visible = b;
    },
    viewKey(index) {
      const neu = this.sshkeys[index];

      neu.showKey = true;

      this.$set(this.sshkeys, index, neu);
    },
    hideKey(index) {
      const neu = this.sshkeys[index];

      neu.showKey = false;

      this.$set(this.sshkeys, index, neu);
    }
  }
};
</script>

<template>
  <div class="sshkeys-modal">
    <el-button :style="[pullRight ? pullRightStyle : '']" type="text" icon="el-icon-view" @click="toggleModal(true)">
      SSH-keys
    </el-button>
    <el-dialog
      title="View SSH Keys"
      :visible="visible"
      width="50%"
      :before-close="handleClose"
      @open="open"
    >
      <div class="overview-sshkeys">
        <div v-for="(ssh, index) in sshkeys" :key="ssh.id" class="row overview-sshkeys__item">
          <div class="col span-4">
            {{ ssh.metadata.name }}
          </div>
          <div class="col span-7 offset-1">
            <div v-if="ssh.showKey" class="key-display">
              {{ ssh.spec.publicKey }}
              <el-button class="hide-bar" type="text" @click="hideKey(index)">
                <i class="el-icon-close"></i>
              </el-button>
            </div>
            <el-button v-else type="text" @click="viewKey(index)">
              *******<i class="el-icon-view el-icon--right"></i>
            </el-button>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">Close</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
  .overview-sshkeys {
    max-height: 700px;
    overflow: auto;

    &__item {
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .key-display {
      position: relative;
      padding-right: 30px;

      .hide-bar {
        position: absolute;
        top: -10px;
        right: 10px;
      }
    }
  }
</style>
