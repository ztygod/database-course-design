import { createApp } from 'vue'
import { createPinia } from 'pinia'
import moment from 'moment'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// 注册icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局方法替代过滤器
app.config.globalProperties.$filters = {
    formatDate(value: any) {
      if (!value) return ''
      return moment(value).format('YYYY-MM-DD')
    },
    formatDateTime(value: any) {
      if (!value) return ''
      return moment(value).format('YYYY-MM-DD HH:mm:ss')
    },
    formatMoney(value: any) {
      if (!value) return '0.00'
      return parseFloat(value).toFixed(2)
    }
  }

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
