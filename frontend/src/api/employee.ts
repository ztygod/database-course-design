import request from "@/utils/request";

// 获取所有员工
export function getAllEmployees() {
  return request({
    url: '/employee',
    method: 'get'
  });
}

// 分页获取员工
export function getEmployees(params) {
  return request({
    url: '/employee/list',
    method: 'get',
    params
  });
}

// 获取单个员工
export function getEmployee(id) {
  return request({
    url: `/employee/${id}`,
    method: 'get'
  });
}

// 创建员工
export function createEmployee(data) {
  return request({
    url: '/employee',
    method: 'post',
    data
  });
}

// 更新员工
export function updateEmployee(id, data) {
  return request({
    url: `/employee/${id}`,
    method: 'put',
    data
  });
}

// 删除员工
export function deleteEmployee(id) {
  return request({
    url: `/employee/${id}`,
    method: 'delete'
  });
}

// 更新员工状态
export function updateEmployeeStatus(id, status) {
  return request({
    url: `/employee/${id}/status`,
    method: 'put',
    data: { status }
  });
}
