import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: number; email: string; name: string } | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref('');

  // Load user from localStorage on initialization
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
    isAuthenticated.value = true;
  }

  function login(email: string, password: string) {
    isLoading.value = true;
    error.value = '';
    
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // For demo purposes, accept any email with a valid format and password length > 5
        if (email.includes('@') && password.length > 5) {
          const userData = {
            id: 1,
            email,
            name: email.split('@')[0]
          };
          
          user.value = userData;
          isAuthenticated.value = true;
          localStorage.setItem('user', JSON.stringify(userData));
          isLoading.value = false;
          resolve();
        } else {
          error.value = 'Invalid email or password';
          isLoading.value = false;
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  }

  function register(name: string, email: string, password: string) {
    isLoading.value = true;
    error.value = '';
    
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // For demo purposes, accept any email with a valid format and password length > 5
        if (email.includes('@') && password.length > 5) {
          const userData = {
            id: 1,
            email,
            name
          };
          
          user.value = userData;
          isAuthenticated.value = true;
          localStorage.setItem('user', JSON.stringify(userData));
          isLoading.value = false;
          resolve();
        } else {
          error.value = 'Invalid email or password format';
          isLoading.value = false;
          reject(new Error('Invalid email or password format'));
        }
      }, 1000);
    });
  }

  function logout() {
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('user');
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout
  };
});
