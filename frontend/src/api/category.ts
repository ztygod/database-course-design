import request from '@/utils/request';
import { ApiResponse, Category, QueryParams } from '@/types';

// 获取所有菜品类别
export function getAllCategories() {
  return request({
    url: '/category',
    method: 'get'
  });
}

// 分页获取菜品类别
export function getCategories(params: QueryParams) {
  return request({
    url: '/category/list',
    method: 'get',
    params
  });
}

// 获取单个菜品类别
export function getCategory(id: number) {
  return request({
    url: `/category/${id}`,
    method: 'get'
  });
}

// 创建菜品类别
export function createCategory(data: Partial<Category>) {
  return request({
    url: '/category',
    method: 'post',
    data
  });
}

// 更新菜品类别
export function updateCategory(id: number, data: Partial<Category>) {
  return request({
    url: `/category/${id}`,
    method: 'put',
    data
  });
}

// 删除菜品类别
export function deleteCategory(id: number) {
  return request({
    url: `/category/${id}`,
    method: 'delete'
  });
}
