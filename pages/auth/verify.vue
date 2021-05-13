<script>
/* eslint-disable */
import qs from 'query-string'
import { GITHUB_CODE, GITHUB_NONCE, BACK_TO } from '@/config/query-params';
import { get } from '@/utils/object';
import { base64Decode } from '@/utils/crypto';
const samlProviders = ['ping', 'adfs', 'keycloak', 'okta', 'shibboleth'];

function reply(err, code) {
  try {
    window.opener.window.onAuthTest(err, code);
    setTimeout(() => {
      window.close();
    }, 250);
  } catch (e) {
    window.close();
  }
}

export default {
  layout: 'unauthenticated',

  async fetch({ store, route, redirect }) {
    const { query: { code, state: stateStr }} = qs.parseUrl(window.location.href)
    // const code = route.query[GITHUB_CODE];
    // const stateStr = route.query[GITHUB_NONCE] || '';

    let parsed;

    try {
      parsed = JSON.parse(base64Decode((stateStr)));
    } catch {
      return;
    }

    const { test, provider, nonce } = parsed;

    if (test) {
      return;
    }

    const res = await store.dispatch('auth/verifyOAuth', {
      code,
      nonce,
      provider
    });

    if ( res._status === 200) {
      // redirect({path: '/', query: {}});
      const { url } = qs.parseUrl(window.location.href)
      window.location.href = url
    } else {
      redirect(`/auth/login?err=${ escape(res) }`);
    }
  },

  data() {
    const { query: { code, state: stateStr }} = qs.parseUrl(window.location.href)
    const stateJSON = stateStr || '';

    let parsed = {};

    try {
      parsed = JSON.parse(base64Decode(stateJSON));
    } catch {
    }

    const { test } = parsed;

    return { 
      testing: test,
      code: code
    };
  },

  mounted() {
    if ( this.testing ) {
      try {
        reply(null, this.code );
      } catch (e) {
        window.close();
      }
    } else {
      const { query } = this.$route;

      if ( window.opener ) {
        const configQuery = get(query, 'config');

        if ( samlProviders.includes(configQuery) ) {
          if ( window.opener.window.onAuthTest ) {
            reply(null, null);
          } else {
            reply({ err: 'failure' });
          }
        }
      }
    }
  },
};
</script>

<template>
  <main>
    <h1 class="text-center mt-50">
      <span v-if="testing">
        Testing&hellip;
      </span>
      <span v-else>
        Logging In&hellip;
      </span>
    </h1>
  </main>
</template>
