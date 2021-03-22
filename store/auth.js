/* eslint-disable */
import { addPrefix } from '@/utils/url';
const ERR_CLIENT = 'client';
const ERR_SERVER = 'server';

export const state = function() {
  return {
    hasAuth:     true,
    loggedIn:    true,
    principalId: null,
    isRancher:   null,
  };
};

export const getters = {
  enabled(state) {
    return state.hasAuth;
  },

  loggedIn(state) {
    return state.loggedIn;
  },

  principalId(state) {
    return state.principalId;
  },

  isRancher(state) {
    return state.isRancher;
  }

};

export const mutations = {
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
  }
};

export const actions = {
  async getAuthModes() {
    try {
      const res = await this.$axios({
        method: 'get',
        url:    addPrefix('/v1-public/auth-modes')
      });

      if (res.data) {
        return Promise.resolve(res.data);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  },

  async getIsRancher({ dispatch, state }) {
    if (state.isRancher !== null) {
      return state.isRancher;
    }

    const { modes } = await dispatch('getAuthModes');

    state.isRancher = (modes || []).includes('rancher');

    return state.isRancher;
  },

  async login({ commit, dispatch }, { data }) {
    const body = data;
    let url = addPrefix('/v1-public/auth?action=login');
    const isRancher = await dispatch('getIsRancher');

    if (isRancher) {
      body.description = 'UI Session';
      body.responseType = 'cookie';
      body.ttl = 57600000;

      url = addPrefix('/v3-public/localProviders/local?action=login');
    }

    try {
      const res = await this.$axios({
        url,
        method: 'post',
        data:   body,
      });

      if (res.data || isRancher) {
        commit('loggedIn');
        commit('updatePrincipalId', data.username);
        this.$cookies.set('loggedIn', true);
        await dispatch('firstLogin', { body });

        return true;
      }
    } catch (err) {
      return Promise.reject(err);
    }
  },

  async firstLogin({ dispatch }, { body }) {
    const isRancher = await dispatch('getIsRancher');

    if (!isRancher || !body.password) {
      return;
    }

    const headers = { 'Content-Type': 'application/json' }

    const firstLogin = await this.$axios({
      url:    '/v3/settings/first-login',
      method: 'get',
      headers
    });


    if (firstLogin?.data?.value !== 'true') {
      return;
    }

    const { password } = body;

    await this.$axios({
      url:    '/v3/users?action=changepassword',
      method: 'post',
      headers,
      data: {
        currentPassword: password,
        newPassword:     password
      },
    });
  },

  async logout({ dispatch, commit }, clearToken = true) {
    if ( clearToken !== false ) {
      this.$cookies.remove('loggedIn');

      try {
        await this.$axios({
          method: 'post',
          url:    addPrefix('/v1-public/auth?action=logout')
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

function returnTo(opt, vm) {
  let { route = `/auth/verify` } = opt;

  if ( vm.$router.options && vm.$router.options.base ) {
    const routerBase = vm.$router.options.base;

    if ( routerBase !== '/' ) {
      route = `${ routerBase.replace(/\/+$/, '') }/${ route.replace(/^\/+/, '') }`;
    }
  }

  let returnToUrl = `${ window.location.origin }${ route }`;

  const parsed = parseUrl(window.location.href);

  if ( parsed.query.spa !== undefined ) {
    returnToUrl = addParam(returnToUrl, SPA, _FLAGGED);
  }

  if ( opt.backTo ) {
    returnToUrl = addParam(returnToUrl, BACK_TO, opt.backTo);
  }

  if (opt.config) {
    returnToUrl = addParam(returnToUrl, 'config', opt.config);
  }

  return returnToUrl;
}
