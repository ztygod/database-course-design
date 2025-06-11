import request from "@/utils/request";

// 获取所有订单
export function getAllOrders() {
  return request({
    url: '/order',
    method: 'get'
  });
}

// 分页获取订单
export function getOrders(params) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  });
}

// 获取单个订单
export function getOrder(id) {
  return request({
    url: `/order/${id}`,
    method: 'get'
  });
}

// 创建订单
export function createOrder(data) {
  return request({
    url: '/order',
    method: 'post',
    data
  });
}

// 更新订单
export function updateOrder(id, data) {
  return request({
    url: `/order/${id}`,
    method: 'put',
    data
  });
}

// 删除订单
export function deleteOrder(id) {
  return request({
    url: `/order/${id}`,
    method: 'delete'
  });
}

// 添加订单明细
export function addOrderDetail(orderId, data) {
  return request({
    url: `/order/${orderId}/detail`,
    method: 'post',
    data
  });
}

// 获取订单明细
export function getOrderDetail(orderId){
  return request({
    url: `/order/${orderId}/detail`,
    method: 'get',
  })
}

// 删除订单明细
export function deleteOrderDetail(detailId) {
  return request({
    url: `/order/detail/${detailId}`,
    method: 'delete'
  });
}

// 结算订单
export function settleOrder(orderId, data) {
  return request({
    url: `/order/${orderId}/settle`,
    method: 'put',
    data
  });
}

// 取消订单
export function cancelOrder(orderId) {
  return request({
    url: `/order/${orderId}/cancel`,
    method: 'put'
  });
}
