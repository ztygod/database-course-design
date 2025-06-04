import request from "@/utils/request";

// 获取所有库存记录
export function getAllInventoryRecords() {
  return request({
    url: '/inventory',
    method: 'get'
  });
}

// 分页获取库存记录
export function getInventoryRecords(params) {
  return request({
    url: '/inventory/list',
    method: 'get',
    params
  });
}

// 获取单个库存记录
export function getInventoryRecord(id) {
  return request({
    url: `/inventory/${id}`,
    method: 'get'
  });
}

// 创建库存记录（入库/出库）
export function createInventoryRecord(data) {
  return request({
    url: '/inventory',
    method: 'post',
    data
  });
}

// 获取库存预警列表
export function getInventoryWarning() {
  return request({
    url: '/inventory/warning',
    method: 'get'
  });
}

// 获取库存统计数据
export function getInventoryStatistics(params) {
  return request({
    url: '/inventory/statistics',
    method: 'get',
    params
  });
}
