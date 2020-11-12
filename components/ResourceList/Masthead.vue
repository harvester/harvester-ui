<script>
import { mapGetters } from 'vuex';
import Favorite from '@/components/nav/Favorite';
import ButtonDropdown from '@/components/ButtonDropdown';
import TypeDescription from '@/components/TypeDescription';

export default {
  components: {
    ButtonDropdown,
    Favorite,
    TypeDescription,
  },
  props:      {
    resource: {
      type:     String,
      required: true
    },
    schema: {
      type:    Object,
      default: null
    },
    typeDisplay: {
      type:    String,
      default: ''
    },
    isCreatable: {
      type:    Boolean,
      default: false
    },
    isYamlCreatable: {
      type:    Boolean,
      default: false,
    },
    createLocation: {
      type:    Object,
      default: null
    },
    yamlCreateLocation: {
      type:    Object,
      default: null
    }
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

  computed: {
    ...mapGetters(['isExplorer']),

    resourceName() {
      if (this.customCreateFormName) { // get from custom list component
        return this.customCreateFormName;
      }

      if ( this.schema ) {
        return this.$store.getters['type-map/labelFor'](this.schema);
      }

      return this.resource;
    },
    disableCreateButton() {
      const type = this.resource;
      const inStore = this.$store.getters['currentProduct'].inStore;
      const config = this.$store.getters[`${ inStore }/getCacheConfig`](type);

      return config.disableCreateButton || false;
    }
  },
};
</script>

<template>
  <header>
    <TypeDescription :resource="resource" />
    <h1>
      {{ typeDisplay }}<Favorite v-if="isExplorer" :resource="resource" />
    </h1>
    <div class="actions">
      <ButtonDropdown
        v-if="isCreatable || isYamlCreatable"
        :disable-button="disableCreateButton"
      >
        <template #button-content="slotProps">
          <nuxt-link
            v-if="isCreatable"
            :to="createLocation"
            class="btn bg-transparent link"
            :class="slotProps.buttonSize"
            :disabled="disableCreateButton"
          >
            {{ t("resourceList.head.create") }}
          </nuxt-link>
          <nuxt-link
            v-else-if="!isCreatable && isYamlCreatable"
            :to="yamlCreateLocation"
            class="btn bg-transparent"
            :class="slotProps.buttonSize"
          >
            {{ t("resourceList.head.createFromYaml") }}
          </nuxt-link>
          <a
            v-else
            href="#"
            class="btn bg-transparent"
            :class="slotProps.buttonSize"
            disabled="true"
            @click.prevent.self
          >
            {{ t("resourceList.head.create") }}
          </a>
        </template>
        <template
          v-if="isCreatable && isYamlCreatable"
          slot="popover-content"
        >
          <ul class="list-unstyled menu" style="margin: -1px;">
            <li class="hand">
              <nuxt-link
                v-if="isCreatable"
                :to="createLocation"
              >
                {{ t("resourceList.head.createResource", { resourceName }) }}
              </nuxt-link>
            </li>
            <li class="divider">
              <div class="divider-inner"></div>
            </li>
            <li class="hand">
              <nuxt-link
                v-if="isYamlCreatable"
                :to="yamlCreateLocation"
              >
                {{ t("resourceList.head.createFromYaml") }}
              </nuxt-link>
            </li>
          </ul>
        </template>
      </ButtonDropdown>
    </div>
  </header>
</template>
