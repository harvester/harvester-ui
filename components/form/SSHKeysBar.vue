<script>
import { allHash } from '@/utils/promise';
import { SSH } from '@/config/types';

export default {
  props: {
    resource: {
      type:     Object,
      required: true,
    }
  },

  async fetch() {
    await allHash({ ssh: this.$store.dispatch('cluster/findAll', { type: SSH }) });
  },

  data() {
    return {
      visible: false,
      allssh:  [],
      sshkeys: [],
    };
  },

  watch: {
    allssh() {
      let userData = '';
      const r = /(\r\n\t|\n|\r\t)|(\s*)/gm;

      this.sshKeys = [];

      if (!this.resource || !this.resource.spec || !this.resource.spec.volumes) {
        return;
      }

      this.resource.spec.volumes.forEach((v) => {
        if (v.cloudInitNoCloud) {
          userData = v.cloudInitNoCloud.userData;
        }
      });

      userData = userData.replace(r, '');

      this.sshkeys = this.allssh.filter((ssh) => {
        return userData.includes(ssh.spec.publicKey.replace(r, ''));
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
    <button class="color-light-text-primary" @click="toggleModal(true)">
      el-icon-view SSH-keys
    </button>
    <el-dialog
      class="text-left"
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
        <button class="btn btn-sm role-secondary" @click="handleClose">Close</button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  .sshkeys-modal {
    .el-button--text {
      color: var(--link-text) !important
    }
  }

  .overview-sshkeys {
    text-align: left;
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
