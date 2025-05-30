import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/styles/index.scss';
import * as echarts from 'echarts';

Vue.config.productionTip = false;

// 全局挂载echarts
Vue.prototype.$echarts = echarts;

// 使用ElementUI
Vue.use(ElementUI, {
  size: 'medium'
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
