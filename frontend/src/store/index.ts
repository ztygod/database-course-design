// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || ''
  }),
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    setUser(user) {
      this.user = user
    },
    clearUser() {
      this.user = null
      this.token = ''
      localStorage.removeItem('token')
    },
    login(userInfo) {
      return new Promise((resolve) => {
        // 模拟登录逻辑
        const token = 'demo-token'
        const user = { id: 1, name: '管理员', role: 'admin' }
        this.setToken(token)
        this.setUser(user)
        resolve()
      })
    },
    logout() {
      this.clearUser()
    }
  }
})
