import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {
      id: null,
      username: '',
      role: ''
    },
    isLoggedIn: false,
    sidebarCollapsed: false
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isLoggedIn = true;
    },
    CLEAR_USER(state) {
      state.user = {
        id: null,
        username: '',
        role: ''
      };
      state.isLoggedIn = false;
    },
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    }
  },
  actions: {
    login({ commit }, user) {
      commit('SET_USER', user);
    },
    logout({ commit }) {
      commit('CLEAR_USER');
    },
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR');
    }
  },
  getters: {
    isLoggedIn: state => state.isLoggedIn,
    currentUser: state => state.user,
    sidebarCollapsed: state => state.sidebarCollapsed
  },
  modules: {
  }
});
