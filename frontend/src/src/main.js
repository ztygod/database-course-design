import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import moment from 'moment'

Vue.use(ElementUI)
Vue.config.productionTip = false

// 全局过滤器
Vue.filter('formatDate', function(value) {
  if (!value) return ''
  return moment(value).format('YYYY-MM-DD')
})

Vue.filter('formatDateTime', function(value) {
  if (!value) return ''
  return moment(value).format('YYYY-MM-DD HH:mm:ss')
})

Vue.filter('formatMoney', function(value) {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2)
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
