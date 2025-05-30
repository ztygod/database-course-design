import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

// 路由配置
const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/dish',
    name: 'Dish',
    component: () => import('@/views/dish/Index.vue'),
    meta: { title: '菜品管理' },
    children: [
      {
        path: 'list',
        name: 'DishList',
        component: () => import('@/views/dish/List.vue'),
        meta: { title: '菜品列表' }
      },
      {
        path: 'category',
        name: 'DishCategory',
        component: () => import('@/views/dish/Category.vue'),
        meta: { title: '菜品类别' }
      }
    ]
  },
  {
    path: '/supplier',
    name: 'Supplier',
    component: () => import('@/views/supplier/Index.vue'),
    meta: { title: '供应商管理' }
  },
  {
    path: '/ingredient',
    name: 'Ingredient',
    component: () => import('@/views/ingredient/Index.vue'),
    meta: { title: '原材料管理' }
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/order/Index.vue'),
    meta: { title: '订单管理' },
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/order/List.vue'),
        meta: { title: '订单列表' }
      },
      {
        path: 'create',
        name: 'OrderCreate',
        component: () => import('@/views/order/Create.vue'),
        meta: { title: '创建订单' }
      },
      {
        path: 'detail/:id',
        name: 'OrderDetail',
        component: () => import('@/views/order/Detail.vue'),
        meta: { title: '订单详情' }
      }
    ]
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/inventory/Index.vue'),
    meta: { title: '库存管理' },
    children: [
      {
        path: 'record',
        name: 'InventoryRecord',
        component: () => import('@/views/inventory/Record.vue'),
        meta: { title: '库存记录' }
      },
      {
        path: 'warning',
        name: 'InventoryWarning',
        component: () => import('@/views/inventory/Warning.vue'),
        meta: { title: '库存预警' }
      }
    ]
  },
  {
    path: '/member',
    name: 'Member',
    component: () => import('@/views/member/Index.vue'),
    meta: { title: '会员管理' }
  },
  {
    path: '/employee',
    name: 'Employee',
    component: () => import('@/views/employee/Index.vue'),
    meta: { title: '员工管理' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/statistics/Index.vue'),
    meta: { title: '统计分析' },
    children: [
      {
        path: 'sales',
        name: 'SalesStatistics',
        component: () => import('@/views/statistics/Sales.vue'),
        meta: { title: '销售统计' }
      },
      {
        path: 'member',
        name: 'MemberStatistics',
        component: () => import('@/views/statistics/Member.vue'),
        meta: { title: '会员统计' }
      },
      {
        path: 'inventory',
        name: 'InventoryStatistics',
        component: () => import('@/views/statistics/Inventory.vue'),
        meta: { title: '库存统计' }
      }
    ]
  },
  {
    path: '*',
    redirect: '/dashboard'
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta?.title ? `${to.meta.title} - 餐饮经营管理系统` : '餐饮经营管理系统';
  next();
});

export default router;
