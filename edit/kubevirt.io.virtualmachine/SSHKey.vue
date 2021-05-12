<script>
import { mapGetters } from 'vuex';

import ModalWithCard from '@/components/ModalWithCard';
import InputOrDisplay from '@/components/InputOrDisplay';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';

import { SSH } from '@/config/types';
import { clone } from '@/utils/object';
import { _VIEW, _CONFIG } from '@/config/query-params';

export default {
  components: {
    LabeledInput,
    ModalWithCard,
    LabeledSelect,
    InputOrDisplay
  },

  props: {
    value: {
      type:    Array,
      default: () => {
        return [];
      }
    },
    mode: {
      type:     String,
      default: 'edit',
    },
    disableCreate: {
      type:    Boolean,
      default: false
    }
  },

  data() {
    return {
      checkedSsh:       this.value,
      publicKey:        '',
      sshName:          '',
      errors:           [],
      isAll:            false,
      checkAll:         false
    };
  },

  computed: {
    ...mapGetters({ t: 'i18n/t' }),

    isConfig() {
      return this.$route.query?.as === _CONFIG;
    },

    ssh() {
      return this.$store.getters['cluster/all'](SSH);
    },

    sshOption() {
      const choise = this.$store.getters['cluster/all'](SSH);

      return choise.map( (O) => {
        return {
          label: O.metadata.name,
          value: O.metadata.name
        };
      });
    },

    isView() {
      return this.mode === _VIEW || this.disableCreate;
    }
  },

  watch: {
    publicKey(neu) {
      const splitSSH = neu.split(/\s+/);

      if (splitSSH.length === 3) {
        if (splitSSH[2].includes('@')) {
          if (splitSSH[2].split('@')) {
            if (!this.sshName) {
              this.sshName = splitSSH[2].split('@')[0];
            }
          }
        }
      }
    },

    value(neu) {
      this.checkedSsh = neu;
    }
  },

  methods: {
    show() {
      this.$modal.show('newSSH');
    },

    hide() {
      this.$modal.hide('newSSH');
    },

    async save(buttonCb) {
      this.errors = [];

      if (!this.sshName) {
        const fieldName = this.t('harvester.vmPage.input.name');
        const message = this.t('validation.required', { key: fieldName });

        this.errors.push(message);
      }

      if (!this.publicKey) {
        const fieldName = this.t('harvester.vmPage.input.sshKeyValue');
        const message = this.t('validation.required', { key: fieldName });

        this.errors.push(message);
      }

      if (this.sshName.length > 63) {
        const message = this.t('harvester.validation.custom.tooLongName', { max: 63 });

        this.errors.push(message);
      }

      if (this.errors.length > 0) {
        buttonCb(false);

        return;
      }

      try {
        await this.$store.dispatch('cluster/request', {
          method:  'POST',
          headers: {
            'content-type': 'application/json',
            accept:         'application/json',
          },
          url:  `v1/${ SSH }s`,
          data: {
            metadata:   { name: this.sshName, namespace: 'default' },
            spec:       { publicKey: this.publicKey },
            type:       SSH
          },
        });

        this.checkedSsh.push(this.sshName);

        buttonCb(true);
        this.cancel();
      } catch (err) {
        this.errors = [err.message];
        buttonCb(false);
      }
    },

    cancel() {
      this.hide();
      this.resetFields();
    },

    resetFields() {
      this.sshName = '';
      this.publicKey = '';
      this.errors = [];
    },

    update() {
      this.$emit('update:sshKey', clone(this.checkedSsh));
    }
  }
};
</script>

<template>
  <div>
    <div>
      <div class="keyLisk">
        <InputOrDisplay :name="t('harvester.vmPage.input.sshKey')" :value="checkedSsh" :mode="mode" class="mb-20">
          <LabeledSelect
            v-model="checkedSsh"
            :label="t('harvester.vmPage.input.sshKey')"
            :taggable="true"
            :mode="mode"
            :multiple="true"
            :searchable="true"
            :disabled="isConfig"
            :options="sshOption"
            @input="update"
          />
        </InputOrDisplay>
      </div>

      <span v-if="!isView" class="btn btn-sm bg-primary mt-20" @click="show">
        {{ t('harvester.vmPage.buttons.createSSHKey') }}
      </span>
    </div>

    <ModalWithCard
      ref="newSSH"
      name="newSSH"
      width="40%"
      :errors="errors"
      @finish="save"
      @close.prevent="cancel"
    >
      <template #title>
        {{ t('harvester.vmPage.sshTitle') }}
      </template>

      <template #content>
        <LabeledInput
          v-model="sshName"
          :label="t('harvester.vmPage.input.name')"
          class="mb-20"
          required
        />

        <LabeledInput
          v-model="publicKey"
          :label="t('harvester.vmPage.input.sshKeyValue')"
          :min-height="160"
          class="mb-20"
          type="multiline"
          required
        />
      </template>
    </ModalWithCard>
  </div>
</template>
