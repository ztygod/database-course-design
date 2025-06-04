import request from "@/utils/request";

// 获取所有供应商
export function getAllSuppliers() {
  return request({
    url: '/supplier',
    method: 'get'
  });
}

// 分页获取供应商
export function getSuppliers(params) {
  return request({
    url: '/supplier/list',
    method: 'get',
    params
  });
}

// 获取单个供应商
export function getSupplier(id) {
  return request({
    url: `/supplier/${id}`,
    method: 'get'
  });
}

// 创建供应商
export function createSupplier(data) {
  return request({
    url: '/supplier',
    method: 'post',
    data
  });
}

// 更新供应商
export function updateSupplier(id, data) {
  return request({
    url: `/supplier/${id}`,
    method: 'put',
    data
  });
}

// 删除供应商
export function deleteSupplier(id) {
  return request({
    url: `/supplier/${id}`,
    method: 'delete'
  });
}
