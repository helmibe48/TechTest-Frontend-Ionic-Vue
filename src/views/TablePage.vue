<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Data Table</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">
            <ion-icon :icon="logOutOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Search Bar -->
      <ion-searchbar
        v-model="searchInput"
        placeholder="Search transactions..."
        animated
        @ionInput="onSearchChange"
        :debounce="500"
      ></ion-searchbar>

      <!-- NFC Button -->
      <div class="nfc-button-container">
        <ion-button
          @click="toggleNfc"
          :color="nfcStore.isNfcEnabled ? 'danger' : 'primary'"
          class="ion-margin-bottom"
        >
          <ion-icon :icon="nfcStore.isNfcEnabled ? closeCircleOutline : wifiOutline" slot="start"></ion-icon>
          {{ nfcStore.isNfcEnabled ? 'Disable NFC' : 'Enable NFC' }}
        </ion-button>
        <ion-badge :color="getNfcStatusColor(nfcStore.nfcStatus)" class="ion-margin-start">{{ nfcStore.nfcStatus }}</ion-badge>
      </div>

      <!-- NFC Tag Info (when available) -->
      <ion-card v-if="nfcStore.lastTagRead" class="ion-margin-bottom">
        <ion-card-header>
          <ion-card-subtitle>Last NFC Tag Read</ion-card-subtitle>
          <ion-card-title>ID: {{ nfcStore.lastTagRead.id }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p><strong>Time:</strong> {{ tableStore.formatDate(nfcStore.lastTagRead.timestamp) }}</p>
          <p><strong>Type:</strong> {{ nfcStore.lastTagRead.type }}</p>
          <div v-if="nfcStore.errorMessage" class="error-message">
            <p><strong>Error:</strong> {{ nfcStore.errorMessage }}</p>
          </div>
          <!-- Write to tag section removed as it's not supported by the library -->
        </ion-card-content>
      </ion-card>

      <!-- Loading State -->
      <div v-if="tableStore.isLoading" class="loading-state">
        <ion-spinner name="circular"></ion-spinner>
        <p>Loading transactions...</p>
      </div>

      <!-- Error State -->
      <ion-card v-else-if="tableStore.error" class="error-state">
        <ion-card-header>
          <ion-card-title>Error</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>{{ tableStore.error }}</p>
          <ion-button @click="fetchTransactions" class="ion-margin-top">Retry</ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Responsive Table -->
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th @click="sortTable('id')" class="sortable">
                ID
                <ion-icon
                  v-if="tableStore.sortBy === 'id'"
                  :icon="tableStore.sortDirection === 'asc' ? arrowUpOutline : arrowDownOutline"
                  size="small"
                ></ion-icon>
              </th>
              <th @click="sortTable('user.name')" class="sortable">
                User
                <ion-icon
                  v-if="tableStore.sortBy === 'user.name'"
                  :icon="tableStore.sortDirection === 'asc' ? arrowUpOutline : arrowDownOutline"
                  size="small"
                ></ion-icon>
              </th>
              <th @click="sortTable('amount')" class="sortable">
                Amount
                <ion-icon
                  v-if="tableStore.sortBy === 'amount'"
                  :icon="tableStore.sortDirection === 'asc' ? arrowUpOutline : arrowDownOutline"
                  size="small"
                ></ion-icon>
              </th>
              <th @click="sortTable('transaction_type')" class="sortable">
                Type
                <ion-icon
                  v-if="tableStore.sortBy === 'transaction_type'"
                  :icon="tableStore.sortDirection === 'asc' ? arrowUpOutline : arrowDownOutline"
                  size="small"
                ></ion-icon>
              </th>
              <th @click="sortTable('status')" class="sortable">
                Status
                <ion-icon
                  v-if="tableStore.sortBy === 'status'"
                  :icon="tableStore.sortDirection === 'asc' ? arrowUpOutline : arrowDownOutline"
                  size="small"
                ></ion-icon>
              </th>
              <th @click="sortTable('nfc_tag_id')" class="sortable">
                NFC Tag
                <ion-icon
                  v-if="tableStore.sortBy === 'nfc_tag_id'"
                  :icon="tableStore.sortDirection === 'asc' ? arrowUpOutline : arrowDownOutline"
                  size="small"
                ></ion-icon>
              </th>
              <th @click="sortTable('created_at')" class="sortable">
                Created
                <ion-icon
                  v-if="tableStore.sortBy === 'created_at'"
                  :icon="tableStore.sortDirection === 'asc' ? arrowUpOutline : arrowDownOutline"
                  size="small"
                ></ion-icon>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in tableStore.transactions" :key="transaction.id">
              <td>{{ transaction.id }}</td>
              <td>{{ transaction.user?.name || 'Unknown' }}</td>
              <td>{{ formatCurrency(transaction.amount) }}</td>
              <td>{{ transaction.transaction_type }}</td>
              <td>
                <ion-badge :color="getStatusColor(transaction.status)">
                  {{ transaction.status }}
                </ion-badge>
              </td>
              <td>
                <ion-badge v-if="transaction.nfc_tag_id" color="tertiary">
                  {{ transaction.nfc_tag_id }}
                </ion-badge>
                <span v-else>-</span>
              </td>
              <td>{{ tableStore.formatDate(transaction.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!tableStore.isLoading && !tableStore.error && tableStore.transactions.length === 0" class="empty-state">
        <ion-icon :icon="searchOutline" size="large"></ion-icon>
        <p>No transactions found</p>
        <ion-button size="small" @click="tableStore.resetFilters">Clear Filters</ion-button>
      </div>

      <!-- Pagination -->
      <div v-if="!tableStore.isLoading && !tableStore.error && tableStore.transactions.length > 0" class="pagination">
        <ion-button
          fill="clear"
          :disabled="tableStore.currentPage === 1"
          @click="tableStore.setPage(tableStore.currentPage - 1)"
        >
          <ion-icon :icon="chevronBackOutline" slot="icon-only"></ion-icon>
        </ion-button>
        
        <span class="page-info">
          Page {{ tableStore.currentPage }} of {{ tableStore.totalPages }} 
          ({{ tableStore.totalItems }} total items)
        </span>
        
        <ion-button
          fill="clear"
          :disabled="tableStore.currentPage === tableStore.totalPages"
          @click="tableStore.setPage(tableStore.currentPage + 1)"
        >
          <ion-icon :icon="chevronForwardOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>

      <!-- Items per page selector -->
      <div v-if="!tableStore.isLoading && !tableStore.error && tableStore.transactions.length > 0" class="items-per-page">
        <ion-label>Items per page:</ion-label>
        <ion-select
          :value="tableStore.itemsPerPage"
          interface="popover"
          @ionChange="onItemsPerPageChange"
        >
          <ion-select-option :value="10">10</ion-select-option>
          <ion-select-option :value="15">15</ion-select-option>
          <ion-select-option :value="25">25</ion-select-option>
          <ion-select-option :value="50">50</ion-select-option>
        </ion-select>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonBadge,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonSpinner,
  toastController,
  alertController
} from '@ionic/vue';
import {
  arrowUpOutline,
  arrowDownOutline,
  searchOutline,
  chevronBackOutline,
  chevronForwardOutline,
  wifiOutline,
  closeCircleOutline,
  logOutOutline
} from 'ionicons/icons';
import { useTableStore } from '@/stores/table';
import { useNfcStore } from '@/stores/nfc';
import { useAuthStore } from '@/stores/auth';
import { Capacitor } from '@capacitor/core';

const router = useRouter();
const tableStore = useTableStore();
const nfcStore = useNfcStore();
const authStore = useAuthStore();
const searchInput = ref('');

// Check if user is authenticated and fetch transactions
onMounted(async () => {
  if(Capacitor.getPlatform() === 'web') {
    if (!authStore.isAuthenticated) {
      router.push('/login');
      return;
    }
  }

  // Fetch transactions
  await fetchTransactions();
});

// Fetch transactions from API
async function fetchTransactions() {
  try {
    await tableStore.fetchTransactions();
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

// Format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Get status color based on status value
function getStatusColor(status: string) {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('complete') || statusLower.includes('success')) {
    return 'success';
  } else if (statusLower.includes('pending') || statusLower.includes('process')) {
    return 'warning';
  } else if (statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('cancel')) {
    return 'danger';
  }
  return 'medium';
}

// Handle sorting
function sortTable(column: string) {
  tableStore.setSorting(column);
}

// Handle search
function onSearchChange() {
  tableStore.search(searchInput.value);
}

// Handle items per page change
function onItemsPerPageChange(event: CustomEvent) {
  const perPage = event.detail.value;
  tableStore.setItemsPerPage(perPage);
}

const tagWriteData = ref('');

// Get color for NFC status badge
function getNfcStatusColor(status: string) {
  if (status.includes('enabled') || status.includes('success')) {
    return 'success';
  } else if (status.includes('disabled')) {
    return 'medium';
  } else if (status.includes('error') || status.includes('not supported')) {
    return 'danger';
  } else if (status.includes('scanning') || status.includes('reading')) {
    return 'warning';
  }
  return 'medium';
}

// Format tag data for display
function formatTagData(data: any): string {
  if (!data) return 'No data';
  
  try {
    if (Array.isArray(data)) {
      return data.map(record => {
        if (record.recordType === 'text' && record.payload) {
          return `Text: ${record.payload}`;
        } else if (record.recordType === 'uri' && record.payload) {
          return `URI: ${record.payload}`;
        } else {
          return JSON.stringify(record, null, 2);
        }
      }).join('\n');
    } else if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    } else {
      return String(data);
    }
  } catch (e) {
    return String(data);
  }
}

// Toggle NFC
async function toggleNfc() {
  try {
    if (nfcStore.isNfcEnabled) {
      await nfcStore.disableNfc();
      const toast = await toastController.create({
        message: 'NFC disabled',
        duration: 2000,
        position: 'bottom',
        color: 'medium'
      });
      await toast.present();
    } else {
      // First initialize NFC
      const initialized = await nfcStore.initialize();
      if (!initialized) {
        const alert = await alertController.create({
          header: 'NFC Not Supported',
          message: 'NFC is not supported on this device or is not available.',
          buttons: ['OK']
        });
        await alert.present();
        return;
      }
      
      // Then enable NFC scanning
      await nfcStore.enableNfc();
      const toast = await toastController.create({
        message: 'NFC enabled - ready to scan',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
      
      // For web platform, simulate a tag read
      if (!Capacitor.isNativePlatform()) {
        setTimeout(async () => {
          try {
            await nfcStore.simulateTagRead();
          } catch (error) {
            console.error('Error reading tag:', error);
          }
        }, 3000);
      }
    }
  } catch (error) {
    console.error('NFC error:', error);
    const alert = await alertController.create({
      header: 'NFC Error',
      message: `There was an error with the NFC operation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      buttons: ['OK']
    });
    await alert.present();
  }
}

// Note: Writing to NFC tags is not supported by the @monaca/capacitor-nfc-reader library

// Logout
async function logout() {
  const alert = await alertController.create({
    header: 'Logout',
    message: 'Are you sure you want to logout?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Logout',
        handler: async () => {
          try {
            await authStore.logout();
            router.push('/login');
          } catch (error) {
            console.error('Error during logout:', error);
            const toast = await toastController.create({
              message: 'Logout failed. Please try again.',
              duration: 3000,
              position: 'bottom',
              color: 'danger'
            });
            await toast.present();
          }
        }
      }
    ]
  });
  await alert.present();
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--ion-color-light);
}

.data-table th {
  background-color: var(--ion-color-light);
  font-weight: bold;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.data-table th.sortable:hover {
  background-color: var(--ion-color-light-shade);
}

.data-table tr:hover {
  background-color: var(--ion-color-light-tint);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.page-info {
  margin: 0 10px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--ion-color-medium);
}

.nfc-button-container {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.items-per-page {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 10px;
}

.items-per-page ion-label {
  margin-right: 10px;
}

/* NFC related styles */
.tag-data {
  background-color: var(--ion-color-light);
  padding: 10px;
  border-radius: 8px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;
  font-size: 0.9em;
}

.write-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--ion-color-light);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .data-table th,
  .data-table td {
    padding: 8px;
  }
  
  .items-per-page {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .data-table {
    font-size: 0.9em;
  }
  
  .nfc-button-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .nfc-button-container ion-badge {
    margin-top: 8px;
    margin-left: 0;
  }
  
  .tag-data {
    max-height: 150px;
    font-size: 0.8em;
  }
}
</style>
