<script>
import { md5 } from '@/utils/crypto';
import Identicon from 'identicon.js';
import { allSettled } from '@/utils/promise';
import { HARVESTER_SETTING } from '@/config/types';
import Parse from 'url-parse';
import UpgradeInfo from './UpgradeInfo';

export default {
  components: { UpgradeInfo },

  async fetch() {
    await allSettled({ haversterSettings: this.$store.dispatch('cluster/findAll', { type: HARVESTER_SETTING }) });
    const isRancher = await this.$store.dispatch('auth/getIsRancher');

    this.isRancher = isRancher;
  },

  data() {
    return { isRancher: false };
  },

  computed: {
    authEnabled() {
      return this.$store.getters['auth/enabled'];
    },

    imgUrl() {
      const id = this.$store.getters['auth/principalId'];
      const hash = md5(id || 'Unknown', 'hex');
      const out = `data:image/png;base64,${ new Identicon(hash, 80, 0.01).toString() }`;

      return out;
    },

    backupRancher() {
      const parse = Parse(window.history.href);

      return `${ parse.protocol }//${ parse.hostname }:30444`;
    },

    enableRancher() {
      const rancher = this.$store.getters['cluster/all'](HARVESTER_SETTING).find(O => O.metadata.name === 'rancher-enabled');

      return rancher.value === 'true';
    }
  },

  methods: {
    goHome() {
      this.$router.replace('/c/local');
    }
  }
};
</script>

<template>
  <header>
    <div class="product">
      <div class="go" @click="goHome">
        <div class="logo" alt="Logo">
          <img src="~assets/images/pl/logo_horizontal_white.png" width="auto" height="35" />
        </div>
      </div>
    </div>

    <div class="top">
      <UpgradeInfo />
    </div>

    <div class="back">
      <a v-if="isRancher && enableRancher" class="btn role-tertiary" :href="backupRancher">
        {{ t('nav.backToRancher') }}
      </a>
    </div>

    <div class="user">
      <v-popover
        placement="bottom"
        offset="-10"
        trigger="hover"
        :delay="{show: 0, hide: 200}"
        :popper-options="{modifiers: { flip: { enabled: false } } }"
      >
        <div class="text-right">
          <img :src="imgUrl" width="40" height="40" />
        </div>

        <template slot="popover">
          <ul class="list-unstyled dropdown">
            <nuxt-link tag="li" :to="{name: 'prefs'}" class="hand">
              <a>{{ t('harvester.header.preference') }} <i class="icon icon-fw icon-gear" /></a>
            </nuxt-link>
            <nuxt-link v-if="authEnabled" tag="li" :to="{name: 'auth-logout'}" class="pt-5 pb-5 hand">
              <a>{{ t('harvester.header.logout') }} <i class="icon icon-fw icon-close" /></a>
            </nuxt-link>
          </ul>
        </template>
      </v-popover>
    </div>
  </header>
</template>

<style lang="scss" scoped>
  HEADER {
    display: grid;
    height: 100vh;
    grid-template-areas:  "product top back user";
    grid-template-columns: var(--nav-width) auto min-content var(--header-height);
    grid-template-rows:    var(--header-height);

    > * {
      display: flex;
      align-items: center;
      padding: 0 5px;
    }

    > .product {
      grid-area: product;
      background-color: var(--header-btn-bg);
      position: relative;

      .go {
        cursor: pointer;
      }

      .productName {
        color: #fff;
        line-height: 55px;
        left: 43px;
        position: absolute;
      }

      .logo {
        margin-top: 10px;
      }
    }

    > .top {
      grid-area: top;
      background-color: var(--header-bg);
      display: flex;
      // flex-direction: row-reverse;
    }

    > .back {
      grid-area: back;
      background-color: var(--header-bg);

      .btn {
        text-align: center;
      }

      .role-tertiary {
        color: #fff !important;
        background-color: var(--header-btn-bg);
        border: 1px solid #008080;
      }
    }

    > .user {
      grid-area: user;
      background-color: var(--header-bg);
      padding: 5px;

      IMG {
        border: 1px solid var(--header-btn-bg);
      }

      .avatar-round {
        border: 0;
        border-radius: 50%;
      }
    }
  }

  .list-unstyled {
    li {
      min-width: 100px;

      a {
        display: flex;
        justify-content: space-between;
        padding: 10px 20px;
      }

      &.user-info {
        display: block;
        margin-bottom: 10px;
        padding: 15px;
        border-bottom: solid 1px var(--border);
        min-width: 200px;
      }
    }
  }

  .popover .popover-inner {
    padding: 0;
    border-radius: 0;
  }

  .user-name {
    color: var(--secondary);
  }
</style>
