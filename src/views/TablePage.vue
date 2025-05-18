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
        v-model="tableStore.searchQuery"
        placeholder="Search users..."
        animated
        @ionInput="onSearchChange"
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
        <ion-badge color="medium" class="ion-margin-start">{{ nfcStore.nfcStatus }}</ion-badge>
      </div>

      <!-- NFC Tag Info (when available) -->
      <ion-card v-if="nfcStore.lastTagRead" class="ion-margin-bottom">
        <ion-card-header>
          <ion-card-subtitle>Last NFC Tag Read</ion-card-subtitle>
          <ion-card-title>ID: {{ nfcStore.lastTagRead.id }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p><strong>Time:</strong> {{ formatDate(nfcStore.lastTagRead.timestamp) }}</p>
          <p><strong>Data:</strong> {{ nfcStore.lastTagRead.data }}</p>
        </ion-card-content>
      </ion-card>

      <!-- Responsive Table -->
      <div class="table-container">
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
              <th @click="sortTable('name')" class="sortable">
                Name
                <ion-icon
                  v-if="tableStore.sortBy === 'name'"
                  :icon="tableStore.sortDirection === 'asc' ? arrowUpOutline : arrowDownOutline"
                  size="small"
                ></ion-icon>
              </th>
              <th @click="sortTable('email')" class="sortable">
                Email
                <ion-icon
                  v-if="tableStore.sortBy === 'email'"
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
              <th @click="sortTable('role')" class="sortable">
                Role
                <ion-icon
                  v-if="tableStore.sortBy === 'role'"
                  :icon="tableStore.sortDirection === 'asc' ? arrowUpOutline : arrowDownOutline"
                  size="small"
                ></ion-icon>
              </th>
              <th @click="sortTable('createdAt')" class="sortable">
                Created
                <ion-icon
                  v-if="tableStore.sortBy === 'createdAt'"
                  :icon="tableStore.sortDirection === 'asc' ? arrowUpOutline : arrowDownOutline"
                  size="small"
                ></ion-icon>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tableStore.paginatedItems" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.email }}</td>
              <td>
                <ion-badge :color="item.status === 'Active' ? 'success' : 'medium'">
                  {{ item.status }}
                </ion-badge>
              </td>
              <td>{{ item.role }}</td>
              <td>{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="tableStore.paginatedItems.length === 0" class="empty-state">
        <ion-icon :icon="searchOutline" size="large"></ion-icon>
        <p>No results found</p>
        <ion-button size="small" @click="tableStore.resetFilters">Clear Filters</ion-button>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <ion-button
          fill="clear"
          :disabled="tableStore.currentPage === 1"
          @click="tableStore.setPage(tableStore.currentPage - 1)"
        >
          <ion-icon :icon="chevronBackOutline" slot="icon-only"></ion-icon>
        </ion-button>
        
        <span class="page-info">
          Page {{ tableStore.currentPage }} of {{ tableStore.totalPages }}
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
      <div class="items-per-page">
        <ion-label>Items per page:</ion-label>
        <ion-select
          v-model="tableStore.itemsPerPage"
          interface="popover"
          @ionChange="onItemsPerPageChange"
        >
          <ion-select-option :value="5">5</ion-select-option>
          <ion-select-option :value="10">10</ion-select-option>
          <ion-select-option :value="15">15</ion-select-option>
        </ion-select>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
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

const router = useRouter();
const tableStore = useTableStore();
const nfcStore = useNfcStore();
const authStore = useAuthStore();

// Check if user is authenticated
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  // Check NFC support
  nfcStore.checkNfcSupport();
});

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function sortTable(column: string) {
  tableStore.setSorting(column);
}

function onSearchChange() {
  tableStore.currentPage = 1; // Reset to first page on search
}

function onItemsPerPageChange() {
  tableStore.currentPage = 1; // Reset to first page when changing items per page
}

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
      await nfcStore.enableNfc();
      const toast = await toastController.create({
        message: 'NFC enabled - ready to scan',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
      
      // For demo purposes, simulate a tag read after enabling
      setTimeout(async () => {
        try {
          await nfcStore.simulateTagRead();
        } catch (error) {
          console.error('Error reading tag:', error);
        }
      }, 3000);
    }
  } catch (error) {
    const alert = await alertController.create({
      header: 'NFC Error',
      message: 'There was an error with the NFC operation. Please try again.',
      buttons: ['OK']
    });
    await alert.present();
  }
}

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
        handler: () => {
          authStore.logout();
          router.push('/login');
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
}
</style>
