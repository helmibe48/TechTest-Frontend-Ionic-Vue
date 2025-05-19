import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import axios from 'axios';

const API_URL = 'http://localhost:61/api';

// Create a custom axios instance for API requests
const apiAxios = axios.create({
  baseURL: API_URL,
  withCredentials: false // Change to false to avoid CORS issues with credentials
});

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  transaction_type: string;
  status: string;
  nfc_tag_id?: string;
  nfc_data?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ApiResponse {
  data: {
    transactions: Transaction[];
    meta: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  }
  message: string;
}

export const useTableStore = defineStore('table', () => {
  const authStore = useAuthStore();
  
  // Transaction data
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  const error = ref('');
  
  // Pagination from API
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalItems = ref(0);
  const totalPages = ref(0);
  
  // Sorting (client-side for now)
  const sortBy = ref('created_at');
  const sortDirection = ref<'asc' | 'desc'>('desc');
  
  // Search
  const searchQuery = ref('');

  // Fetch transactions from API
  async function fetchTransactions() {
    if (!authStore.isAuthenticated || !authStore.token) {
      error.value = 'Authentication required';
      return;
    }
    
    isLoading.value = true;
    error.value = '';
    
    try {
      // Create a request instance with the auth token
      const instance = apiAxios;
      instance.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
      
      const response = await instance.get<ApiResponse>('/transactions', {
        params: {
          page: currentPage.value,
          per_page: itemsPerPage.value,
          search: searchQuery.value || undefined
        }
      });
      
      console.log('Transactions response:', response.data);
      
      transactions.value = response.data.data.transactions;
      
      // Update pagination info from API response
      totalItems.value = response.data.data.meta.total;
      totalPages.value = response.data.data.meta.last_page;
      currentPage.value = response.data.data.meta.current_page;
      
      // Apply client-side sorting if needed
      sortTransactions();
      
    } catch (err: any) {
      console.error('Error fetching transactions:', err.response || err);
      if (err.response && err.response.status === 401) {
        error.value = 'Authentication expired. Please login again.';
        authStore.logout();
      } else if (err.response && err.response.data && err.response.data.message) {
        error.value = err.response.data.message;
      } else {
        error.value = 'Failed to fetch transactions';
      }
    } finally {
      isLoading.value = false;
    }
  }

  // Sort transactions (client-side)
  function sortTransactions() {
    transactions.value.sort((a, b) => {
      let aValue: any = a[sortBy.value as keyof Transaction];
      let bValue: any = b[sortBy.value as keyof Transaction];
      
      // Handle nested properties (e.g., user.name)
      if (sortBy.value === 'user.name') {
        aValue = a.user?.name || '';
        bValue = b.user?.name || '';
      } else if (sortBy.value === 'user.email') {
        aValue = a.user?.email || '';
        bValue = b.user?.email || '';
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection.value === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection.value === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection.value === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      return 0;
    });
  }

  // Change page and fetch new data
  async function setPage(page: number) {
    if (page > 0 && page <= totalPages.value) {
      currentPage.value = page;
      await fetchTransactions();
    }
  }

  // Change items per page and fetch new data
  async function setItemsPerPage(perPage: number) {
    itemsPerPage.value = perPage;
    currentPage.value = 1; // Reset to first page
    await fetchTransactions();
  }

  // Change sort and re-fetch or sort client-side
  function setSorting(column: string) {
    if (sortBy.value === column) {
      // Toggle direction if clicking the same column
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      // Default to ascending for a new column
      sortBy.value = column;
      sortDirection.value = 'asc';
    }
    
    // For now, we'll just sort client-side
    sortTransactions();
    
    // In a real app with server-side sorting:
    // fetchTransactions();
  }

  // Search and reset to first page
  async function search(query: string) {
    searchQuery.value = query;
    currentPage.value = 1; // Reset to first page
    await fetchTransactions();
  }

  // Reset filters and fetch data
  async function resetFilters() {
    searchQuery.value = '';
    currentPage.value = 1;
    await fetchTransactions();
  }

  // Format date for display
  function formatDate(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  return {
    transactions,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    sortBy,
    sortDirection,
    searchQuery,
    fetchTransactions,
    setPage,
    setItemsPerPage,
    setSorting,
    search,
    resetFilters,
    formatDate
  };
});
