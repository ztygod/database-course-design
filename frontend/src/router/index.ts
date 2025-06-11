import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard/index.vue'
import Category from '@/views/Dish/Category.vue'
import Dish from '@/views/Dish/List.vue'
import Employee from '@/views/Employee/index.vue'
import Ingredient from '@/views/Ingredient/index.vue'
import Inventory from '@/views/Inventory/Record.vue'
import Member from '@/views/Member/index.vue'
import Order from '@/views/Order/List.vue'
import Statistics from '@/views/Statistics/index.vue'
import Supplier from '@/views/Supplier/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dish'
    },
    // {
    //   path: '/dashboard',
    //   name: 'Dashboard',
    //   component: Dashboard
    // },
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
    // {
    //   path: '/statistics',
    //   name: 'Statistics',
    //   component: Statistics
    // }
  ],
})

export default router
