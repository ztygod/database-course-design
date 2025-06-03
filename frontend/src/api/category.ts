
import request from "@/utils/request";

// 获取所有菜品类别
export function getAllCategories() {
  return request({
    url: '/category',
    method: 'get'
  });
}

// 分页获取菜品类别
export function getCategories(params) {
  return request({
    url: '/category/list',
    method: 'get',
    params
  });
}

// 获取单个菜品类别
export function getCategory(id) {
  return request({
    url: `/category/${id}`,
    method: 'get'
  });
}

// 创建菜品类别
export function createCategory(data) {
  return request({
    url: '/category',
    method: 'post',
    data
  });
}

// 更新菜品类别
export function updateCategory(id, data) {
  return request({
    url: `/category/${id}`,
    method: 'put',
    data
  });
}

// 删除菜品类别
export function deleteCategory(id) {
  return request({
    url: `/category/${id}`,
    method: 'delete'
  });
}
