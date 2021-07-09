/* eslint-disable */
import { randomStr } from '@/utils/string';
import { MANAGEMENT } from '@/config/types';
import { findBy, addObjects } from '@/utils/array';
import { openAuthPopup, returnTo } from '@/utils/auth';
import { GITHUB_SCOPE, GITHUB_NONCE, GITHUB_REDIRECT } from '@/config/query-params';
import { base64Encode } from '@/utils/crypto';
import { parse as parseUrl, removeParam, addParams } from '@/utils/url';
import Parse from 'url-parse';

export const BASE_SCOPES = {
  github:       ['read:org'],
  googleoauth:  ['openid profile email'],
  azuread:      [],
  keycloakoidc: ['profile,email']
};

const KEY = 'rc_nonce';

const ERR_NONCE = 'nonce';
const ERR_CLIENT = 'client';
const ERR_SERVER = 'server';

export const state = function() {
  return {
    fromHeader:      null,
    hasAuth:         true,
    loggedIn:        true,
    principalId:     null,
    authModes:       null,
    isFirstLogin:    null,
    serverUrlTimer:  null,
  };
};

export const getters = {
  fromHeader() {
    return state.fromHeader;
  },

  enabled(state) {
    return state.hasAuth;
  },

  loggedIn(state) {
    return state.loggedIn;
  },

  principalId(state) {
    return state.principalId;
  },

  authModes(state) {
    return state.authModes
  },

  isFirstLogin(state) {
    return state.isFirstLogin;
  },

  isGithub(state) {
    return state.principalId && state.principalId.startsWith('github_user://');
  }
};

export const mutations = {
  gotHeader(state, fromHeader) {
    state.fromHeader = fromHeader;
  },

  hasAuth(state, hasAuth) {
    state.hasAuth = !!hasAuth;
  },

  loggedIn(state) {
    state.loggedIn = true;
  },

  loggedOut(state) {
    // Note: plugin/norman/index watches for this mutation
    // to automatically disconnect subscribe sockets.

    state.loggedIn = false;
  },

  updatePrincipalId(state, id) {
    state.principalId = id;
  },

  setAuthModes(state, modes) {
    state.authModes = modes;
  },
};

