<script>
import { mapGetters } from 'vuex';
import Favorite from '@/components/nav/Favorite';
import TypeDescription from '@/components/TypeDescription';
import { clone, get } from '@/utils/object';
import { AS, _YAML } from '@/config/query-params';

export default {
  components: {
    Favorite,
    TypeDescription,
  },
  props: {
    resource: {
      type:     String,
      required: true,
    },
    schema: {
      type:    Object,
      default: null,
    },
    typeDisplay: {
      type:    String,
      default: null,
    },
    isCreatable: {
      type:    Boolean,
      default: null,
    },
    isYamlCreatable: {
      type:    Boolean,
      default: null,
    },
    createLocation: {
      type:    Object,
      default: null,
    },
    yamlCreateLocation: {
      type:    Object,
      default: null,
    },
  },

  async fetch() {
    const store = this.$store;
    const resource = this.resource;

    const importer = store.getters['type-map/importList'](resource);
    const component = (await importer())?.default;

    if (component?.customCreateFormName) {
      this.customCreateFormName = component.customCreateFormName.apply(this);
    }
  },

  data() {
    const params = { ...this.$route.params };
    const resource = params.resource;

    const formRoute = { name: `${ this.$route.name }-create`, params };

    const hasEditComponent = this.$store.getters['type-map/hasCustomEdit'](resource);

    const yamlRoute = {
      name:  `${ this.$route.name }-create`,
      params,
      query: { [AS]: _YAML },
    };

    return {
      formRoute,
      yamlRoute,
      hasEditComponent,
    };
  },

  computed: {
    get,
    ...mapGetters(['isExplorer']),

    resourceName() {
      if (this.customCreateFormName) { // get from custom list component
        return this.customCreateFormName;
      }

      if (this.schema) {
        return this.$store.getters['type-map/labelFor'](this.schema);
      }

      return this.resource;
    },

    disableCreateButton() {
      const type = this.resource;
      const inStore = this.$store.getters['currentProduct'].inStore;
      const config = this.$store.getters[`${ inStore }/getCacheConfig`](type);

      return config.disableCreateButton || false;
    },

    extraAction() {
      const opt = this.$store.getters[`type-map/optionsFor`](this.resource).extraListAction;

      if ( opt ) {
        const to = opt.to ? opt.to : clone(this.createLocation);

        if ( opt.query ) {
          to.query = Object.assign({}, to.query || {}, opt.query);
        }

        return {
          to,
          class: opt.classNames || 'btn role-primary',
          label: (opt.labelKey ? this.t(opt.labelKey) : opt.label || 'Action?' ),
        };
      }

      return null;
    },

    _typeDisplay() {
      if ( this.typeDisplay !== null) {
        return this.typeDisplay;
      }

      if ( !this.schema ) {
        return '?';
      }

      return this.$store.getters['type-map/labelFor'](this.schema, 99);
    },

    _isYamlCreatable() {
      if ( this.isYamlCreatable !== null) {
        return this.isYamlCreatable;
      }

      return this.schema && this._isCreatable && this.$store.getters['type-map/optionsFor'](this.$route.params.resource).canYaml;
    },

    _isCreatable() {
      // Does not take into account hasEditComponent, such that _isYamlCreatable works
      if ( this.isCreatable !== null) {
        return this.isCreatable;
      }

      if ( this.schema && !this.schema?.collectionMethods.find(x => x.toLowerCase() === 'post') ) {
        return false;
      }

      return this.$store.getters['type-map/optionsFor'](this.$route.params.resource).isCreatable;
    },

    _createLocation() {
      return this.createLocation || this.formRoute;
    },

    _yamlCreateLocation() {
      return this.yamlCreateLocation || this.yamlRoute;
    }

  },

  methods: {
    handlerCreateLocation() {
      this.$router.replace(this._createLocation);
    }
  }
};
</script>

<template>
  <header>
    <TypeDescription :resource="resource" />
    <div class="title">
      <h1 class="m-0">
        {{ _typeDisplay }} <Favorite v-if="isExplorer" :resource="resource" />
      </h1>
    </div>
    <div class="actions-container">
      <div class="actions">
        <slot name="extraActions">
        </slot>

        <n-link
          v-if="extraAction"
          :to="extraAction.to"
          :class="extraAction.class"
        >
          {{ extraAction.label }}
        </n-link>
        <button
          v-if="hasEditComponent && _isCreatable"
          class="btn role-primary hand"
          :disabled="disableCreateButton"
          @click="handlerCreateLocation"
        >
          {{ t("resourceList.head.create") }}
        </button>
        <n-link
          v-else-if="_isYamlCreatable"
          :to="_yamlCreateLocation"
          class="btn role-primary"
        >
          {{ t("resourceList.head.createFromYaml") }}
        </n-link>
      </div>
    </div>
  </header>
</template>
