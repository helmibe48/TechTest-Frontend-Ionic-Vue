import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { NFCReader, NFCTagType } from '@monaca/capacitor-nfc-reader';

export interface NfcTag {
  id: string;
  type: NFCTagType;
  timestamp: string;
}

export const useNfcStore = defineStore('nfc', () => {
  const isNfcEnabled = ref(false);
  const isNfcSupported = ref(false);
  const nfcStatus = ref('Not initialized');
  const lastTagRead = ref<NfcTag | null>(null);
  const isReading = ref(false);
  const errorMessage = ref('');

  // Initialize NFC
  async function initialize() {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await NFCReader.initialize();
        isNfcSupported.value = result.value;
        nfcStatus.value = result.value ? 'NFC initialized' : 'NFC not supported';
        return result.value;
      } else {
        // Web platform - simulate support for development
        isNfcSupported.value = true;
        nfcStatus.value = 'NFC simulated on web';
        return true;
      }
    } catch (error) {
      console.error('Error initializing NFC:', error);
      isNfcSupported.value = false;
      nfcStatus.value = 'Error initializing NFC';
      errorMessage.value = error instanceof Error ? error.message : 'Unknown error';
      return false;
    }
  }

  // Enable NFC reading
  async function enableNfc() {
    if (!isNfcSupported.value) {
      nfcStatus.value = 'NFC not supported on this device';
      return Promise.reject(new Error('NFC not supported'));
    }

    try {
      if (Capacitor.isNativePlatform()) {
        // Set up listeners
        NFCReader.addListener('nfcTagDetected', (tag) => {
          console.log('NFC Tag detected:', tag);
          
          // Format the tag data with timestamp
          const tagData: NfcTag = {
            id: tag.id,
            type: tag.type,
            timestamp: new Date().toISOString()
          };
          
          // Update the store
          lastTagRead.value = tagData;
          nfcStatus.value = 'Tag read successfully';
        });
        
        // Set up error listener
        NFCReader.addListener('nfcError', (error) => {
          console.error('NFC Error:', error);
          errorMessage.value = error.message;
          nfcStatus.value = `Error: ${error.message}`;
        });

        // Start NFC scanning
        await NFCReader.startScanning();
        isNfcEnabled.value = true;
        isReading.value = true;
        nfcStatus.value = 'NFC enabled and scanning';
      } else {
        // Web platform - simulate enabling
        isNfcEnabled.value = true;
        nfcStatus.value = 'NFC enabled (simulated)';
        // Simulate a tag read after a delay on web
        setTimeout(simulateTagRead, 3000);
      }
    } catch (error) {
      console.error('Error enabling NFC:', error);
      nfcStatus.value = 'Error enabling NFC';
      errorMessage.value = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  // Disable NFC reading
  async function disableNfc() {
    try {
      if (Capacitor.isNativePlatform() && isNfcEnabled.value) {
        // Remove all listeners
        await NFCReader.removeAllListeners();
        
        // Stop scanning
        await NFCReader.stopScanning();
      }
      
      isNfcEnabled.value = false;
      isReading.value = false;
      nfcStatus.value = 'NFC disabled';
    } catch (error) {
      console.error('Error disabling NFC:', error);
      nfcStatus.value = 'Error disabling NFC';
      errorMessage.value = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  // Simulate reading an NFC tag (for web development)
  function simulateTagRead() {
    if (!isNfcEnabled.value) {
      return Promise.reject(new Error('NFC not enabled'));
    }

    return new Promise<NfcTag>((resolve) => {
      const tagData: NfcTag = {
        id: Math.random().toString(36).substring(2, 10),
        type: NFCTagType.MIFARE,
        timestamp: new Date().toISOString()
      };
      
      lastTagRead.value = tagData;
      nfcStatus.value = 'Tag read successfully (simulated)';
      resolve(tagData);
    });
  }

  return {
    isNfcEnabled,
    isNfcSupported,
    isReading,
    nfcStatus,
    lastTagRead,
    errorMessage,
    initialize,
    enableNfc,
    disableNfc,
    simulateTagRead
  };
});
