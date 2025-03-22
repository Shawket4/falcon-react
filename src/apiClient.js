import axios from 'axios';
import { SERVER_IP } from './config';

// Create an axios instance with base URL
const apiClient = axios.create({
  baseURL: SERVER_IP,
  withCredentials: true, // Important for cookies
});

// Add a request interceptor to attach JWT to each request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('jwt');
      localStorage.removeItem('permission');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;