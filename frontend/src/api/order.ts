import request from '@/utils/request';
import { ApiResponse, Order, QueryParams } from '@/types';

// 获取所有订单
export function getAllOrders() {
  return request({
    url: '/order',
    method: 'get'
  });
}

// 分页获取订单
export function getOrders(params: QueryParams) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  });
}

// 获取单个订单
export function getOrder(id: number) {
  return request({
    url: `/order/${id}`,
    method: 'get'
  });
}

// 创建订单
export function createOrder(data: Partial<Order>) {
  return request({
    url: '/order',
    method: 'post',
    data
  });
}

// 更新订单
export function updateOrder(id: number, data: Partial<Order>) {
  return request({
    url: `/order/${id}`,
    method: 'put',
    data
  });
}

// 删除订单
export function deleteOrder(id: number) {
  return request({
    url: `/order/${id}`,
    method: 'delete'
  });
}

// 添加订单明细
export function addOrderDetail(orderId: number, data: any) {
  return request({
    url: `/order/${orderId}/detail`,
    method: 'post',
    data
  });
}

// 删除订单明细
export function deleteOrderDetail(detailId: number) {
  return request({
    url: `/order/detail/${detailId}`,
    method: 'delete'
  });
}

// 结算订单
export function settleOrder(orderId: number, data: any) {
  return request({
    url: `/order/${orderId}/settle`,
    method: 'put',
    data
  });
}

// 取消订单
export function cancelOrder(orderId: number) {
  return request({
    url: `/order/${orderId}/cancel`,
    method: 'put'
  });
}
