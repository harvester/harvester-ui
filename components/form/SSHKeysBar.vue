<script>
import Card from '@/components/Card';
import { allHash } from '@/utils/promise';
import { SSH } from '@/config/types';
import { HARVESTER_SSH_NAMES } from '@/config/labels-annotations';

export default {
  components: { Card },

  props: {
    value: {
      type:     Object,
      required: true
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
      this.getKey();
      this.$modal.show('sshKeyBar');
    },

    getKey() {
      const keys = this.value?.spec?.template?.metadata?.annotations?.[HARVESTER_SSH_NAMES];
      const volumes = this.value?.spec?.template?.spec?.volumes;
      let userData = null;

      this.sshkeys = [];

      // find userData
      volumes.forEach((v) => {
        if (v.cloudInitNoCloud) {
          userData = v.cloudInitNoCloud.userData;
        }
      });

      if (!keys && !userData) {
        return;
      }

      this.sshkeys = this.serializing(keys, userData);
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
    },

    serializing(keys, userData) {
      let out = [];
      const r = /(\r\n\t|\n|\r\t)|(\s*)/gm;

      keys = keys.split('').filter((k) => {
        return !['[', ']', '"'].includes(k);
      });
      keys = keys.join('').split(',');

      userData = userData.split('- >-').splice(1);

      out = this.allssh.filter(ssh => keys.includes(ssh.metadata.name)).map((ssh) => {
        return {
          ...ssh,
          showKey: false
        };
      });

      for (const ssh of out) {
        userData = userData.filter((data) => {
          return data.replace(r, '') !== ssh.spec.publicKey.replace(r, '');
        });
      }

      userData = userData.map((pub) => {
        return {
          metadata: { name: 'Unknown' },
          spec:     { publicKey: pub },
          showKey:  false
        };
      });

      return out.concat(userData);
    }
  }
};
</script>

<template>
  <div class="sshkeys-modal">
    <button class="btn btn-sm role-link" @click="show">
      <i class="icons icon-h-eye"></i>
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
                  *******<i class="icons icon-h-eye"></i>
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
