import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    token: localStorage.getItem('token') || ''
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_USER(state, user) {
      state.user = user
    },
    CLEAR_USER(state) {
      state.user = null
      state.token = ''
      localStorage.removeItem('token')
    }
  },
  actions: {
    login({ commit }, userInfo) {
      // 模拟登录，实际项目中应调用登录API
      return new Promise((resolve) => {
        // 假设登录成功，设置token和用户信息
        const token = 'demo-token'
        const user = { id: 1, name: '管理员', role: 'admin' }
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        resolve()
      })
    },
    logout({ commit }) {
      commit('CLEAR_USER')
    }
  },
  modules: {
  }
})
