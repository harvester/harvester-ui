<script>
import Card from '@/components/Card';
import { allHash } from '@/utils/promise';
import { SSH } from '@/config/types';

export default {
  components: { Card },

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
    save() {
      this.$set(this.spec.metadata, 'annotations', this.annotations);
      this.$emit('update');
      this.hide();
    },

    hide() {
      this.$modal.hide('sshKeyBar');
      this.$emit('close');
    },
    show() {
      const ssh = this.$store.getters['cluster/all'](SSH);

      this.allssh = ssh || [];
      this.$modal.show('sshKeyBar');
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
    <button class="btn btn-sm role-link" @click="show">
      <i class="iconfont icons-eye"></i>
      <span>SSH-keys</span>
    </button>
    <modal
      name="sshKeyBar"
      width="50%"
      :click-to-close="false"
      height="auto"
    >
      <Card>
        <template #title>
          <h4 slot="title" class="text-default-text">
            View SSH Keys
          </h4>
        </template>

        <template #body>
          <div class="overview-sshkeys">
            <div v-for="(ssh, index) in sshkeys" :key="ssh.id" class="row overview-sshkeys__item">
              <div class="col span-4">
                {{ ssh.metadata.name }}
              </div>
              <div class="col span-7 offset-1">
                <div v-if="ssh.showKey" class="key-display">
                  {{ ssh.spec.publicKey }}
                  <button class="btn btn-sm role-link hide-bar" @click="hideKey(index)">
                    <i class="icon icon-x"></i>
                  </button>
                </div>
                <button v-else class="btn btn-sm role-link" @click="viewKey(index)">
                  *******<i class="iconfont icons-eye"></i>
                </button>
              </div>
            </div>
          </div>
        </template>

        <template #actions>
          <button class="btn btn-sm role-secondary" @click="hide">
            Close
          </button>
        </template>
      </Card>
    </modal>
  </div>
</template>

<style lang="scss" scoped>
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
      word-break: break-word;

      .hide-bar {
        position: absolute;
        top: -10px;
        right: 10px;
      }
    }
  }
</style>
