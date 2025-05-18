<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title class="ion-text-center">Welcome Back</ion-card-title>
            <ion-card-subtitle class="ion-text-center">Sign in to your account</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <form @submit.prevent="handleLogin">
              <ion-item>
                <ion-input label="Email" label-placement="floating" type="email" v-model="email"></ion-input>
              </ion-item>

              <ion-item class="ion-margin-bottom">
                <ion-input type="password" label="Password" label-placement="floating" v-model="password">
                  <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                </ion-input>
              </ion-item>

              <ion-button
                expand="block"
                type="submit"
                class="ion-margin-top"
                :disabled="isLoading"
              >
                <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
                <span v-else>Login</span>
              </ion-button>

              <ion-text color="danger" v-if="error" class="ion-text-center ion-padding">
                <p>{{ error }}</p>
              </ion-text>
            </form>

            <div class="ion-text-center ion-padding-top">
              <ion-text>Don't have an account?</ion-text>
              <ion-button fill="clear" @click="goToRegister">Register</ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  toastController,
  IonInputPasswordToggle,
} from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value);
    const toast = await toastController.create({
      message: 'Login successful!',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
    router.push('/table');
  } catch (err) {
    // Error is already handled in the store
  }
}

function goToRegister() {
  router.push('/register');
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  max-width: 400px;
  margin: 0 auto;
}

ion-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
