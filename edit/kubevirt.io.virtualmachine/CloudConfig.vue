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
    }
  }
};
</script>

<template>
  <div @input="update">
    <h2>Cloud Config</h2>
    <div class="mb-20">
      <h3>User Data: </h3>
      <h5>
        You can specify user data to configure an instance or run a configuration script during launch. If you launch more than one instance at a time, the user data is available to all the instances in that reservation.
        <a target="_blank" href="https://cloudinit.readthedocs.io/en/latest/topics/examples.html">Learn more</a>
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
      <h3>Network Data:</h3>
      <h5>
        The network-data configuration allows you to customize the instance’s networking interfaces by assigning subnet configuration, virtual device creation (bonds, bridges, vlans) routes and DNS configuration.
        <a target="_blank" href="https://cloudinit.readthedocs.io/en/latest/topics/network-config-format-v1.html">Learn more</a>
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
