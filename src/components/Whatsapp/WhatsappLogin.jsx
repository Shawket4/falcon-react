import React, { useState, useEffect } from 'react';
import whatsappAPI from './WhatsappUtility';

const WhatsAppLogin = ({ onComplete, onSkip }) => {
  const [whatsappStatus, setWhatsappStatus] = useState('checking'); // checking, not_logged_in, logged_in, error
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check WhatsApp login status
  const checkWhatsAppStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await whatsappAPI.checkLoginStatus();
      
      if (result.loggedIn) {
        setWhatsappStatus('logged_in');
        // Auto-complete if already logged in
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setWhatsappStatus('not_logged_in');
      }
    } catch (error) {
      setWhatsappStatus('error');
      setError('Failed to check WhatsApp status');
      console.error('WhatsApp status check error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get QR code for WhatsApp login
  const getQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await whatsappAPI.getQRCode();
      
      if (result.success) {
        setQrCodeUrl(result.qrUrl);
        // Start polling for login status
        startPolling();
      } else {
        setError(result.error || 'Failed to get QR code');
      }
    } catch (error) {
      setError('Failed to get QR code');
      console.error('QR code error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for login status while QR is displayed
  const startPolling = () => {
    whatsappAPI.pollLoginStatus(
      // On success
      () => {
        setWhatsappStatus('logged_in');
        // Clean up QR code URL
        if (qrCodeUrl) {
          URL.revokeObjectURL(qrCodeUrl);
        }
        setTimeout(() => {
          onComplete();
        }, 1000);
      },
      // On error
      (error) => {
        setError('Connection error during login check');
        console.error('Polling error:', error);
      }
    );
  };

  // Initial check on component mount
  useEffect(() => {
    checkWhatsAppStatus();
    
    // Cleanup QR code URL on unmount
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, []);

  if (whatsappStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Checking WhatsApp Status
            </h2>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (whatsappStatus === 'logged_in') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              WhatsApp Connected!
            </h2>
            <p className="text-gray-600">Redirecting to the system...</p>
          </div>
        </div>
      </div>
    );
  }

  if (whatsappStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={checkWhatsAppStatus}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Retrying...' : 'Try Again'}
              </button>
              <button
                onClick={onSkip}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Skip WhatsApp Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // whatsappStatus === 'not_logged_in'
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connect WhatsApp
          </h2>
          <p className="text-gray-600 mb-6">
            To enable WhatsApp notifications, please scan the QR code with your WhatsApp mobile app.
          </p>
          
          {!qrCodeUrl ? (
            <button
              onClick={getQRCode}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 mb-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting QR Code...
                </>
              ) : (
                'Get QR Code'
              )}
            </button>
          ) : (
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <img 
                  src={qrCodeUrl} 
                  alt="WhatsApp QR Code" 
                  className="mx-auto max-w-full h-auto"
                  style={{ maxWidth: '200px' }}
                />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                1. Open WhatsApp on your phone<br/>
                2. Tap Menu or Settings and select Linked Devices<br/>
                3. Point your phone to this screen to capture the code
              </p>
              <div className="flex items-center justify-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Waiting for scan...
              </div>
            </div>
          )}
          
          <button
            onClick={onSkip}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Skip WhatsApp Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppLogin;