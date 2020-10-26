<script>
import LabeledInput from '@/components/form/LabeledInput';
import Banner from '@/components/Banner';
import Checkbox from '@/components/form/Checkbox';
import Card from '@/components/Card';
import { clone } from '@/utils/object';
import { SSH } from '@/config/types';

export default {
  components: {
    Card,
    Banner,
    Checkbox,
    LabeledInput
  },

  props: {
    sshKey: {
      type:    Array,
      default: () => {
        return [];
      }
    },
  },

  data() {
    return {
      checkedSsh:       this.sshKey,
      publicKey:        '',
      sshName:          '',
      searchKey:        '',
      errors:           [],
      isAll:            false,
      checkAll:         false
    };
  },

  computed: {
    ssh() {
      return this.$store.getters['cluster/all'](SSH);
    },
    sshList() {
      return this.ssh.map( O => O.metadata.name);
    },
    filterSSHList() {
      return this.sshList.filter( (O) => {
        return O.includes(this.searchKey);
      });
    }
  },

  watch: {
    checkedSsh() {
      this.$emit('update:sshKey', clone(this.checkedSsh));
    },
    publicKey(neu) {
      const splitSSH = neu.split(/\s+/);

      if (splitSSH.length === 3) {
        if (splitSSH[2].includes('@')) {
          if (splitSSH[2].split('@')) {
            this.sshName = splitSSH[2].split('@')[0];
          }
        }
      }
    },
  },

  methods: {
    show() {
      this.$modal.show('newSSH');
    },

    hide() {
      this.$modal.hide('newSSH');
    },

    handleCheckAllChange(val) {
      this.checkAll = val;
      this.checkedSsh = [];
      if (this.checkAll) {
        for (const key in this.sshList) {
          this.checkedSsh.push(this.sshList[key]);
        }
      }
    },

    handleCheckedChange(value) {
      const checkedCount = this.checkedSsh.length;

      this.checkAll = checkedCount === this.sshList.length;
    },

    async saveKey() {
      this.errors = [];
      if (!this.sshName || !this.publicKey) {
        this.errors.push('Please fill in all required fields.');

        return;
      }

      if (this.sshName.length > 63) {
        const message = this.$store.getters['i18n/t']('validation.custom.tooLongName', { max: 63 });

        this.errors.push(message);

        return;
      }

      const SSH = 'harvester.cattle.io.keypair';

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

        this.checkedSsh.push(this.sshName);

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

    updateSSH(sshKey) {
      this.checkedSsh = sshKey;
    }
  }
};
</script>

<template>
  <div>
    <div class="box mb-20">
      <div class="row">
        <div class="col span-4">
          <input v-model="searchKey" placeholder="Search" />
        </div>
      </div>

      <div class="min-spacer"></div>

      <div class="keyLisk">
        <Checkbox :value="checkAll" type="checkbox" label="Select All" @input="handleCheckAllChange" />
        <div style="margin: 15px 0;"></div>

        <span v-for="item in filterSSHList" :key="item">
          <label class="checkbox-container mr-15"><input v-model="checkedSsh" type="checkbox" :label="item" :value="item" @change="handleCheckedChange()" />
            <span
              class="checkbox-custom mr-5"
              role="checkbox"
            />
            {{ item }}
          </label>
        </span>
      </div>

      <button class="btn btn-sm bg-primary mt-20" @click="addSSH">
        New SSH Key
      </button>
    </div>

    <modal name="newSSH" height="auto">
      <Card>
        <template #title>
          <h4 slot="title" class="text-default-text">
            Add Public SSH Key
          </h4>
        </template>

        <template #body>
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
        </template>

        <template #actions>
          <button class="btn bg-primary btn-sm mr-20" @click="cancelKey">
            Cancel
          </button>
          <button class="btn bg-primary btn-sm" @click="saveKey">
            Save
          </button>
        </template>
      </Card>
    </modal>
  </div>
</template>

<style lang="scss">
.box {
  border: 1px solid var(--tabbed-container-bg);
  padding: 20px;

  .ssh {
    display: flex;
    align-items: center;
  }
}
</style>
