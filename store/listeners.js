import Vue from 'vue';

const keydown = function(e) {
  const commit = this.commit;
  const keyCode = e.keyCode;

  if ([224, 17, 91, 93].includes(keyCode)) {
    commit('listeners/commandDown', true);
  } else {
    commit('listeners/commandDown', false);
  }
};

const keyup = function() {
  const commit = this.commit;

  commit('listeners/commandDown', false);
};

export const state = function() {
  return { commandDown: false };
};

export const getters = { commandDown: state => state.commandDown };

export const mutations = {
  load(state, { key, value }) {
    Vue.set(state.data, key, value);
  },

  commandDown(state, b) {
    state.commandDown = b;
  },
};

export const actions = {
  onKeyDown({ state, commit }) {
    document.addEventListener('keydown', keydown.bind(this));
    document.addEventListener('keyup', keyup.bind(this));
  },

  offKeyDown() {
    document.removeEventListener('keydown', keydown.bind(this));
    document.removeEventListener('keyup', keyup.bind(this));
  }
};
