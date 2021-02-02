<script>
import { mapGetters } from 'vuex';
import { options } from '@/config/footer';
import { mapPref, DEV } from '@/store/prefs';
import { HARVESTER_SETTING } from '@/config/types';

const UNKNOWN = 'unknown';
const UI_VERSION = process.env.VERSION || UNKNOWN;
const UI_COMMIT = process.env.COMMIT || UNKNOWN;

export default {
  data() {
    // const match = fullVersion.match(/^(.*)-([0-9a-f]{40})-(.*)$/);

    // if ( match ) {
    //   displayVersion = match[2].substr(0, 7);
    // }

    return {
      uiCommit:       UI_COMMIT,
      uiVersion:      UI_VERSION
    };
  },

  computed: {
    ...mapGetters('i18n', ['selectedLocaleLabel', 'availableLocales']),

    dev: mapPref(DEV),

    fullVersion() {
      const settings = this.$store.getters['cluster/all'](HARVESTER_SETTING);
      const setting = settings.find( S => S.id === 'server-version');

      return setting?.value || setting?.default;
    },

    showLocale() {
      return Object.keys(this.availableLocales).length > 1 || this.dev;
    },

    showNone() {
      return this.dev && process.env.dev;
    },

    pl() {
      // @TODO PL support
      return 'rancher';
    },

    options() {
      return options(this.pl);
    },
  },

  methods: {
    switchLocale(locale) {
      this.$store.dispatch('i18n/switchTo', locale);
      this.$refs.popover.isOpen = false;
    }
  }
};

</script>

<template>
  <div class="footer">
    <div> {{ fullVersion }}</div>

    <div v-for="(value, name) in options" :key="name">
      <a v-t="name" :href="value" target="_blank" />
    </div>

    <div class="space" />

    <div v-if="showLocale">
      <v-popover
        ref="popover"
        placement="top"
        trigger="click"
      >
        <a style="cursor: pointer;">
          {{ selectedLocaleLabel }}
        </a>

        <template slot="popover">
          <ul class="list-unstyled dropdown" style="margin: -1px;">
            <li v-if="showNone" v-t="'locale.none'" class="p-10 hand" @click="switchLocale('none')" />
            <li
              v-for="(value, name) in availableLocales"
              :key="name"
              class="p-10 hand"
              @click="switchLocale(name)"
            >
              {{ value }}
            </li>
          </ul>
        </template>
      </v-popover>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    border-top: solid thin var(--border);

    > DIV {
      line-height: 30px;
      padding: 10px 20px;

      &.space {
        flex-grow: 1;
      }
    }
  }
</style>
