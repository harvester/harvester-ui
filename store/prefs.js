import Vue from 'vue';
import { STEVE } from '@/config/types';
import { clone } from '@/utils/object';

const definitions = {};

export const create = function(name, def, opt = {}) {
  const parseJSON = opt.parseJSON === true;
  const asCookie = opt.asCookie === true;
  const asUserPreference = opt.asUserPreference !== false;
  const options = opt.options;

  definitions[name] = {
    def,
    options,
    parseJSON,
    asCookie,
    asUserPreference,
    mangleRead:  opt.mangleRead, // Alter the value read from the API (to match old Rancher expectations)
    mangleWrite: opt.mangleWrite, // Alter the value written back to the API (ditto)
  };

  return name;
};

export const mapPref = function(name) {
  return {
    get() {
      return this.$store.getters['prefs/get'](name);
    },

    set(value) {
      this.$store.dispatch('prefs/set', { key: name, value });
    }
  };
};

// --------------------
const parseJSON = true; // Shortcut for setting it below
const asCookie = true; // Store as a cookie so that it's available before auth + on server-side

// Keys must be lowercase and valid dns label (a-z 0-9 -)
export const CLUSTER = create('cluster', '');
export const LAST_NAMESPACE = create('last-namespace', '');
export const NAMESPACE_FILTERS = create('ns', ['all'], { parseJSON });
export const EXPANDED_GROUPS = create('open-groups', ['cluster', 'rbac', 'serviceDiscovery', 'storage', 'workload'], { parseJSON });
export const FAVORITE_TYPES = create('fav-type', [], { parseJSON });
export const GROUP_RESOURCES = create('group-by', 'namespace');
export const DIFF = create('diff', 'unified', { options: ['unified', 'split'] });
export const THEME = create('theme', 'light', {
  options:     ['light'],
  asCookie,
  parseJSON,
  mangleRead:  x => x.replace(/^ui-/, ''),
  mangleWrite: x => `ui-${ x }`,
});
export const PREFERS_SCHEME = create('pcs', '', { asCookie, asUserPreference: false });
export const LOCALE = create('locale', 'en-us', { asCookie });
export const KEYMAP = create('keymap', 'sublime', { options: ['sublime', 'emacs', 'vim'] });
export const ROWS_PER_PAGE = create('per-page', 100, { options: [10, 25, 50, 100, 250, 500, 1000], parseJSON });
export const LOGS_WRAP = create('logs-wrap', true, { parseJSON });
export const LOGS_TIME = create('logs-time', true, { parseJSON });
export const LOGS_RANGE = create('logs-range', '30 minutes', { parseJSON });

export const DATE_FORMAT = create('date-format', 'ddd, MMM D YYYY', {
  options: [
    'ddd, MMM D YYYY',
    'ddd, D MMM YYYY',
    'D/M/YYYY',
    'M/D/YYYY',
    'YYYY-MM-DD'
  ]
});

export const TIME_FORMAT = create('time-format', 'h:mm:ss a', {
  options: [
    'h:mm:ss a',
    'HH:mm:ss'
  ]
});

export const TIME_ZONE = create('time-zone', 'local');
export const DEV = create('dev', true, { parseJSON });

// --------------------

const cookiePrefix = 'R_';
const cookieOptions = {
  maxAge:   365 * 86400,
  path:     '/',
  sameSite: true,
  secure:   true,
};

export const state = function() {
  return {
    cookiesLoaded: false,
    data:          {},
  };
};

export const getters = {
  get: state => (key) => {
    const definition = definitions[key];

    if (!definition) {
      throw new Error(`Unknown preference: ${ key }`);
    }

    const user = state.data[key];

    if (user !== undefined) {
      return clone(user);
    }

    const def = clone(definition.def);

    return def;
  },

  defaultValue: state => (key) => {
    const definition = definitions[key];

    if (!definition) {
      throw new Error(`Unknown preference: ${ key }`);
    }

    return clone(definition.def);
  },

  options: state => (key) => {
    const definition = definitions[key];

    if (!definition) {
      throw new Error(`Unknown preference: ${ key }`);
    }

    if (!definition.options) {
      throw new Error(`Preference does not have options: ${ key }`);
    }

    return definition.options.slice();
  },

  theme: (state, getters) => {
    return 'light';
  }
};

