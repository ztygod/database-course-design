import request from "@/utils/request";

// 获取所有原材料
export function getAllIngredients() {
  return request({
    url: '/ingredient',
    method: 'get'
  });
}

// 分页获取原材料
export function getIngredients(params) {
  return request({
    url: '/ingredient/list',
    method: 'get',
    params
  });
}

// 获取单个原材料
export function getIngredient(id) {
  return request({
    url: `/ingredient/${id}`,
    method: 'get'
  });
}

// 创建原材料
export function createIngredient(data) {
  return request({
    url: '/ingredient',
    method: 'post',
    data
  });
}

// 更新原材料
export function updateIngredient(id, data) {
  return request({
    url: `/ingredient/${id}`,
    method: 'put',
    data
  });
}

// 删除原材料
export function deleteIngredient(id) {
  return request({
    url: `/ingredient/${id}`,
    method: 'delete'
  });
}

// 获取库存预警原材料
export function getWarningIngredients() {
  return request({
    url: '/ingredient/warning',
    method: 'get'
  });
}
