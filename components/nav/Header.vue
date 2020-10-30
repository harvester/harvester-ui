<script>
import { mapGetters } from 'vuex';
import { NORMAN, VM } from '@/config/types';
import Md5 from '@/utils/crypto/browserMd5';
import Identicon from 'identicon.js';

export default {
  components: {},

  computed: {
    ...mapGetters(['clusterReady', 'isMultiCluster', 'currentCluster',
      'currentProduct', 'isExplorer', 'backToRancherLink', 'backToRancherGlobalLink']),

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
    goVM() {
      this.$router.replace({
        name:   'c-cluster-product-resource',
        params: {
          resource: VM,
          product:  'virtual',
        }
      });
    }
  }
};
</script>

<template>
  <header>
    <div class="product">
      <div class="go" @click="goVM">
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

    ::v-deep .btn {
      border: 1px solid var(--header-btn-bg);
      background: rgba(0,0,0,.05);
      margin-left: 10px;
      color: var(--header-btn-text);
    }

    grid-template-areas:  "product apps top back kubectl cluster user";
    grid-template-columns: var(--nav-width) 0 auto min-content min-content min-content var(--header-height);
    grid-template-rows:    var(--header-height);

    &.explorer {
      grid-template-columns: var(--nav-width) min-content auto min-content min-content min-content var(--header-height);
    }

    > .apps {
      grid-area: apps;
      background-color: var(--header-bg);
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

    > .back {
      grid-area: back;
      background-color: var(--header-bg);
    }

    > .kubectl {
      grid-area: kubectl;
      background-color: var(--header-bg);
    }

    > .apps,
    > .back,
    > .kubectl {
      text-align: right;
      padding: 0 5px 0 0;

      .btn {
        margin: 8px 0 0 0;
        text-align: center;
      }
    }

    > .apps {
      padding: 0 0 0 5px;
    }

    > .cluster {
      grid-area: cluster;
      background-color: var(--header-bg);
      position: relative;
    }

    > .top {
      grid-area: top;
      background-color: var(--header-bg);
      padding-top: 8px;

      INPUT[type='search']::placeholder,
      .vs__open-indicator,
      .vs__selected {
        color: var(--header-btn-bg) !important;
        background: var(--header-btn-bg);
        border-radius: var(--border-radius);
        border: none;
        margin: 0 35px 0 25px!important;
      }

      .vs__selected {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.25);
      }

      .vs__deselect {
        fill: var(--header-btn-bg);
      }

      .filter {
        padding-left: 5px;
      }

      .filter .vs__dropdown-toggle {
        background: var(--header-btn-bg);
        border-radius: var(--border-radius);
        border: none;
        margin: 0 35px 0 25px!important;
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
