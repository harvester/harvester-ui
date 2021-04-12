<script>
import CreateEditView from '@/mixins/create-edit-view';
import CruResource from '@/components/CruResource';
import NameNsDescription from '@/components/form/NameNsDescription';
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import LabeledSelect from '@/components/form/LabeledSelect';
import YamlEditor, { EDITOR_MODES } from '@/components/YamlEditor';
import { HARVESTER_CLOUD_INIT_USER, HARVESTER_CLOUD_INIT_NETWORK } from '@/config/labels-annotations';

export default {
  name: 'CruConfigMap',

  components: {
    CruResource,
    NameNsDescription,
    Tab,
    Tabbed,
    LabeledSelect,
    YamlEditor
  },

  mixins: [CreateEditView],

  data() {
    let type = 'user';
    const isNetwork = !!this.value?.metadata?.labels?.[HARVESTER_CLOUD_INIT_NETWORK];

    if (isNetwork) {
      type = 'network';
    }

    return {
      config: this.value.data?.cloudInit || '',
      type
    };
  },

  computed: {
    editorMode() {
      return (this.isCreate || this.isEdit) ? EDITOR_MODES.EDIT_CODE : EDITOR_MODES.VIEW_CODE;
    },

    types() {
      return [
        {
          label: 'User Data',
          value: 'user'
        },
        {
          label: 'Network Data',
          value: 'network'
        }
      ];
    },

  },

  methods: {
    async saveConfig(buttonCb) {
      if (this.isCreate) {
        this.setTypeFlag();
      }

      await this.save(buttonCb);
    },

    update() {
      this.value.data = { cloudInit: this.config };
    },

    setTypeFlag() {
      let flag;

      if (this.type === 'user') {
        flag = { [HARVESTER_CLOUD_INIT_USER]: 'true' };
      } else {
        flag = { [HARVESTER_CLOUD_INIT_NETWORK]: 'true' };
      }

      this.value.metadata.labels = {
        ...this.value.metadata.labels,
        ...flag
      };
    },

    onChanges(cm, changes) {
      this.update();
      if ( changes.length !== 1 ) {
        return;
      }

      const change = changes[0];

      if ( change.from.line !== change.to.line ) {
        return;
      }

      let line = change.from.line;
      let str = cm.getLine(line);
      let maxIndent = indentChars(str);

      if ( maxIndent === null ) {
        return;
      }

      cm.replaceRange('', { line, ch: 0 }, { line, ch: 1 }, '+input');

      while ( line > 0 ) {
        line--;
        str = cm.getLine(line);
        const indent = indentChars(str);

        if ( indent === null ) {
          break;
        }

        if ( indent < maxIndent ) {
          cm.replaceRange('', { line, ch: 0 }, { line, ch: 1 }, '+input');

          if ( indent === 0 ) {
            break;
          }

          maxIndent = indent;
        }
      }

      function indentChars(str) {
        const match = str.match(/^#(\s+)/);

        if ( match ) {
          return match[1].length;
        }

        return null;
      }
    },
  }
};
</script>

<template>
  <CruResource
    :done-route="doneRoute"
    :mode="mode"
    :resource="value"
    :can-yaml="false"
    :errors="errors"
    @finish="saveConfig"
    @cancel="done"
  >
    <NameNsDescription
      :value="value"
      :mode="mode"
      :namespaced="false"
      :register-before-hook="registerBeforeHook"
    />

    <Tabbed :side-tabs="true">
      <Tab name="basics" :label="t('harvester.vmPage.detail.tabs.basics')" :weight="2">
        <div class="mb-20">
          <LabeledSelect
            v-model="type"
            :label="t('harvester.cloudInitPage.templateType')"
            :disabled="!isCreate"
            :localized-label="true"
            :options="types"
          />
        </div>
        <div class="resource-yaml">
          <YamlEditor
            ref="yamlUser"
            v-model="config"
            class="yaml-editor"
            :editor-mode="editorMode"
            @onChanges="onChanges"
          />
        </div>
      </Tab>
    </Tabbed>
  </CruResource>
</template>

<style lang="scss" scoped>
  .resource-yaml .yaml-editor {
    min-height: 200px;
  }
</style>
