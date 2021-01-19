<script>
import YamlEditor, { EDITOR_MODES } from '@/components/YamlEditor';
import { _CREATE, _EDIT } from '@/config/query-params';

export default {
  components: { YamlEditor },

  props: {
    userScript: {
      type:    String,
      default: ''
    },
    networkScript: {
      type:    String,
      default: ''
    },
    mode: {
      type:    String,
      default: 'create'
    }
  },

  data() {
    return {
      userData:    this.userScript,
      networkData: this.networkScript
    };
  },

  computed: {
    editorMode() {
      return (this.isCreate || this.isEdit) ? EDITOR_MODES.EDIT_CODE : EDITOR_MODES.VIEW_CODE;
    },
    isCreate() {
      return this.mode === _CREATE;
    },
    isEdit() {
      return this.mode === _EDIT;
    }
  },

  watch: {
    userScript(neu) {
      this.userData = neu;
    },
    networkData(neu) {
      this.networkData = neu;
    }
  },

  methods: {
    update() {
      this.$emit('updateCloudConfig', this.userData, this.networkData);
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
    refresh() {
      this.$refs.yamlUser.refresh();
      this.$refs.yamlNetwork.refresh();
    },
  }
};
</script>

<template>
  <div @input="update">
    <h2>{{ t('harvester.vmPage.cloudConfig.title') }}</h2>
    <div class="mb-20">
      <h3>{{ t('harvester.vmPage.cloudConfig.userData.title') }}</h3>
      <h5>
        <t k="harvester.vmPage.cloudConfig.userData.tip" :raw="true" />
      </h5>
      <div class="resource-yaml">
        <YamlEditor
          ref="yamlUser"
          v-model="userData"
          class="yaml-editor"
          :editor-mode="editorMode"
          @onChanges="onChanges"
        />
      </div>
    </div>

    <div>
      <h3>{{ t('harvester.vmPage.cloudConfig.networkData.title') }}</h3>
      <h5>
        <t k="harvester.vmPage.cloudConfig.networkData.tip" :raw="true" />
      </h5>

      <div class="resource-yaml">
        <YamlEditor
          ref="yamlNetwork"
          v-model="networkData"
          class="yaml-editor"
          :editor-mode="editorMode"
          @onChanges="onChanges"
        />
      </div>
    </div>
  </div>
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

  footer .actions {
    text-align: center;
  }
}
</style>
