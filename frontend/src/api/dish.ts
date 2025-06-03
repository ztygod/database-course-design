import request from "@/utils/request";
// 获取所有菜品
export function getAllDishes() {
  return request({
    url: '/dish',
    method: 'get'
  });
}

// 分页获取菜品
export function getDishes(params) {
  return request({
    url: '/dish/list',
    method: 'get',
    params
  });
}

// 获取单个菜品
export function getDish(id) {
  return request({
    url: `/dish/${id}`,
    method: 'get'
  });
}

// 创建菜品
export function createDish(data) {
  return request({
    url: '/dish',
    method: 'post',
    data
  });
}

// 更新菜品
export function updateDish(id, data) {
  return request({
    url: `/dish/${id}`,
    method: 'put',
    data
  });
}

// 删除菜品
export function deleteDish(id) {
  return request({
    url: `/dish/${id}`,
    method: 'delete'
  });
}

// 更新菜品状态
export function updateDishStatus(id, status) {
  return request({
    url: `/dish/${id}/status`,
    method: 'put',
    data: { status }
  });
}

// 获取菜品配料
export function getDishIngredients(id) {
  return request({
    url: `/dish/${id}/ingredients`,
    method: 'get'
  });
}

// 更新菜品配料
export function updateDishIngredients(id, data) {
  return request({
    url: `/dish/${id}/ingredients`,
    method: 'put',
    data
  });
}
