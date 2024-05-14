import axios from 'axios';
import { API_HOST } from '../config-global';

const axiosInstance = axios.create({ baseURL: API_HOST });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || 'Something went wrong, please try again.'
    )
);

export default axiosInstance;