export const actions = {
  gotHeader({ commit }, fromHeader) {
    commit('gotHeader', fromHeader);
  },

  getAuthProviders({ dispatch }) {
    return dispatch('rancher/findAll', {
      type: 'authProvider',
      opt:  { url: `/v3-public/authProviders`, watch: false }
    }, { root: true });
  },

  getAuthConfigs({ dispatch }) {
    return dispatch('rancher/findAll', {
      type: 'authConfig',
      opt:  { url: `/v3/authConfigs` }
    }, { root: true });
  },

  async getAuthConfig({ dispatch }, id) {
    const authConfigs = await dispatch('getAuthConfigs');

    return findBy(authConfigs, 'id', id);
  },

  async getAuthProvider({ dispatch }, id) {
    const authProviders = await dispatch('getAuthProviders');

    return findBy(authProviders, 'id', id);
  },

  setNonce({ dispatch }, opt) {
    const out = { nonce: randomStr(16), to: 'vue' };

    if ( opt.test ) {
      out.test = true;
    }

    if (opt.provider) {
      out.provider = opt.provider;
    }

    const strung = JSON.stringify(out);

    this.$cookies.set(KEY, strung, {
      path:     '/',
      sameSite: false,
      secure:   true,
    });

    return strung;
  },

  async test({ dispatch }, { provider, body }) {
    const driver = await dispatch('getAuthConfig', provider);
    try {
      // saml providers
      if (!!driver?.actions?.testAndEnable) {
        const finalRedirectUrl = returnTo({ config: provider }, this);

        const res = await driver.doAction('testAndEnable', { finalRedirectUrl });

        const { idpRedirectUrl } = res;

        return openAuthPopup(idpRedirectUrl, provider);
      } else {
      // github, google, azuread
        const res = await driver.doAction('configureTest', body);
        const { redirectUrl } = res;

        const url = await dispatch('redirectTo', {
          provider,
          redirectUrl,
          test:        true,
          redirect:    false
        });

        return openAuthPopup(url, provider);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  },

  verifyOAuth({ dispatch }, { nonce, code, provider }) {
    const expectJSON = this.$cookies.get(KEY, { parseJSON: false });
    let parsed;

    try {
      parsed = JSON.parse(expectJSON);
    } catch {
      return ERR_NONCE;
    }

    const expect = parsed.nonce;

    if ( !expect || expect !== nonce ) {
      return ERR_NONCE;
    }

    return dispatch('login', {
      provider,
      body: { code }
    });
  },

  async redirectTo({ state, commit, dispatch }, opt = {}) {
    const provider = opt.provider;
    let redirectUrl = opt.redirectUrl;

    if ( !redirectUrl ) {
      const driver = await dispatch('getAuthProvider', provider);

      redirectUrl = driver.redirectUrl;
    }
    let returnToUrl = `${ window.location.origin }/verify-auth`;

    if (provider === 'azuread') {
      const params = { response_type: 'code', response_mode: 'query' };

      redirectUrl = addParams(redirectUrl, params );
      returnToUrl = `${ window.location.origin }/verify-auth-azure`;
    }

    const nonce = await dispatch('setNonce', opt);

    const fromQuery = unescape(parseUrl(redirectUrl).query?.[GITHUB_SCOPE] || '');
    const scopes = fromQuery.split(/[, ]+/).filter(x => !!x);

    if (BASE_SCOPES[provider]) {
      addObjects(scopes, BASE_SCOPES[provider]);
    }

    if ( opt.scopes ) {
      addObjects(scopes, opt.scopes);
    }

    let url = removeParam(redirectUrl, GITHUB_SCOPE);

    const params = {
      [GITHUB_SCOPE]:    scopes.join(','),
      [GITHUB_NONCE]:   base64Encode(nonce, 'url')
    };

    if (!url.includes(GITHUB_REDIRECT)) {
      params[GITHUB_REDIRECT] = returnToUrl;
    }

    url = addParams(url, params);

    if ( opt.redirect === false ) {
      return url;
    } else {
      window.location.href = url;
    }
  },

  async login({ state, commit, dispatch }, { provider, body, isLocalUser }) {
    if (!isLocalUser) {
      const driver = await dispatch('getAuthProvider', provider);
      try {
        const res = await driver.doAction('login', {
          description:  'UI session',
          responseType: 'cookie',
          ...body
        }, { redirectUnauthorized: false });
        return res;
      } catch (err) {
        if ( err._status >= 400 && err._status <= 499 ) {
          return Promise.reject(ERR_CLIENT);
        }
  
        return Promise.reject(ERR_SERVER);
      }
    } else {
      let url = '/v3-public/localProviders/local?action=login';
      const isFirstLogin = state.isFirstLogin;
      const isPasswordMode = !!body.password;
      const passwordCopy = body.password;

      body.description = 'UI Session';
      body.responseType = 'cookie';
      body.ttl = 57600000;


      if (isFirstLogin && isPasswordMode) {
        body.username = 'admin';
        body.password = 'admin';
      }

      try {
        const res = await this.$axios({
          url,
          method: 'post',
          data:   body,
        });

        if (res.data) {
          commit('loggedIn');
          commit('updatePrincipalId', body.username);
          this.$cookies.set('loggedIn', true);

          try {
            if (isPasswordMode && isFirstLogin) {
              body.password = passwordCopy;
              await dispatch('applyRancherFirstLogin', { data: body });
            }

            if (isFirstLogin) {
              await dispatch('applyServerUrl');
            }

            this.$cookies.set('username', body.username);
          } catch (err) {
            return Promise.reject(err);
          }

          state.isFirstLogin = false;

          return true;
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
   
  },

  async isFirstLogin({ state }) {
    const headers = { 'Content-Type': 'application/json' }

    const firstLogin = await this.$axios({
      url: '/v3/settings/first-login',
      headers,
      method: 'get'
    });

    state.isFirstLogin = firstLogin?.data?.value === 'true';
  },

  async applyRancherFirstLogin(ctx, { data }) {
    await this.$axios({
      url:    '/v3/users?action=changepassword',
      method: 'post',
      data: {
        currentPassword: 'admin',
        newPassword:     data.password
      },
    });
  },

  async applyServerUrl(ctx) {
    const { state } = ctx;
    state.serverUrlTimer = setInterval(async () => {
      const settings = await ctx.dispatch('cluster/findAll', { type: MANAGEMENT.SETTING }, { root: true });

      if (settings.length === 0) {
        return;
      }

      const serverUrl = ctx.rootGetters['cluster/byId'](MANAGEMENT.SETTING, 'server-url');

      const parse = Parse(window.location.href);
      const origin = `${ parse.protocol }//${ parse.hostname }:30444`;

      if (serverUrl && !serverUrl?.value) {
        serverUrl.value = origin;

        try {
          await serverUrl.save();

          clearInterval(state.serverUrlTimer);
          state.serverUrlTimer = null;
        } catch(e) {
          console.log(e);
        }

      } else if (!serverUrl) {
        const value = {
          type: MANAGEMENT.SETTING,
          kind:       'Setting',
          metadata:   { name: 'server-url' },
          value:      origin
        };

        try {
          const proxyResource = await ctx.dispatch('cluster/create', value, { root: true });

          await proxyResource.save({ url: 'v1/management.cattle.io.settings' });

          clearInterval(state.serverUrlTimer);
          state.serverUrlTimer = null;
        } catch(e) {
          console.log(e);
        }
      } else {
        clearInterval(state.serverUrlTimer);
        state.serverUrlTimer = null;
      }
    }, 6000)

  },

  async logout({ dispatch, commit }, clearToken = true) {
    if ( clearToken !== false ) {
      this.$cookies.remove('loggedIn');
      this.$cookies.remove('username');

      try {
        await this.$axios({
          method: 'post',
          url:    '/v1-public/auth?action=logout'
        });
      } catch (err) {
        if (err._status >= 400 && err._status <= 499) {
          return Promise.reject(ERR_CLIENT);
        }

        return Promise.reject(ERR_SERVER);
      }
    }

    commit('loggedOut');
    dispatch('onLogout', null, { root: true });
  }
};
