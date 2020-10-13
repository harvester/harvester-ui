<script>
import { mapGetters } from 'vuex';
import capitalize from 'lodash/capitalize';
import Favorite from '@/components/nav/Favorite';

export default {
  components: { Favorite },
  props:      {
    resource: {
      type:     String,
      required: true
    },
    typeDisplay: {
      type:    String,
      default: ''
    },
    customCreateFormName: {
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

  computed: {
    ...mapGetters(['isExplorer']),

    resourceName() {
      if (this.customCreateFormName) {
        return this.customCreateFormName;
      }

      return this.resource.includes('.') ? this.resource : capitalize(this.resource);
    },
  },
};
</script>

<template>
  <header>
    <h1>
      {{ typeDisplay }} <Favorite v-if="isExplorer" :resource="resource" />
    </h1>
    <div class="actions">
      <a-dropdown-button v-if="isCreatable || isYamlCreatable" :trigger="['click']" type="primary" size="large">
        <nuxt-link
          v-if="isCreatable"
          :to="createLocation"
          class="btn bg-transparent"
        >
          {{ t("resourceList.head.create") }}
        </nuxt-link>
        <nuxt-link
          v-else-if="!isCreatable && isYamlCreatable"
          :to="yamlCreateLocation"
          class="btn bg-transparent"
        >
          {{ t("resourceList.head.createFromYaml") }}
        </nuxt-link>
        <a
          v-else
          href="#"
          class="btn bg-transparent"
          disabled="true"
          @click.prevent.self
        >
          {{ t("resourceList.head.create") }}
        </a>
        <a-menu slot="overlay">
          <a-menu-item>
            <nuxt-link
              v-if="isCreatable"
              :to="createLocation"
            >
              {{ t("resourceList.head.createResource", { resourceName }) }}
            </nuxt-link>
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item>
            <nuxt-link
              v-if="isYamlCreatable"
              :to="yamlCreateLocation"
            >
              {{ t("resourceList.head.createFromYaml") }}
            </nuxt-link>
          </a-menu-item>
        </a-menu>
        <a-icon slot="icon" type="down" />
      </a-dropdown-button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
  button a {
    padding:0 28px;
    vertical-align: baseline;
  }
</style>
