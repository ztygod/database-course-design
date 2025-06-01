import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue')
    },
    {
      path: '/dish',
      name: 'Dish',
      component: () => import('../views/dish/List.vue')
    },
    {
      path: '/category',
      name: 'Category',
      component: () => import('../views/dish/Category.vue')
    },
    {
      path: '/supplier',
      name: 'Supplier',
      component: () => import('../views/supplier/Index.vue')
    },
    {
      path: '/ingredient',
      name: 'Ingredient',
      component: () => import('../views/ingredient/Index.vue')
    },
    {
      path: '/order',
      name: 'Order',
      component: () => import('../views/order/List.vue')
    },
    {
      path: '/inventory',
      name: 'Inventory',
      component: () => import('../views/inventory/Record.vue')
    },
    {
      path: '/member',
      name: 'Member',
      component: () => import('../views/member/Index.vue')
    },
    {
      path: '/employee',
      name: 'Employee',
      component: () => import('../views/employee/Index.vue')
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: () => import('../views/statistics/Index.vue')
    }
  ]
})
