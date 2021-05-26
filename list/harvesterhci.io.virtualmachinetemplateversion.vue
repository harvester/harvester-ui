<script>
import { STATE, AGE, NAME } from '@/config/table-headers';
import { HCI } from '@/config/types';
import Loading from '@/components/Loading';
import ResourceTable from '@/components/ResourceTable';
import { allHash } from '@/utils/promise';
import LiveData from '@/components/formatter/LiveDate';

export default {
  name:       'ListTemplate',
  components: {
    ResourceTable, LiveData, Loading
  },

  props: {
    schema: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const hash = await allHash({
      template:           this.$store.dispatch('cluster/findAll', { type: HCI.VM_TEMPLATE }),
      templateVersion:    this.$store.dispatch('cluster/findAll', { type: HCI.VM_VERSION }),
    });

    this.template = hash.template;
    this.templateVersion = hash.templateVersion;
  },

  data() {
    return {
      template:        [],
      templateVersion: [],
    };
  },

  computed: {
    headers() {
      return [
        STATE,
        NAME,
        {
          name:           'defaultVersion',
          label:          'Default Version',
          value:          'id',
          formatter:      'defaultVersion',
          labelKey:  'tableHeaders.vm.defaultVersion'
        },
        AGE
      ];
    },

    rows() {
      const out = [];

      for (const crd of this.template) {
        crd.customId = crd.id.replace(/[\d\D]*\//, '');
        out.push(crd);
      }

      for (const crd of this.templateVersion) {
        crd.customId = crd.spec.templateId.replace(/[\d\D]*\//, '');
        out.push(crd);
      }

      return out;
    },

    groupBy() {
      return 'customId';
    },

    groupTitleBy() {
      return HCI.VM_TEMPLATE;
    },

    LiveData() {
      return 'LiveData';
    }
  },

  methods: {
    showActions(e, row) {
      this.$store.commit('action-menu/show', {
        resources: row,
        elem:      e.target,
      });
    },
    valueFor(resource) {
      return resource?.metadata?.creationTimestamp;
    }
  },

};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <ResourceTable
    v-else
    v-bind="$attrs"
    :headers="headers"
    :sub-rows="true"
    :groupable="false"
    :rows="[...rows]"
    :group-title-by="groupTitleBy"
    :group-by="groupBy"
    :group-can-action="true"
    key-field="_key"
    v-on="$listeners"
  >
    <template slot="groupTitleAction" slot-scope="{group}">
      <td colspan="4">
        <slot name="group-by" :group="group" :row="group.gropActionRowRef">
          <div v-trim-whitespace class="group-tab">
            {{ group.ref }}
          </div>
        </slot>
      </td>

      <td align="right" class="data">
        <component
          :is="LiveData"
          :value="valueFor(group.gropActionRowRef)"
          :row="group.gropActionRowRef"
        >
        </component>
      </td>

      <td align="middle" class="action">
        <button
          aria-haspopup="true"
          aria-expanded="false"
          type="button"
          class="btn btn-sm role-multi-action"
          @click.stop="showActions($event, group.gropActionRowRef)"
        >
          <i class="icon icon-actions" />
        </button>
      </td>
    </template>
  </ResourceTable>
</template>

<style lang="scss" scoped>
.data {
  padding: 12px 5px !important;
}
.actions {
  width: 32px !important;
}
.action {
  width: 40px;
}
</style>
