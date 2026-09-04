import axios from 'axios';

// 1. Create the instance with base configurations
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://example.com', // Fallback URL
  timeout: 10000, // Timeout request after 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 2. Request Interceptor (e.g., attach Bearer Token automatically)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Inject auth header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (e.g., global error handling)
apiClient.interceptors.response.use(
  (response) => {
    // Return only the data portion of the response directly
    return response.data;
  },
  (error) => {
    // Centralized handling for specific HTTP status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized! Redirecting to login...');
          // Optional: clear tokens, redirect to /login
          break;
        case 403:
          console.error('Forbidden access.');
          break;
        case 500:
          console.error('Internal Server Error.');
          break;
        default:
          console.error(`Error: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('Network error. No response received from server.');
    } else {
      console.error('Request configuration error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
