// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 静态引入组件
import Dashboard from '@/views/Dashboard.vue'
import Dish from '@/views/dish/List.vue'
import Category from '@/views/dish/Category.vue'
import Supplier from '@/views/supplier/Index.vue'
import Ingredient from '@/views/ingredient/Index.vue'
import Order from '@/views/order/List.vue'
import Inventory from '@/views/inventory/Record.vue'
import Member from '@/views/member/Index.vue'
import Employee from '@/views/employee/Index.vue'
import Statistics from '@/views/statistics/Index.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/dish',
    name: 'Dish',
    component: Dish
  },
  {
    path: '/category',
    name: 'Category',
    component: Category
  },
  {
    path: '/supplier',
    name: 'Supplier',
    component: Supplier
  },
  {
    path: '/ingredient',
    name: 'Ingredient',
    component: Ingredient
  },
  {
    path: '/order',
    name: 'Order',
    component: Order
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: Inventory
  },
  {
    path: '/member',
    name: 'Member',
    component: Member
  },
  {
    path: '/employee',
    name: 'Employee',
    component: Employee
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
