<script>
import CruResource from '@/components/CruResource';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabeledInput from '@/components/form/LabeledInput';
import CreateEditView from '@/mixins/create-edit-view';
import { MANAGEMENT, HARVESTER_USER, NORMAN, RBAC } from '@/config/types';
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

  computed: {
    isEdit() {
      return this.mode === _EDIT;
    },

    isRancher() {
      return this.$store.getters['auth/isRancher'];
    }
  },

  methods: {
    async saveUser(buttonCb) {
      if (!this.isRancher) {
        return this.save(buttonCb);
      }

      try {
        if (this.isEdit) {
          await this.updateUser(buttonCb);
        } else {
          await this.createUser(buttonCb);
        }

        buttonCb(true);

        this.$router.push({
          name:   this.doneRoute,
          params: { resource: HARVESTER_USER }
        });
      } catch (err) {
        this.errors = exceptionToErrorsArray(err) || err;
        buttonCb(false);
      }
    },

    async createUser() {
      const newUser = await this.userRequest('management', `/v1/${ MANAGEMENT.USER }s`, {
        type:               MANAGEMENT.USER,
        metadata:           { generateName: 'user-' },
        enabled:            true,
        mustChangePassword: false,
        username:           this.value.username,
        password:           this.value.password
      });

      const setPasswordPromise = this.userRequest('rancher', `/v3/${ NORMAN.USER }s/${ newUser.id }`, { newPassword: this.value.password }, { action: 'setpassword' });
      const setRolePromise = this.userRequest('management', `/v1/${ RBAC.GLOBAL_ROLE_BINDING }s`, {
        type:           RBAC.GLOBAL_ROLE_BINDING,
        metadata:       { generateName: 'grb-' },
        userName:       newUser.id,
        globalRoleName: 'admin'
      });

      await Promise.all([setPasswordPromise, setRolePromise]);
    },

    async updateUser() {
      const url = `/v3/${ NORMAN.USER }s/${ this.value.id }`;
      const params = { action: 'setpassword' };
      const data = { newPassword: this.value.password };

      await this.userRequest('rancher', url, data, params);
    },

    userRequest(module, url, data, params) {
      return this.$store.dispatch(`${ module }/request`, {
        method:  'POST',
        headers: {
          'content-type': 'application/json',
          accept:         'application/json',
        },
        url,
        params,
        data
      });
    },

    done() {
      const doneParams = this.doneParams;

      doneParams.resource = HARVESTER_USER;

      this.$router.push({
        name:   this.doneRoute,
        params: doneParams
      });
    },
  },
};
</script>

<template>
  <CruResource
    :can-yaml="false"
    :done-route="doneRoute"
    :cancel-event="true"
    :resource="value"
    :mode="mode"
    :errors="errors"
    @apply-hooks="applyHooks"
    @finish="saveUser"
    @cancel="done"
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
