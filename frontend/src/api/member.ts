import request from '@/utils/request';
import { ApiResponse, Member, QueryParams } from '@/types';

// 获取所有会员
export function getAllMembers() {
  return request({
    url: '/member',
    method: 'get'
  });
}

// 分页获取会员
export function getMembers(params: QueryParams) {
  return request({
    url: '/member/list',
    method: 'get',
    params
  });
}

// 获取单个会员
export function getMember(id: number) {
  return request({
    url: `/member/${id}`,
    method: 'get'
  });
}

// 创建会员
export function createMember(data: Partial<Member>) {
  return request({
    url: '/member',
    method: 'post',
    data
  });
}

// 更新会员
export function updateMember(id: number, data: Partial<Member>) {
  return request({
    url: `/member/${id}`,
    method: 'put',
    data
  });
}

// 删除会员
export function deleteMember(id: number) {
  return request({
    url: `/member/${id}`,
    method: 'delete'
  });
}

// 获取会员消费记录
export function getMemberConsumption(id: number) {
  return request({
    url: `/member/${id}/consumption`,
    method: 'get'
  });
}
