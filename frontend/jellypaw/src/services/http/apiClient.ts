// import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
// import { API_BASE_URL } from '../../env';
// import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/tokenStore';


// export type UnauthorizedHandler = () => void;
// let onUnauthorized: UnauthorizedHandler | null = null;
// export function setUnauthorizedHandler(fn: UnauthorizedHandler) { onUnauthorized = fn; }


// const api: AxiosInstance = axios.create({
// baseURL: API_BASE_URL,
// timeout: 10000,
// });


// declare module 'axios' { export interface AxiosRequestConfig { _retry?: boolean } }


// let isRefreshing = false;
// let queue: Array<(t: string | null) => void> = [];
// const flush = (t: string | null) => { queue.forEach(cb => cb(t)); queue = []; };


// api.interceptors.request.use((config) => {
// const at = getAccessToken();
// if (at) (config.headers ??= {}).Authorization = `Bearer ${at}`;
// return config;
// });


// api.interceptors.response.use(
// (res) => res,
// async (error: AxiosError) => {
// const status = error.response?.status;
// const original = error.config as AxiosRequestConfig;


// if (status === 401 && !original?._retry) {
// original._retry = true;


// if (!isRefreshing) {
// isRefreshing = true;
// try {
// const rt = await getRefreshToken();
// if (!rt) throw new Error('NO_REFRESH');
// const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: rt });
// await setTokens(data.accessToken, data.refreshToken ?? rt);
// flush(data.accessToken);
// return api(original);
// } catch (e) {
// await clearTokens();
// flush(null);
// onUnauthorized?.(); // 네비게이션으로 Auth로 보내기 등
// throw e;
// } finally { isRefreshing = false; }
// }


// return new Promise((resolve, reject) => {
// queue.push((newAt) => {
// if (!newAt) return reject(error);
// (original.headers ??= {}).Authorization = `Bearer ${newAt}`;
// resolve(api(original));
// });
// });
// }


// throw error;
// }
// );


// export default api;