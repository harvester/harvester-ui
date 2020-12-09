<script>
import CruResource from '@/components/CruResource';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import NameNsDescription from '@/components/form/NameNsDescription';
import KeyValue from '@/components/form/KeyValue';
import CreateEditView from '@/mixins/create-edit-view';
import { allHash } from '@/utils/promise';
import { IMAGE } from '@/config/types';
import { DESCRIPTION } from '@/config/labels-annotations';
import { defaultAsyncData } from '@/components/ResourceDetail';
import Basic from './basic';

export default {
  name: 'Volume',

  components: {
    CruResource,
    Tab,
    Tabbed,
    Basic,
    NameNsDescription,
    KeyValue
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    await allHash({ image: this.$store.dispatch('cluster/findAll', { type: IMAGE }) });
  },

  asyncData(ctx) {
    const parentOverride = { displayName: 'Volume' };
    const resource = ctx.params.resource;

    return defaultAsyncData(ctx, resource, parentOverride);
  },

  data() {
    let spec = this.value.spec;
    const description = this.value.metadata?.annotations?.[DESCRIPTION];

    if (!spec) {
      spec = {
        pvc: {
          resources:   { requests: { storage: '' } },
          volumeMode:  'Filesystem',
          accessModes: ['ReadWriteOnce']
        },
        source: { blank: true }
      };
      this.value.spec = spec;
    }

    if (description) {
      // if description exist, copy it, then remove it from annotations
      this.$set(this.value.spec, 'description', description);
      this.value.setAnnotation(DESCRIPTION, null);
    }

    return {
      spec,
      index:  0,
      errors: [],
    };
  },

  watch: {
    spec(neu) {
      Object.assign(this.value.spec, neu);
    }
  },

  created() {
    this.registerBeforeHook(this.willSave, 'willSave');
  },

  methods: {
    updateAnno(neu) {
      this.$set(this.value.metadata, 'annotations', {
        ...this.value.metadata.annotations,
        ...neu
      });
    },
    willSave() {
      this.value.setAnnotation(DESCRIPTION, this.value.spec.description);

      this.value.spec.description = undefined;
    },
  },
};
</script>

<template>
  <div>
    <CruResource
      :done-route="doneRoute"
      :resource="value"
      :mode="mode"
      :errors="errors"
      @apply-hooks="applyHooks"
      @finish="save"
    >
      <NameNsDescription
        description-key="spec.description"
        :value="value"
        :namespaced="false"
        :mode="mode"
      />

      <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
        <Tab name="basic" :label="t('vm.detail.tabs.basics')" :weight="3" class="bordered-table">
          <Basic ref="vs" v-model="spec" :mode="mode" class="mb-20" @update:annotation="updateAnno" />
        </Tab>
        <Tab name="labels" :label="t('labels.label.title')" :weight="2" class="bordered-table">
          <KeyValue
            key="labels"
            :value="value.labels"
            :add-label="t('labels.addLabel')"
            :mode="mode"
            :title="t('labels.label.title')"
            :pad-left="false"
            :read-allowed="false"
            @input="value.setLabels"
          />
        </Tab>
      </Tabbed>
    </CruResource>
  </div>
</template>
