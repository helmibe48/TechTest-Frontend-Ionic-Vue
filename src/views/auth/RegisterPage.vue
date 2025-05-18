<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="register-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title class="ion-text-center">Create Account</ion-card-title>
            <ion-card-subtitle class="ion-text-center">Join us today</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <form @submit.prevent="handleRegister">
              <ion-item>
                <ion-input label="Full Name" label-placement="floating" type="text" v-model="name"></ion-input>
              </ion-item>

              <ion-item>
                <ion-input label="Email" label-placement="floating" type="email" v-model="email"></ion-input>
              </ion-item>

              <ion-item>
                <ion-input type="password" label="Password" label-placement="floating" v-model="password">
                  <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                </ion-input>
              </ion-item>

              <ion-item class="ion-margin-bottom">
                <ion-input type="password" label="Confirm Password" label-placement="floating" v-model="confirmPassword">
                  <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                </ion-input>
              </ion-item>

              <ion-button
                expand="block"
                type="submit"
                class="ion-margin-top"
                :disabled="isLoading || !isFormValid"
              >
                <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
                <span v-else>Register</span>
              </ion-button>

              <ion-text color="danger" v-if="error" class="ion-text-center ion-padding">
                <p>{{ error }}</p>
              </ion-text>

              <ion-text color="danger" v-if="passwordError" class="ion-text-center ion-padding">
                <p>{{ passwordError }}</p>
              </ion-text>
            </form>

            <div class="ion-text-center ion-padding-top">
              <ion-text>Already have an account?</ion-text>
              <ion-button fill="clear" @click="goToLogin">Login</ion-button>
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
  IonButtons,
  IonBackButton,
  toastController,
  IonInputPasswordToggle,
} from '@ionic/vue';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const passwordError = ref('');
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);

const isFormValid = computed(() => {
  if (password.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match';
    return false;
  }
  
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters';
    return false;
  }
  
  passwordError.value = '';
  return name.value && email.value && password.value && confirmPassword.value;
});

async function handleRegister() {
  if (!isFormValid.value) return;
  
  try {
    await authStore.register(name.value, email.value, password.value);
    const toast = await toastController.create({
      message: 'Registration successful!',
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

function goToLogin() {
  router.push('/login');
}
</script>

<style scoped>
.register-container {
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
