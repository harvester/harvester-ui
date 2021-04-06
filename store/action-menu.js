import { isArray, filterBy } from '@/utils/array';

export const state = function() {
  return {
    show:                  false,
    tableSelected:         [],
    tableAll:              [],
    resources:             [],
    elem:                  null,
    event:                 null,
    showPromptRemove:      false,
    showAssignTo:          false,
    showEjectCDROM:        false,
    toRemove:              [],
    toAssign:              [],
    toEject:               [],
    toEnable:              null,
  };
};

export const getters = {
  showing:       state => state.show,
  elem:          state => state.elem,
  event:         state => state.event,
  tableSelected: state => state.tableSelected || [],

  options(state) {
    let selected = state.resources;

    if ( !selected ) {
      return [];
    }

    if ( !isArray(selected) ) {
      selected = [];
    }

    const map = {};

    for ( const node of selected ) {
      if (node.availableActions) {
        for ( const act of node.availableActions ) {
          _add(map, act);
        }
      }
    }

    const out = _filter(map);

    return { ...out };
  },

  isSelected: state => (resource) => {
    return state.tableSelected.includes(resource);
  }
};

export const mutations = {
  show(state, { resources, elem, event }) {
    if ( !isArray(resources) ) {
      resources = [resources];
    }

    state.resources = resources;
    state.elem = elem;
    state.event = event;
    state.show = true;
  },

  hide(state) {
    state.show = false;
    state.resources = null;
    state.elem = null;
  },

  togglePromptRemove(state, resources = []) {
    state.showPromptRemove = !state.showPromptRemove;
    if (!isArray(resources)) {
      resources = [resources];
    }
    state.toRemove = resources;
  },

  toggleAssignTo(state, resources) {
    state.showAssignTo = !state.showAssignTo;

    if (!isArray(resources)) {
      resources = [resources];
    }

    state.toAssign = resources;
  },

  toggleEjectCDROM(state, resources) {
    state.showEjectCDROM = !state.showEjectCDROM;
    state.toEject = resources;
  },

};

export const actions = {
  executeTable({ state }, { action, args }) {
    return _execute(state.tableSelected, action, args);
  },

  execute({ state }, { action, args, opts }) {
    return _execute(state.resources, action, args, opts);
  },
};

// -----------------------------

let anon = 0;

function _add(map, act, incrementCounts = true) {
  let id = act.action;

  if ( !id ) {
    id = `anon${ anon }`;
    anon++;
  }

  let obj = map[id];

  if ( !obj ) {
    obj = Object.assign({}, act);
    map[id] = obj;
    obj.allEnabled = false;
  }

  if ( act.enabled === false ) {
    obj.allEnabled = false;
  } else {
    obj.anyEnabled = true;
  }

  if ( incrementCounts ) {
    obj.available = (obj.available || 0) + (act.enabled === false ? 0 : 1 );
    obj.total = (obj.total || 0) + 1;
  }

  return obj;
}

function _filter(map, disableAll = false) {
  let out = filterBy(Object.values(map), 'anyEnabled', true);

  out = _removeExtraDivider(out);

  for ( const act of out ) {
    if ( disableAll ) {
      act.enabled = false;
    } else {
      act.enabled = ( act.available >= act.total );
    }
  }

  return out;
}

function _execute(resources, action, args, opts = {}) {
  args = args || [];
  if ( resources.length > 1 && action.bulkAction && !opts.alt ) {
    const fn = resources[0][action.bulkAction];

    if ( fn ) {
      return fn.call(resources[0], resources, ...args);
    }
  }

  const promises = [];

  for ( const resource of resources ) {
    let fn;

    if (opts.alt && action.altAction) {
      fn = resource[action.altAction];
    } else {
      fn = resource[action.action];
    }

    if ( fn ) {
      promises.push(fn.apply(resource, args));
    }
  }

  return Promise.all(promises);
}

function _removeExtraDivider(array) {
  const out = [];
  let isNeighboring = false;

  for (const act of array) {
    if (isNeighboring && !!act.divider) {
      continue;
    }

    isNeighboring = !!act.divider;
    out.push(act);
  }

  const firstIsDivider = !!out?.[0]?.divider;
  const lastIsDivider = !!out?.[out.length - 1]?.divider;

  if (firstIsDivider) {
    out.shift();
  }

  if (lastIsDivider) {
    out.pop();
  }

  return out;
}
