import request from '@/utils/request';
import { ApiResponse, Dish, QueryParams } from '@/types';

// 获取所有菜品
export function getAllDishes() {
  return request({
    url: '/dish',
    method: 'get'
  });
}

// 分页获取菜品
export function getDishes(params: QueryParams) {
  return request({
    url: '/dish/list',
    method: 'get',
    params
  });
}

// 获取单个菜品
export function getDish(id: number) {
  return request({
    url: `/dish/${id}`,
    method: 'get'
  });
}

// 创建菜品
export function createDish(data: Partial<Dish>) {
  return request({
    url: '/dish',
    method: 'post',
    data
  });
}

// 更新菜品
export function updateDish(id: number, data: Partial<Dish>) {
  return request({
    url: `/dish/${id}`,
    method: 'put',
    data
  });
}

// 删除菜品
export function deleteDish(id: number) {
  return request({
    url: `/dish/${id}`,
    method: 'delete'
  });
}

// 获取菜品配料
export function getDishIngredients(dishId: number) {
  return request({
    url: `/dish/${dishId}/ingredients`,
    method: 'get'
  });
}

// 更新菜品配料
export function updateDishIngredients(dishId: number, data: any) {
  return request({
    url: `/dish/${dishId}/ingredients`,
    method: 'post',
    data
  });
}

// 更新菜品状态
export function updateDishStatus(id: number, status: number) {
  return request({
    url: `/dish/${id}/status`,
    method: 'put',
    data: { status }
  });
}
