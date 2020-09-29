import { addPrefix } from '@/utils/url';
const ERR_CLIENT = 'client';
const ERR_SERVER = 'server';

export const state = function() {
  return {
    hasAuth:     true,
    loggedIn:    true,
    principalId: null,
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
};

export const actions = {
  async login({ commit }, { data }) {
    try {
      const res = await this.$axios({
        method: 'post',
        url:    addPrefix('/v1-public/auth?action=login'),
        data
      });

      if (res.data) {
        commit('loggedIn');
        this.$cookies.set('loggedIn', true);

        return true;
      }
    } catch (err) {
      return Promise.reject(err);
    }
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
