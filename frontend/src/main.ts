// main.js (Vue 3)
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import moment from 'moment'

const app = createApp(App)

// 全局方法替代过滤器
app.config.globalProperties.$filters = {
  formatDate(value) {
    if (!value) return ''
    return moment(value).format('YYYY-MM-DD')
  },
  formatDateTime(value) {
    if (!value) return ''
    return moment(value).format('YYYY-MM-DD HH:mm:ss')
  },
  formatMoney(value) {
    if (!value) return '0.00'
    return parseFloat(value).toFixed(2)
  }
}

// 注册插件
app.use(router)
app.use(createPinia())
app.use(ElementPlus)

// 挂载应用
app.mount('#app')
