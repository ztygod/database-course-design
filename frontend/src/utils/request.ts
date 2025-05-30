import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message } from 'element-ui';

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000
});

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 可以在这里添加token等认证信息
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    
    // 根据后端API的响应格式进行处理
    if (res.code !== 200 && res.code !== 201) {
      Message({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      });
      
      return Promise.reject(new Error(res.message || '请求失败'));
    } else {
      return res;
    }
  },
  (error) => {
    console.error('响应错误:', error);
    Message({
      message: error.message || '请求失败',
      type: 'error',
      duration: 5 * 1000
    });
    return Promise.reject(error);
  }
);

export default service;
