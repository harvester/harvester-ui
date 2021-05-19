
<script>
import CruResource from '@/components/CruResource';
import LabeledSelect from '@/components/form/LabeledSelect';
import CreateEditView from '@/mixins/create-edit-view';
import Card from '@/components/Card';
import Checkbox from '@/components/form/Checkbox';
import { exceptionToErrorsArray } from '@/utils/error';
import { RBAC, NORMAN } from '@/config/types';
import { allSettled } from '@/utils/promise';
import RadioGroup from '@/components/form/RadioGroup';

export default {
  name: 'EditMember',

  components: {
    Card,
    Checkbox,
    RadioGroup,
    CruResource,
    LabeledSelect
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    try {
      const hash = await allSettled({ allRoles: this.$store.dispatch('cluster/findAll', { type: RBAC.CLUSTER_ROLE }) });

      this.allRoles = hash.allRoles.filter(R => R.namespaceRole);

      const globalType = [
        'harvester-namespace-owner',
        'harvester-namespace-member',
        'harvester-read-only'
      ];

      this.sortedRoles = {
        global: [],
        custom: []
      };

      this.allRoles.forEach((role) => {
        if (globalType.includes(role.id)) {
          this.sortedRoles.global.push({
            label: this.getRoleType(role),
            value: role.id
          });
        } else {
          this.sortedRoles.custom.push(role);
        }
      });

      this.sortedRoles.global.push({
        label: 'Custom',
        value: 'custom'
      });

      const sort = (a, b) => a.nameDisplay.localeCompare(b.nameDisplay);

      this.sortedRoles.custom = this.sortedRoles.custom.sort(sort);
    } catch (e) {
    }
  },

  data() {
    return {
      clusterRoles:  [],
      memberName:    '',
      selectedRoles: [],
      sortedRoles:   {
        global: [],
        custom: []
      },
      globalSelected:  '',
      principalOption: []
    };
  },

  computed: {
    isCustom() {
      return this.globalSelected === 'custom';
    }
  },

  methods: {
    getRoleType(role) {
      if (role.isOwner) {
        return 'Owner';
      } else if (role.isMember) {
        return 'Member';
      } else if (role.isReadOnly) {
        return 'Read Only';
      }
    },

    async saveMember(buttonCb) {
      const requestOptions = {
        kind:       'RoleBinding',
        type:       RBAC.ROLE_BINDING,
        metadata:   {
          labels:       { 'harvesterhci.io/managed': 'true' },
          generateName: 'rolebinding-',
          namespace:    'default'
        },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind:     'ClusterRole',
        },
        subjects: [
          {
            apiGroup: 'rbac.authorization.k8s.io',
            kind:     'User',
            name:     'local://user-9t9zm'
          }
        ]
      };

      const newBindings = await Promise.all(this.selectedRoles.map(role => this.$store.dispatch(`cluster/create`, {
        ...requestOptions,
        roleRef: {
          ...requestOptions.roleRef,
          name: role
        }
      })));

      // Save all changes (and ensure user isn't logged out if they don't have permissions to make a change)
      try {
        await Promise.all(newBindings.map(newBinding => newBinding.save({ redirectUnauthorized: false })));
        buttonCb(true);
        this.done();
      } catch (e) {
        this.errors = exceptionToErrorsArray(e);
        buttonCb(false);
      }
    },

    async searchPrincipal(search) {
      const principals = await this.$store.dispatch('rancher/collectionAction', {
        type: NORMAN.PRINCIPAL,
        opt:  { url: '/v3/principals?action=search' },
        body: { name: search }
      });

      const arr = principals.data;

      console.log('---value', arr);
      this.principalOption = [{
        label: 'wj',
        value: 'wj'
      }];
    }
  }
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
    @finish="saveMember"
    @cancel="done"
  >
    <div id="member">
      <div class="row">
        <div class="col span-6">
          <LabeledSelect
            v-model="memberName"
            label="Member"
            :searchable="true"
            :localized-label="true"
            :options="principalOption"
            @search="searchPrincipal"
          />
        </div>
      </div>

      <Card
        :show-highlight-border="false"
        :show-actions="false"
      >
        <template v-slot:title>
          <div class="type-title">
            <h3>Namespace Permissions</h3>
            <div class="type-description">
              Controls what access users have to the Namespace.
            </div>
          </div>
        </template>

        <template v-slot:body>
          <template v-if="sortedRoles.global.length">
            <RadioGroup
              v-model="globalSelected"
              name="global"
              :options="sortedRoles.global"
              :mode="mode"
            />
          </template>

          <div
            v-if="isCustom"
            class="checkbox-section ml-40"
          >
            <div
              v-for="role in sortedRoles.custom"
              :key="role.id"
              class="checkbox mb-10 mr-10"
            >
              <Checkbox
                :key="role.id"
                v-model="selectedRoles"
                :value-when-true="role.id"
                :label="role.nameDisplay"
                :description="role.description"
                :mode="mode"
              >
                <template #label>
                  <div class="checkbox-label-slot">
                    <span class="checkbox-label">{{ role.nameDisplay }}</span>
                  </div>
                </template>
              </Checkbox>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </CruResource>
</template>

<style lang='scss'>
#member {
  .card-container {
    margin: 10px 0 0 0;
  }
}
</style>

<style lang="scss" scoped>
.checkbox-section {
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  grid-template-columns: 100%;

  .checkbox-label {
    &-slot {
      display: inline-flex;
      align-items: center;
    }
    color: var(--body-text);
    margin: 0;
  }
}
</style>
