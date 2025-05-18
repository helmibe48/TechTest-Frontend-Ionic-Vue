import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface TableItem {
  id: number;
  name: string;
  email: string;
  status: string;
  role: string;
  createdAt: string;
}

export const useTableStore = defineStore('table', () => {
  // Sample data for the table
  const items = ref<TableItem[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Admin', createdAt: '2025-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', role: 'User', createdAt: '2025-02-20' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', status: 'Active', role: 'Editor', createdAt: '2025-03-10' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', status: 'Active', role: 'User', createdAt: '2025-03-15' },
    { id: 5, name: 'Michael Wilson', email: 'michael@example.com', status: 'Inactive', role: 'User', createdAt: '2025-04-01' },
    { id: 6, name: 'Sarah Brown', email: 'sarah@example.com', status: 'Active', role: 'Admin', createdAt: '2025-04-10' },
    { id: 7, name: 'David Miller', email: 'david@example.com', status: 'Active', role: 'Editor', createdAt: '2025-04-15' },
    { id: 8, name: 'Lisa Taylor', email: 'lisa@example.com', status: 'Inactive', role: 'User', createdAt: '2025-04-20' },
    { id: 9, name: 'James Anderson', email: 'james@example.com', status: 'Active', role: 'User', createdAt: '2025-04-25' },
    { id: 10, name: 'Jennifer Thomas', email: 'jennifer@example.com', status: 'Active', role: 'Admin', createdAt: '2025-05-01' },
    { id: 11, name: 'Daniel Jackson', email: 'daniel@example.com', status: 'Inactive', role: 'User', createdAt: '2025-05-05' },
    { id: 12, name: 'Mary White', email: 'mary@example.com', status: 'Active', role: 'Editor', createdAt: '2025-05-10' },
    { id: 13, name: 'Kevin Harris', email: 'kevin@example.com', status: 'Active', role: 'User', createdAt: '2025-05-12' },
    { id: 14, name: 'Laura Martin', email: 'laura@example.com', status: 'Inactive', role: 'User', createdAt: '2025-05-14' },
    { id: 15, name: 'Steven Thompson', email: 'steven@example.com', status: 'Active', role: 'Admin', createdAt: '2025-05-16' },
  ]);

  // Pagination
  const currentPage = ref(1);
  const itemsPerPage = ref(5);
  
  // Sorting
  const sortBy = ref('name');
  const sortDirection = ref<'asc' | 'desc'>('asc');
  
  // Search
  const searchQuery = ref('');

  // Filtered and sorted items
  const filteredItems = computed(() => {
    let result = [...items.value];
    
    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortBy.value as keyof TableItem];
      const bValue = b[sortBy.value as keyof TableItem];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection.value === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection.value === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      return 0;
    });
    
    return result;
  });

  // Paginated items
  const paginatedItems = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    return filteredItems.value.slice(startIndex, startIndex + itemsPerPage.value);
  });

  // Total pages
  const totalPages = computed(() => {
    return Math.ceil(filteredItems.value.length / itemsPerPage.value);
  });

  // Change page
  function setPage(page: number) {
    if (page > 0 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }

  // Change sort
  function setSorting(column: string) {
    if (sortBy.value === column) {
      // Toggle direction if clicking the same column
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      // Default to ascending for a new column
      sortBy.value = column;
      sortDirection.value = 'asc';
    }
  }

  // Reset search and pagination
  function resetFilters() {
    searchQuery.value = '';
    currentPage.value = 1;
  }

  return {
    items,
    currentPage,
    itemsPerPage,
    sortBy,
    sortDirection,
    searchQuery,
    filteredItems,
    paginatedItems,
    totalPages,
    setPage,
    setSorting,
    resetFilters
  };
});
