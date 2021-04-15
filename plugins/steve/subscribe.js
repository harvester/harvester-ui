import { get } from '@/utils/object';
import Socket, {
  EVENT_CONNECTED,
  EVENT_DISCONNECTED,
  EVENT_MESSAGE,
  //  EVENT_FRAME_TIMEOUT,
  EVENT_CONNECT_ERROR
} from '@/utils/socket';
import Notification from '@/components/Notification/main.js';

export const NO_WATCH = 'NO_WATCH';
export const TOO_OLD = 'TOO_OLD';
export const NO_SCHEMA = 'NO_SCHEMA';

let noticeInstance = null;
const closeTimer = {};

export const actions = {
  subscribe(ctx, opt) {
    const { state, commit, dispatch } = ctx;
    let socket = state.socket;

    commit('setWantSocket', true);

    if ( process.server ) {
      return;
    }

    // console.info(`Subscribe [${ ctx.getters.storeName }]`); // eslint-disable-line no-console

    const url = `${ state.config.baseUrl }/subscribe`;

    if ( socket ) {
      socket.setUrl(url);
    } else {
      socket = new Socket(`${ state.config.baseUrl }/subscribe`);

      commit('setSocket', socket);

      socket.addEventListener(EVENT_CONNECTED, (e) => {
        dispatch('opened', e);
      });

      socket.addEventListener(EVENT_DISCONNECTED, (e) => {
        dispatch('closed', e);
      });

      socket.addEventListener(EVENT_CONNECT_ERROR, (e) => {
        dispatch('error', e.detail);
      });

      socket.addEventListener(EVENT_MESSAGE, (e) => {
        const event = e.detail;

        if ( event.data) {
          const msg = JSON.parse(event.data);

          if (msg.name) {
            dispatch(`ws.${ msg.name }`, msg);
          }
        }
      });
    }

    socket.connect(get(opt, 'metadata'));
  },

  unsubscribe({ state, commit }) {
    const socket = state.socket;

    commit('setWantSocket', false);

    if ( socket ) {
      return socket.disconnect();
    }
  },

  async flush({ state, commit, dispatch }) {
    const queue = state.queue;
    let toLoad = [];

    if ( !queue.length ) {
      return;
    }

    state.queue = [];

    // console.debug(`Subscribe Flush [${state.storeName}]`, queue.length);

    for ( const { action, event, body } of queue ) {
      if ( action === 'dispatch' && event === 'load' ) {
        // Group loads into one loadMulti when possible
        toLoad.push(body);
      } else {
        // When we hit a differet kind of event, process all the previous loads, then the other event.
        if ( toLoad.length ) {
          await dispatch('loadMulti', toLoad);
          toLoad = [];
        }

        if ( action === 'dispatch' ) {
          await dispatch(event, body);
        } else if ( action === 'commit' ) {
          commit(event, body);
        } else {
          throw new Error('Invalid queued action');
        }
      }
    }

    // Process any remaining loads
    if ( toLoad.length ) {
      await dispatch('loadMulti', toLoad);
    }
  },

  rehydrateSubscribe({ state, dispatch }) {
    if ( process.client && state.wantSocket && !state.socket ) {
      dispatch('subscribe');
    }
  },

  watch({ state, dispatch, getters }, params) {
    let {
      // eslint-disable-next-line prefer-const
      type, selector, id, revision, namespace, stop, force
    } = params;

    type = getters.normalizeType(type);

    if ( !stop && !force && !getters.canWatch(params) ) {
      return;
    }

    if ( !stop && getters.watchStarted({
      type, id, selector, namespace
    }) ) {
      return;
    }

    if ( typeof revision === 'undefined' ) {
      revision = getters.nextResourceVersion(type, id);
    }

    const msg = { resourceType: type };

    if ( revision ) {
      msg.resourceVersion = `${ revision }`;
    }

    if ( namespace ) {
      msg.namespace = namespace;
    }

    if ( stop ) {
      msg.stop = true;
    }

    if ( id ) {
      msg.id = id;
    }

    if ( selector ) {
      msg.selector = selector;
    }

    return dispatch('send', msg);
  },

  reconnectWatches({
    state, getters, commit, dispatch
  }) {
    const promises = [];

    for ( const entry of state.started.slice() ) {
      console.info(`Reconnect [${ getters.storeName }]`, entry); // eslint-disable-line no-console
      if ( getters.schemaFor(entry.type) ) {
        commit('setWatchStopped', entry);
        delete entry.revision;
        promises.push(dispatch('watch', entry));
      }
    }

    return Promise.all(promises);
  },

  async resyncWatch({ getters, dispatch, commit }, params) {
    const {
      resourceType, namespace, id, selector
    } = params;

    console.info(`Resync [${ getters.storeName }]`, params); // eslint-disable-line no-console

    const opt = { force: true, forceWatch: true };

    if ( id ) {
      await dispatch('find', {
        type: resourceType,
        id,
        opt,
      });
      commit('clearInError', params);

      return;
    }

    let have, want;

    if ( selector ) {
      have = getters['matching'](resourceType, selector).slice();
      want = await dispatch('findMatching', {
        type: resourceType,
        selector,
        opt,
      });
    } else {
      have = getters['all'](resourceType).slice();
      want = await dispatch('findAll', {
        type:           resourceType,
        watchNamespace: namespace,
        opt
      });
    }

    const wantMap = {};

    for ( const obj of want ) {
      wantMap[obj.id] = true;
    }

    for ( const obj of have ) {
      if ( !wantMap[obj.id] ) {
        // console.info(`Remove stale [${ getters.storeName}]`, resourceType, obj.id); // eslint-disable-line no-console

        commit('remove', obj);
      }
    }
  },

  async opened({
    getters, commit, dispatch, state
  }, event) {
    // console.info(`WebSocket Opened [${ getters.storeName }]`); // eslint-disable-line no-console
    if (closeTimer[state.socket.url]) {
      clearTimeout(closeTimer[state.socket.url]);
      closeTimer[state.socket.url] = null;
    }

    if (noticeInstance) {
      noticeInstance.close(noticeInstance.id);
      noticeInstance = null;
    }

    const socket = event.currentTarget;

    this.$socket = socket;

    if ( !state.queue ) {
      state.queue = [];
    }

    if ( !state.queueTimer ) {
      state.flushQueue = async() => {
        if ( state.queue.length ) {
          await dispatch('flush');
        }

        state.queueTimer = setTimeout(state.flushQueue, 1000);
      };

      state.flushQueue();
    }

    if ( socket.hasReconnected ) {
      await dispatch('reconnectWatches');
    }

    // Try resending any frames that were attempted to be sent while the socket was down, once.
    if ( !process.server ) {
      for ( const obj of state.pendingSends.slice() ) {
        commit('dequeuePending', obj);
        dispatch('sendImmediate', obj);
      }
    }
  },

  closed({ getters, state, rootGetters }) {
    // console.info(`WebSocket Closed [${ getters.storeName }]`); // eslint-disable-line no-console
    if (!noticeInstance && state.socket?.autoReconnect && !closeTimer[state.socket.url]) {
      const t = rootGetters['i18n/t'];

      const timer = setTimeout(() => {
        if (!noticeInstance) {
          noticeInstance = Notification.warning({
            duration: 0,
            title:    t('harvester.webSocket.connecting.title'),
            message:  t('harvester.webSocket.connecting.disconnectedWarning')
          });
        }
      }, 35000);

      closeTimer[state.socket.url] = timer;
    }

    clearTimeout(state.queueTimer);
    state.queueTimer = null;
  },

  error({ getters, state }, event) {
    console.error(`WebSocket Error [${ getters.storeName }]`, event); // eslint-disable-line no-console
    clearTimeout(state.queueTimer);
    state.queueTimer = null;
  },

  send({ state, commit }, obj) {
    if ( state.socket ) {
      const ok = state.socket.send(JSON.stringify(obj));

      if ( ok ) {
        return;
      }
    }

    commit('enqueuePending', obj);
  },

  sendImmediate({ state }, obj) {
    if ( state.socket ) {
      return state.socket.send(JSON.stringify(obj));
    }
  },

  'ws.ping'({ getters }) {
    // console.info(`WebSocket Ping [${ getters.storeName }]`); // eslint-disable-line no-console
  },

  'ws.resource.start'({ getters, commit }, msg) {
    // console.info(`Resource start: [${ getters.storeName }]`, msg); // eslint-disable-line no-console
    commit('setWatchStarted', {
      type:      msg.resourceType,
      namespace: msg.namespace,
      id:        msg.id,
      selector:  msg.selector
    });
  },

  'ws.resource.error'({ getters, commit, dispatch }, msg) {
    // console.warn(`Resource error [${ getters.storeName }]`, msg.resourceType, ':', msg.data.error); // eslint-disable-line no-console

    const err = msg.data?.error?.toLowerCase();

    if ( err.includes('watch not allowed') ) {
      commit('setInError', { type: msg.resourceType, reason: NO_WATCH });
    } else if ( err.includes('failed to find schema') ) {
      commit('setInError', { type: msg.resourceType, reason: NO_SCHEMA });
    } else if ( err.includes('too old') ) {
      commit('setInError', { type: msg.resourceType, reason: TOO_OLD });
      dispatch('resyncWatch', msg);
    }
  },

  'ws.resource.stop'({ getters, commit, dispatch }, msg) {
    const type = msg.resourceType?.replace('//', '');
    const obj = {
      type,
      id:        msg.id,
      namespace: msg.namespace,
      selector:  msg.selector
    };

    // console.warn(`Resource stop: [${ getters.storeName }]`, msg); // eslint-disable-line no-console

    if ( getters['schemaFor'](type) && getters['watchStarted'](obj) ) {
      // Try reconnecting once
      commit('setWatchStopped', obj);

      setTimeout(() => {
        // Delay a bit so that immediate start/error/stop causes
        // only a slow infinite loop instead of a tight one.
        dispatch('watch', obj);
      }, 5000);
    }
  },

  'ws.resource.create'({ getters, state }, { data }) {
    if ( !getters.typeRegistered(getters.normalizeType(data.type)) ) {
      return;
    }

    // console.debug(`Create Event [${ state.config.namespace }]`, data.type, data.id); // eslint-disable-line no-console

    state.queue.push({
      action: 'dispatch',
      event:  'load',
      body:   data
    });
  },

  'ws.resource.change'({ getters, state }, { data }) {
    if ( !getters.typeRegistered(getters.normalizeType(data.type)) ) {
      return;
    }

    // console.debug(`Change Event [${ state.config.namespace }]`, data.type, data.id); // eslint-disable-line no-console

    state.queue.push({
      action: 'dispatch',
      event:  'load',
      body:   data
    });
  },

  'ws.resource.remove'({ getters, state }, { data }) {
    const type = getters.normalizeType(data.type);

    if ( !getters.typeRegistered(type) ) {
      return;
    }

    // console.debug(`Remove Event [${ state.config.namespace }]`, data.type, data.id); // eslint-disable-line no-console

    const obj = getters.byId(data.type, data.id);

    if ( obj ) {
      state.queue.push({
        action: 'commit',
        event:  'remove',
        body:   obj
      });
    }

    if ( type === 'schema' ) {
      // Clear the current records in the store when a type disappears
      state.queue.push({
        action: 'commit',
        event:  'forgetType',
        body:   data.id
      });
    }
  },
};

export const mutations = {
  setSocket(state, socket) {
    state.socket = socket;
  },
};
