import axios, { type AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져와서 헤더에 추가
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      // console.log('토큰 헤더 추가:', config.headers['Authorization']);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       // 토큰 만료 시 로그아웃 처리
//       console.log('토큰 만료 - 로그아웃 처리');
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       window.location.href = '/auth';
//     }
//     return Promise.reject(error);
//   },
// );

export default apiClient;
