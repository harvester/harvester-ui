import { _CREATE, _EDIT, _VIEW } from '@/config/query-params';
import { LAST_NAMESPACE } from '@/store/prefs';
import { ANNOTATIONS_TO_IGNORE_REGEX, LABELS_TO_IGNORE_REGEX } from '@/config/labels-annotations';
import { exceptionToErrorsArray } from '@/utils/error';
import ChildHook, { BEFORE_SAVE_HOOKS, AFTER_SAVE_HOOKS, AFTER_FAILURE_HOOKS } from './child-hook';

export default {
  mixins: [ChildHook],

  props: {
    mode: {
      type:     String,
      required: true,
    },

    value: {
      type:     Object,
      required: true,
    },

    originalValue: {
      type:     Object,
      default: null,
    },

    moreDetails: {
      type:    Array,
      default: null
    }
  },

  data() {
    const v = this.value;

    // For easy access debugging...
    if ( typeof window !== 'undefined' ) {
      window.v = v;
      window.c = this;
    }

    // Ensure labels & annotations exists, since lots of things need them
    if ( !v.metadata ) {
      v.metadata = {};
    }

    if ( !v.metadata.annotations ) {
      v.metadata.annotations = {};
    }

    if ( !v.metadata.labels ) {
      v.metadata.labels = {};
    }

    // keep label and annotation filters in data so each resource CRUD page can alter individiaully
    return {
      errors:                   [],
      labelsToIgnoreRegex:      LABELS_TO_IGNORE_REGEX,
      annotationsToIgnoreRegex: ANNOTATIONS_TO_IGNORE_REGEX,
    };
  },

  computed: {
    isCreate() {
      return this.mode === _CREATE;
    },

    isEdit() {
      return this.mode === _EDIT;
    },

    isView() {
      return this.mode === _VIEW;
    },

    schema() {
      const inStore = this.$store.getters['currentProduct'].inStore;

      return this.$store.getters[`${ inStore }/schemaFor`](this.value.type);
    },

    isNamespaced() {
      return this.schema?.attributes?.namespaced || false;
    },

    labels: {
      get() {
        return this.value?.labels;
      },
      set(neu) {
        this.value.setLabels(neu);
      }
    },

    annotations: {
      get() {
        return this.value?.annotations;
      },
      set(neu) {
        this.value.setAnnotations(neu);
      }
    },

    doneRoute() {
      let name = this.$route.name;

      if ( name.endsWith('-id') ) {
        name = name.replace(/(-namespace)?-id$/, '');
      } else if ( name.endsWith('-create') ) {
        name = name.replace(/-create$/, '');
      }

      return name;
    },

    doneParams() {
      const out = { ...this.$route.params };

      delete out.namespace;
      delete out.id;

      return out;
    },

  },

  methods: {
    done() {
      if ( this.doneLocationOverride) {
        return this.$router.replace(this.doneLocationOverride);
      }

      if ( !this.doneRoute ) {
        return;
      }

      this.$router.replace({
        name:   this.doneRoute,
        params: this.doneParams || { resource: this.value.type }
      });
    },

    async save(buttonDone, url, noFetch = false) {
      this.errors = null;

      if (this.value?.nameDisplay && this.checkLength() === false) {
        this.errors = [this.$store.getters['i18n/t']('validation.custom.tooLongName', { max: 63 })];
        buttonDone(false);

        return;
      } else if (this.value?.nameDisplay === undefined) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Name' })];
        buttonDone(false);

        return;
      }

      try {
        const beforeHooksValue = await this.applyHooks(BEFORE_SAVE_HOOKS);

        if (beforeHooksValue.validate === false) {
          buttonDone(false);

          return;
        }

        // Remove the labels map if it's empty
        if ( this.value?.metadata?.labels && Object.keys(this.value.metadata.labels || {}).length === 0 ) {
          delete this.value.metadata.labels;
        }

        // Remove the annotations map if it's empty
        if ( this.value?.metadata?.annotations && Object.keys(this.value.metadata.annotations || {}).length === 0 ) {
          delete this.value.metadata.annotations;
        }

        if ( this.isCreate ) {
          if ( this.value?.metadata?.namespace ) {
            this.value.$dispatch('prefs/set', { key: LAST_NAMESPACE, value: this.value.metadata.namespace }, { root: true });
          }
        }

        if (noFetch === false) {
          await this.actuallySave(url);
        }

        await this.applyHooks(AFTER_SAVE_HOOKS);
        buttonDone(true);
        this.done();
      } catch (err) {
        await this.applyHooks(AFTER_FAILURE_HOOKS);
        this.errors = exceptionToErrorsArray(err);
        buttonDone(false);
      }
    },

    async actuallySave(url) {
      if ( this.isCreate ) {
        url = url || this.schema.linkFor('collection');
        const res = await this.value.save({ url });

        if (res) {
          Object.assign(this.value, res);
        }
      } else {
        await this.value.save();
      }
    },

    checkLength() {
      return this.value?.nameDisplay?.length <= 63;
    },
  },
};
