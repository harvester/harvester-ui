<script>
import CreateEditView from '@/mixins/create-edit-view';
import CruResource from '@/components/CruResource';
import NameNsDescription from '@/components/form/NameNsDescription';
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import LabeledSelect from '@/components/form/LabeledSelect';
import YamlEditor, { EDITOR_MODES } from '@/components/YamlEditor';
import { HARVESTER_CLOUD_INIT, HARVESTER_CLOUD_INIT_CREATOR } from '@/config/labels-annotations';

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
    return {
      config: this.value.data?.cloudInit || '',
      type:   this.value?.metadata?.labels?.[HARVESTER_CLOUD_INIT] || 'user',
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
        this.value.metadata.labels = {
          ...this.value.metadata.labels,
          [HARVESTER_CLOUD_INIT]:         this.type,
          [HARVESTER_CLOUD_INIT_CREATOR]: this.$cookies.get('username') || ''
        };
      }

      await this.save(buttonCb);
    },

    update() {
      this.value.data = { cloudInit: this.config };
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

<style lang="scss">
$yaml-height: 200px;

.resource-yaml {
  flex: 1;
  display: flex;
  flex-direction: column;

  & .yaml-editor{
    flex: 1;
    min-height: $yaml-height;
    & .code-mirror .CodeMirror {
      position: initial;
      height: auto;
      min-height: $yaml-height;
    }
  }
}
</style>
