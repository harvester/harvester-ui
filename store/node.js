export const state = function() {
  return {
    actionResources:   null,
    isShowMaintenance: false,
  };
};

export const mutations = {
  toggleMaintenanceModal(state, resources = []) {
    state.isShowMaintenance = !state.isShowMaintenance;
    state.actionResources = resources;
  },

};

export const actions = {};
