import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:61/api';

// Create a custom axios instance for auth requests
const authAxios = axios.create({
  baseURL: API_URL,
  withCredentials: false // Change to false to avoid CORS issues with credentials
});

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: number; email: string; name: string } | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref('');

  // Load user and token from localStorage on initialization
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  if (storedUser && storedToken) {
    user.value = JSON.parse(storedUser);
    token.value = storedToken;
    isAuthenticated.value = true;
    // Set the token in authAxios default headers
    authAxios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  }

  // Get axios instance with auth header
  function getAuthAxios() {
    // Create a new instance for each request to ensure fresh headers
    const instance = axios.create({
      baseURL: API_URL,
      withCredentials: false
    });
    
    if (token.value) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    }
    return instance;
  }

  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Skip CSRF cookie for now since we're not using withCredentials
      
      // Login directly
      const response = await authAxios.post('/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      // Handle successful login
      const userData = response.data.data.user;
      const accessToken = response.data.data.token;
      console.log('apa', userData, accessToken);
      
      user.value = userData;
      token.value = accessToken;
      isAuthenticated.value = true;
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', accessToken);
      
      // Set the token in authAxios default headers
      authAxios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      isLoading.value = false;
      return response.data;
    } catch (err: any) {
      console.error('Login error:', err.response || err);
      isLoading.value = false;
      if (err.response && err.response.data && err.response.data.message) {
        error.value = err.response.data.message;
      } else {
        error.value = 'Login failed. Please check your credentials.';
      }
      throw err;
    }
  }

  async function register(name: string, email: string, password: string) {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Skip CSRF cookie for now since we're not using withCredentials
      
      // Register directly
      const response = await authAxios.post('/register', {
        name,
        email,
        password,
        password_confirmation: password // Laravel typically requires this
      });
      
      console.log('Registration successful:', response.data);
      isLoading.value = false;
      return response.data;
    } catch (err: any) {
      console.error('Registration error:', err.response || err);
      isLoading.value = false;
      if (err.response && err.response.data && err.response.data.message) {
        error.value = err.response.data.message;
      } else if (err.response && err.response.data && err.response.data.errors) {
        // Format validation errors
        const validationErrors = err.response.data.errors;
        const firstError = Object.values(validationErrors)[0];
        error.value = Array.isArray(firstError) ? firstError[0] : 'Validation error';
      } else {
        error.value = 'Registration failed. Please try again.';
      }
      throw err;
    }
  }

  async function logout() {
    isLoading.value = true;
    
    try {
      if (token.value) {
        // Call the logout endpoint
        await getAuthAxios().post('/logout');
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear user data regardless of API success
      user.value = null;
      token.value = null;
      isAuthenticated.value = false;
      
      // Remove from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Remove the token from authAxios default headers
      delete authAxios.defaults.headers.common['Authorization'];
      
      isLoading.value = false;
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    getAuthAxios
  };
});
