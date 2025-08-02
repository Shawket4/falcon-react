import apiClient from '../../apiClient';

// WhatsApp API utility functions
export const whatsappAPI = {
  // Check if WhatsApp is logged in
  checkLoginStatus: async () => {
    try {
      const response = await apiClient.get('/api/protected/CheckWPLogin');
      return { success: true, loggedIn: true };
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return { success: true, loggedIn: false };
      }
      throw error;
    }
  },

  // Get QR code for WhatsApp login
  getQRCode: async () => {
    try {
      const response = await apiClient.get('/api/protected/GetWhatsAppQRCode', {
        responseType: 'blob'
      });
      
      // Create blob URL for the QR code image
      const qrBlob = new Blob([response.data], { type: 'image/png' });
      const qrUrl = URL.createObjectURL(qrBlob);
      
      return { success: true, qrUrl };
    } catch (error) {
      console.error('Error getting QR code:', error);
      return { success: false, error: error.message };
    }
  },

  // Poll for login status (used while QR is displayed)
  pollLoginStatus: (onSuccess, onError, interval = 3000, timeout = 300000) => {
    const pollInterval = setInterval(async () => {
      try {
        const result = await whatsappAPI.checkLoginStatus();
        if (result.loggedIn) {
          clearInterval(pollInterval);
          onSuccess();
        }
      } catch (error) {
        clearInterval(pollInterval);
        onError(error);
      }
    }, interval);

    // Stop polling after timeout (default 5 minutes)
    setTimeout(() => {
      clearInterval(pollInterval);
    }, timeout);

    return pollInterval; // Return interval ID so it can be cleared if needed
  }
};

export default whatsappAPI;