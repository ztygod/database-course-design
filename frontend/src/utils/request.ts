import axios from 'axios';

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data;
    return res;
  },
  error => {
    console.log('请求错误: ' + error);
    return Promise.reject(error);
  }
);

export default request;
