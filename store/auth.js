/* eslint-disable */
import { addPrefix, getPrefix } from '@/utils/url';
import { HARVESTER_USER, HARVESTER_SETTING } from '@/config/types';
import Parse from 'url-parse';

const ERR_CLIENT = 'client';
const ERR_SERVER = 'server';

export const state = function() {
  return {
    hasAuth:         true,
    loggedIn:        true,
    principalId:     null,
    authModes:       null,
    isRancher:       null,
    isFirstLogin:    null,
    canGetAuthModes: true,
    serverUrlTimer:  null,
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

  authModes(state) {
    return state.authModes
  },

  isRancher(state) {
    return state.isRancher;
  },

  isFirstLogin(state) {
    return state.isFirstLogin;
  },

  canGetAuthModes(state) {
    return state.canGetAuthModes;
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
  },

  canGetAuthModes(state, status) {
    state.canGetAuthModes = status;
  },

  setAuthModes(state, modes) {
    state.authModes = modes;
  },

  setIsRancher(state, isRancher) {
    state.isRancher = isRancher;
  }
};

export const actions = {
  canGetAuthModes({ commit }, { status }) {
    commit('canGetAuthModes', status)
  },

  async getAuthModes({ commit, dispatch }) {
    try {
      const res = await this.$axios({
        method: 'get',
        url:    addPrefix('/v1-public/auth-modes')
      });

      if (res.data) {
        commit('setAuthModes', res.data.modes);
        commit('setIsRancher', (res.data.modes || []).includes('rancher'))
        await dispatch('isFirstLogin');

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

    let { authModes: modes } = state;

    if (!modes) {
      const authModes = await dispatch('getAuthModes');

      modes = authModes.modes;
    }

    state.isRancher = (modes || []).includes('rancher');

    return state.isRancher;
  },

  async login({ state, commit, dispatch }, { data }) {
    const body = data;
    let url = addPrefix('/v1-public/auth?action=login');
    const isRancher = state.isRancher;
    const isFirstLogin = state.isFirstLogin;
    const isPasswordMode = !!body.password;
    const passwordCopy = body.password;

    if (isRancher) {
      body.description = 'UI Session';
      body.responseType = 'cookie';
      body.ttl = 57600000;

      url = addPrefix('/v3-public/localProviders/local?action=login');
    }

    if (isFirstLogin && isPasswordMode) {
      body.username = 'admin';

      if (isRancher) {
        body.password = 'admin';
      } else {
        body.password = 'password';
      }
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
        commit('canGetAuthModes', true);
        try {
          if (!isRancher && isPasswordMode && isFirstLogin) {
            await dispatch('applyHarvesterFirstLogin', { data: { password: passwordCopy} });
          }
  
          if (isRancher && isPasswordMode && isFirstLogin) {
            body.password = passwordCopy;
            await dispatch('applyRancherFirstLogin', { data: body });
          }
  
          if (isRancher && !isFirstLogin) {
            await dispatch('applyServerUrl');
          }
        } catch (err) {
          return Promise.reject(err);
        }

        state.isFirstLogin = false;

        return true;
      }
    } catch (err) {
      return Promise.reject(err);
    }
  },

  async isFirstLogin({ state }) {
    const isRancher = state.isRancher;
    let url;

    if (isRancher) {
      url = '/v3/settings/first-login';
    } else {
      url = '/v1/settings/first-login';
    }

    const headers = { 'Content-Type': 'application/json' }

    const firstLogin = await this.$axios({
      url,
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

  async applyHarvesterFirstLogin(ctx, { data }) {
    const { data: {data: users} } = await this.$axios({
      url: `/v1/${ HARVESTER_USER }s`,
      method: 'get'
    });
    const userResource = users.find(u => u.username === 'admin');

    if (!userResource) {
      return;
    }
    
    userResource.password = data.password;
    await this.$axios({
      url: `/v1/${HARVESTER_USER}s/${userResource.id}`,
      method: 'put',
      data: userResource
    });
  },

  async applyServerUrl(ctx) {
    const { state } = ctx;

    state.serverUrlTimer = setInterval(async () => {
      const settings = ctx.rootGetters['cluster/all'](HARVESTER_SETTING);

      if (settings.length === 0) {
        return;
      }


      const serverUrl = ctx.rootGetters['cluster/byId'](HARVESTER_SETTING, 'server-url');
      const { origin } = Parse(window.location.href);

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
          apiVersion: 'harvester.cattle.io/v1alpha1',
          kind:       'Setting',
          metadata:   { name: 'server-url' },
          value:      origin
        };

        try {
          const proxyResource = await ctx.dispatch('cluster/create', value, { root: true });

          await proxyResource.save({ url: 'v1/harvester.cattle.io.settings' });

          clearInterval(state.serverUrlTimer);
          state.serverUrlTimer = null;
        } catch(e) {
          console.log(e);
        }
      } else {
        clearInterval(state.serverUrlTimer);
        state.serverUrlTimer = null;
      }
    }, 20000)
    
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

    if (getPrefix()) {
      commit('canGetAuthModes', false);
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
