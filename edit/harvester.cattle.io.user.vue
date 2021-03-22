<script>
import CruResource from '@/components/CruResource';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabeledInput from '@/components/form/LabeledInput';
import CreateEditView from '@/mixins/create-edit-view';
import { MANAGEMENT, HARVESTER_COMBINE_USER, NORMAN } from '@/config/types';
import { exceptionToErrorsArray } from '@/utils/error';
import { _EDIT } from '@/config/query-params';

export default {
  name: 'EditUser',

  components: {
    CruResource,
    Tab,
    Tabbed,
    LabeledInput,
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    this.value.isAdmin = true;

    return {};
  },

  methods: {
    async saveUser(buttonCb) {
      const isRancher = await this.$store.dispatch('auth/getIsRancher');

      if (!isRancher) {
        return this.save(buttonCb);
      }

      try {
        if (this.mode === _EDIT) {
          this.updateUser(buttonCb);
        } else {
          this.createUser(buttonCb);
        }

        buttonCb(true);

        this.$router.push({
          name:   this.doneRoute,
          params: { resource: HARVESTER_COMBINE_USER }
        });
      } catch (err) {
        this.errors = exceptionToErrorsArray(err) || err;
        buttonCb(false);
      }
    },

    async createUser() {
      const newUser = await this.userRequest(`v1/${ MANAGEMENT.USER }`, {}, {
        type:               MANAGEMENT.USER,
        metadata:           { generateName: 'user-' },
        enabled:            true,
        mustChangePassword: false,
        username:           this.value.username,
        password:           this.value.password
      });

      await this.userRequest(`v3/${ NORMAN.USER }/${ newUser.id }`, { action: 'setpassword' }, { newPassword: this.value.password });
      await this.userRequest(`v1/${ MANAGEMENT.GLOBAL_ROLE_BINDINGS }`, {}, {
        type:           MANAGEMENT.GLOBAL_ROLE_BINDINGS,
        metadata:       { generateName: 'grb-' },
        userName:       newUser.id,
        globalRoleName: 'admin'
      });
    },

    async updateUser(buttonCb) {
      const url = `v3/${ NORMAN.USER }/${ this.value.id }`;
      const params = { action: 'setpassword' };
      const data = { newPassword: this.value.password };

      await this.userRequest(url, params, data);
    },

    userRequest(url, params, data) {
      return this.$store.dispatch('cluster/request', {
        method:  'POST',
        headers: {
          'content-type': 'application/json',
          accept:         'application/json',
        },
        url,
        params,
        data
      }, { root: true });
    }
  },
};
</script>

<template>
  <CruResource
    :done-route="doneRoute"
    :resource="value"
    :mode="mode"
    :errors="errors"
    @apply-hooks="applyHooks"
    @finish="saveUser"
  >
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab name="basic" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="3" class="bordered-table">
        <LabeledInput
          v-model="value.username"
          :label="t('harvester.userPage.username')"
          :disabled="isEdit"
          :mode="mode"
          class="mb-20"
          required
        />

        <LabeledInput
          v-model="value.password"
          :label="t('harvester.userPage.password')"
          type="password"
          :mode="mode"
          class="mb-20"
          required
        />
      </Tab>
    </Tabbed>
  </CruResource>
</template>
