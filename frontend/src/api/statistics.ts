import request from "@/utils/request";

// 获取销售统计数据
export function getSalesStatistics(params) {
  return request({
    url: '/statistics/sales',
    method: 'get',
    params
  });
}

// 获取会员统计数据
export function getMemberStatistics() {
  return request({
    url: '/statistics/member',
    method: 'get'
  });
}

// 获取库存统计数据
export function getInventoryStatistics() {
  return request({
    url: '/statistics/inventory',
    method: 'get'
  });
}

// 获取仪表盘数据
export function getDashboardData() {
  return request({
    url: '/statistics/dashboard',
    method: 'get'
  });
}

// 获取热销菜品数据
export function getHotDishes(params) {
  return request({
    url: '/statistics/hot-dishes',
    method: 'get',
    params
  });
}

// 获取销售趋势数据
export function getSalesTrend(params) {
  return request({
    url: '/statistics/sales-trend',
    method: 'get',
    params
  });
}
