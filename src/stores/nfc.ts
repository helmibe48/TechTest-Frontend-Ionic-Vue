import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNfcStore = defineStore('nfc', () => {
  const isNfcEnabled = ref(false);
  const isNfcSupported = ref(false);
  const nfcStatus = ref('Not initialized');
  const lastTagRead = ref<any>(null);

  // Check if NFC is supported on the device
  function checkNfcSupport() {
    // In a real app, we would use Capacitor NFC plugin to check support
    // For demo purposes, we'll simulate this
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // Simulate checking for NFC support
        isNfcSupported.value = true;
        nfcStatus.value = 'NFC supported but not enabled';
        resolve(true);
      }, 500);
    });
  }

  // Enable NFC reading
  function enableNfc() {
    if (!isNfcSupported.value) {
      nfcStatus.value = 'NFC not supported on this device';
      return Promise.reject(new Error('NFC not supported'));
    }

    return new Promise<void>((resolve) => {
      // Simulate enabling NFC
      setTimeout(() => {
        isNfcEnabled.value = true;
        nfcStatus.value = 'NFC enabled and scanning';
        resolve();
      }, 1000);
    });
  }

  // Disable NFC reading
  function disableNfc() {
    return new Promise<void>((resolve) => {
      // Simulate disabling NFC
      setTimeout(() => {
        isNfcEnabled.value = false;
        nfcStatus.value = 'NFC disabled';
        resolve();
      }, 500);
    });
  }

  // Simulate reading an NFC tag
  function simulateTagRead() {
    if (!isNfcEnabled.value) {
      return Promise.reject(new Error('NFC not enabled'));
    }

    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const tagData = {
          id: Math.random().toString(36).substring(2, 10),
          timestamp: new Date().toISOString(),
          data: 'Sample NFC tag data'
        };
        
        lastTagRead.value = tagData;
        nfcStatus.value = 'Tag read successfully';
        resolve(tagData);
      }, 1500);
    });
  }

  return {
    isNfcEnabled,
    isNfcSupported,
    nfcStatus,
    lastTagRead,
    checkNfcSupport,
    enableNfc,
    disableNfc,
    simulateTagRead
  };
});