export const mutations = {
  load(state, { key, value }) {
    Vue.set(state.data, key, value);
  },

  cookiesLoaded(state) {
    state.cookiesLoaded = true;
  },
};

export const actions = {
  async set({ dispatch, commit }, opt) {
    let { key, value } = opt; // eslint-disable-line prefer-const
    const definition = definitions[key];
    let server;

    if ( opt.val ) {
      throw new Error('Use value, not val');
    }

    if ( definition.asUserPreference ) {
      server = await dispatch('loadServer', key); // There's no watch on prefs, so get before set...
    }

    commit('load', { key, value });

    if ( definition.asCookie ) {
      const opt = { ...cookieOptions, parseJSON: definition.parseJSON === true };

      this.$cookies.set(`${ cookiePrefix }${ key }`.toUpperCase(), value, opt);
    }

    if ( definition.asUserPreference && server?.data ) {
      if ( definition.mangleWrite ) {
        value = definition.mangleWrite(value);
      }

      if ( definition.parseJSON ) {
        Vue.set(server.data, key, JSON.stringify(value));
      } else {
        Vue.set(server.data, key, value);
      }

      server.save();
    }
  },

  loadCookies({ state, commit }) {
    if ( state.cookiesLoaded ) {
      return;
    }

    for (const key in definitions) {
      const definition = definitions[key];

      if ( !definition.asCookie ) {
        continue;
      }

      const opt = { parseJSON: definition.parseJSON === true };
      const value = this.$cookies.get(`${ cookiePrefix }${ key }`.toUpperCase(), opt);

      if (value !== undefined) {
        commit('load', { key, value });
      }
    }

    commit('cookiesLoaded');
  },

  loadTheme({ state, dispatch }) {
    if ( process.client ) {
      const watchDark = window.matchMedia('(prefers-color-scheme: dark)');
      const watchLight = window.matchMedia('(prefers-color-scheme: light)');
      const watchNone = window.matchMedia('(prefers-color-scheme: no-preference)');

      const interval = 30 * 60 * 1000;
      const nextHalfHour = interval - Math.round(new Date().getTime()) % interval;

      setTimeout(() => {
        dispatch('loadTheme');
      }, nextHalfHour);
      // console.log('Update theme in', nextHalfHour, 'ms');

      if ( watchDark.matches ) {
        changed('dark');
      } else if ( watchLight.matches ) {
        changed('light');
      } else {
        changed(fromClock());
      }

      watchDark.addListener((e) => {
        if ( e.matches ) {
          changed('dark');
        }
      });

      watchLight.addListener((e) => {
        if ( e.matches ) {
          changed('light');
        }
      });

      watchNone.addListener((e) => {
        if ( e.matches ) {
          changed(fromClock());
        }
      });
    }

    function changed(value) {
      // console.log('Prefers Theme:', value);
      dispatch('set', { key: PREFERS_SCHEME, value });
    }

    function fromClock() {
      const hour = new Date().getHours();

      if ( hour < 7 || hour >= 18 ) {
        return 'dark';
      }

      return 'light';
    }
  },

  async loadServer({ state, dispatch, commit }, ignoreKey) {
    // let server = { data: {} };

    // try {
    //   const all = await dispatch('management/findAll', {
    //     type: STEVE.PREFERENCE,
    //     opt:  {
    //       url:   'userpreferences',
    //       force: true,
    //       watch: false
    //     }
    //   }, { root: true });

    //   server = all?.[0];
    // } catch (e) {
    //   console.error('Error loading preferences', e); // eslint-disable-line no-console
    // }

    // if ( !server?.data ) {
    //   return;
    // }

    // for (const key in definitions) {
    //   const definition = definitions[key];
    //   let value = clone(server.data[key]);

    //   if ( value === undefined || key === ignoreKey) {
    //     continue;
    //   }

    //   if ( definition.parseJSON ) {
    //     try {
    //       value = JSON.parse(value);
    //     } catch (err) {
    //       console.error('Error parsing server pref', key, value, err); // eslint-disable-line no-console
    //       continue;
    //     }
    //   }

    //   if ( definition.mangleRead ) {
    //     value = definition.mangleRead(value);
    //   }

    //   commit('load', { key, value });
    // }

    // return server;
  },

  toggleTheme({ getters, dispatch }) {
    const value = getters[THEME] === 'light' ? 'dark' : 'light';

    return dispatch('set', { key: THEME, value });
  },
};
