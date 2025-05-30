import request from '@/utils/request';
import { ApiResponse, Employee, QueryParams } from '@/types';

// 获取所有员工
export function getAllEmployees() {
  return request({
    url: '/employee',
    method: 'get'
  });
}

// 分页获取员工
export function getEmployees(params: QueryParams) {
  return request({
    url: '/employee/list',
    method: 'get',
    params
  });
}

// 获取单个员工
export function getEmployee(id: number) {
  return request({
    url: `/employee/${id}`,
    method: 'get'
  });
}

// 创建员工
export function createEmployee(data: Partial<Employee>) {
  return request({
    url: '/employee',
    method: 'post',
    data
  });
}

// 更新员工
export function updateEmployee(id: number, data: Partial<Employee>) {
  return request({
    url: `/employee/${id}`,
    method: 'put',
    data
  });
}

// 删除员工
export function deleteEmployee(id: number) {
  return request({
    url: `/employee/${id}`,
    method: 'delete'
  });
}

// 更新员工状态
export function updateEmployeeStatus(id: number, status: number) {
  return request({
    url: `/employee/${id}/status`,
    method: 'put',
    data: { status }
  });
}
