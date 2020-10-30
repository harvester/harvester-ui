<script>
import Md5 from '@/utils/crypto/browserMd5';
import Identicon from 'identicon.js';

export default {
  components: {},

  computed: {
    authEnabled() {
      return this.$store.getters['auth/enabled'];
    },

    imgUrl() {
      const hash = new Md5();
      const imgData = new Identicon(hash.digest('hex'), 40).toString();

      return `data:image/png;base64,${ imgData }`;
    },
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
        <div class="productName">
          Harvester
        </div>
        <div class="logo" alt="Logo" />
      </div>
    </div>

    <div class="top"></div>

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
              <a>Preferences <i class="icon icon-fw icon-gear" /></a>
            </nuxt-link>
            <nuxt-link v-if="authEnabled" tag="li" :to="{name: 'auth-logout'}" class="pt-5 pb-5 hand">
              <a>Log Out <i class="icon icon-fw icon-close" /></a>
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
    grid-template-areas:  "product top user";
    grid-template-columns: var(--nav-width) auto var(--header-height);
    grid-template-rows:    var(--header-height);

    > .product {
      grid-area: product;
      background-color: var(--header-btn-bg);
      position: relative;

      .go {
        cursor: pointer;
      }

      .productName {
        color: #fff;
        font-size: 18px;
        line-height: 50px;
        left: 84px;
        position: absolute;
      }

      .logo {
        background-color: var(--header-logo);
        mask: url("~assets/images/logo.svg") no-repeat center;
        height: 33px;
        width: 56px;
        position: absolute;
        top: 9px;
        left: 15px;
        z-index: 2;
      }
    }

    > .top {
      grid-area: top;
      background-color: var(--header-bg);
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
      a {
        display: flex;
        justify-content: space-between;
        padding: 10px;
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
