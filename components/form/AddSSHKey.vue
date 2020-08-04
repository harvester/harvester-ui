<script>
import LabeledInput from '@/components/form/LabeledInput';
import Banner from '@/components/Banner';
import Checkbox from '@/components/form/Checkbox';
import { clone } from '@/utils/object';

export default {
  components: {
    LabeledInput,
    Checkbox,
    Banner
  },

  props: {
    ssh: {
      type:    Array,
      default: () => {
        return [];
      }
    },

    sshKey: {
      type:    Array,
      default: () => {
        return [];
      }
    },
  },

  data() {
    return {
      selectAllKeys: 'selectAllKeys',
      ssh_key:       this.sshKey,
      publicKey:     '',
      sshName:       '',
      errors:        [],
      isSelectAll:   false
    };
  },

  computed: {
    sshList() {
      return this.ssh.map( O => O.metadata.name);
    }
  },

  watch: {
    ssh_key() {
      if (this.ssh_key.length === this.sshList.length) {
        this.isSelectAll = true;
      } else {
        this.isSelectAll = false;
      }
      this.$emit('update:sshKey', clone(this.ssh_key));
    }
  },

  methods: {
    show() {
      this.$modal.show('newSSH');
    },

    hide() {
      this.$modal.hide('newSSH');
    },

    async saveKey() {
      if (!this.sshName || !this.publicKey) {
        this.errors.push('Please fill in all required fields.');

        return;
      }
      const SSH = 'vm.cattle.io.keypair';

      try {
        const data = await this.$store.dispatch('cluster/request', {
          method:  'POST',
          headers: {
            'content-type': 'application/json',
            accept:         'application/json',
          },
          url:  `v1/${ SSH }`,
          data: {
            apiVersion: 'vm.cattle.io/v1alpha1',
            kind:       'KeyPair',
            metadata:   { name: this.sshName },
            spec:       { publicKey: this.publicKey },
            type:       SSH
          },
        });

        this.hide();
      } catch (err) {
        this.errors = [err.message];
      }
    },

    addSSH() {
      this.show();
    },

    cancelKey() {
      this.hide();
    },

    chooseAll(neu) {
      if (neu) {
        this.$set(this, 'ssh_key', clone(this.sshList));
      } else {
        this.$set(this, 'ssh_key', []);
      }
    }
  }
};
</script>

<template>
  <div>
    <div class="box mb-20">
      <h3>Choose your SSH keys</h3>
      <div class="keyLisk">
        <div class="ssh mr-20">
          <Checkbox v-model="isSelectAll" label="Select all" type="checkbox" @input="chooseAll" />
        </div>

        <div v-for="item in ssh" :key="item.metadata.uid" class="ssh mr-20">
          <input :id="item.metadata.name" v-model="ssh_key" type="checkbox" class="mr-5" :value="item.metadata.name">
          <label :for="item.metadata.name">{{ item.metadata.name }}</label>
        </div>
      </div>
    </div>

    <button class="btn bg-primary btn-sm" @click="addSSH">
      New SSH Key
    </button>

    <modal name="newSSH" height="auto">
      <div class="sshModal">
        <h2 class="mb-20">
          Add Public SSH Key
        </h2>

        <LabeledInput
          v-model="sshName"
          label="Name"
          class="mb-20"
          required
        />

        <LabeledInput
          v-model="publicKey"
          type="multiline"
          label="SSH-Key"
          class="mb-20"
          :min-height="160"
          required
        />

        <div v-for="(err,idx) in errors" :key="idx">
          <Banner color="error" :label="err" />
        </div>

        <div class="footer mb-20">
          <button class="btn bg-primary btn-sm mr-20" @click="cancelKey">
            Cancel
          </button>
          <button class="btn bg-primary btn-sm" @click="saveKey">
            Save SSH Key
          </button>
        </div>
      </div>
    </modal>
  </div>
</template>

<style lang="scss">
.sshModal {
  padding: 20px;

  .footer {
    display: flex;
    justify-content: flex-end;
  }
}

.box {
  border: 1px solid var(--tabbed-container-bg);
  padding: 20px;

  .keyLisk {
    display: flex;
    align-items: center;
  }

  .ssh {
    display: flex;
    align-items: center;
  }
}
</style>
