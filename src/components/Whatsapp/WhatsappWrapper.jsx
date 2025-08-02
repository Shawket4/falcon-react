import React, { useEffect } from 'react';
import { useAuth } from '../AuthContext';
import WhatsAppLogin from './WhatsappLogin';

const WhatsAppWrapper = ({ children }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    needsWhatsappSetup, 
    completeWhatsappLogin, 
    skipWhatsappLogin,
    userPermission 
  } = useAuth();

  // Debug effect to track auth state
  useEffect(() => {
    console.log('WhatsApp Wrapper - Auth state:', {
      isAuthenticated,
      isLoading,
      userPermission,
      needsWhatsapp: needsWhatsappSetup(),
      token: !!localStorage.getItem('jwt')
    });
  }, [isAuthenticated, isLoading, userPermission]);

  // Show loading while auth is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  // If user is authenticated but needs WhatsApp setup, show WhatsApp login
  if (isAuthenticated && needsWhatsappSetup()) {
    console.log('Showing WhatsApp login screen');
    return (
      <WhatsAppLogin 
        onComplete={completeWhatsappLogin}
        onSkip={skipWhatsappLogin}
      />
    );
  }

  // Otherwise, render the children (main app)
  return children;
};

export default WhatsAppWrapper;