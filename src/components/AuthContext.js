import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SERVER_IP } from '../config';
import { setLogoutHandler } from '../apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPermission, setUserPermission] = useState(null);
  const [user, setUser] = useState(null);
  const [whatsappRequired, setWhatsappRequired] = useState(false);
  const [whatsappChecked, setWhatsappChecked] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('jwt');
      
      if (token) {
        // Set the default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Trust token from localStorage to prevent loading issues
          setIsAuthenticated(true);
          
          // Get user permission level
          const permission = localStorage.getItem('permission');
          const userName = localStorage.getItem('user_name');
          const userEmail = localStorage.getItem('user_email');
          const whatsappSkipped = localStorage.getItem('whatsapp_skipped');
          
          setUserPermission(permission);
          setUser({
            name: userName,
            email: userEmail
          });

          // Check if WhatsApp check is required for this user
          const permissionLevel = parseInt(permission) || 0;
          if (permissionLevel >= 4 && !whatsappSkipped) {
            setWhatsappRequired(true);
          } else {
            setWhatsappChecked(true);
          }
          
          // Optional background validation
          axios.get(`${SERVER_IP}/api/validate-token`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(error => {
            console.error('Token validation error:', error);
            // Only log out if it's specifically an auth error
            if (error.response && error.response.status === 401) {
              logout();
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  // Register the logout function with the API client
  useEffect(() => {
    setLogoutHandler(logout);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${SERVER_IP}/api/login`, {
        email,
        password
      }, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.jwt) {
        localStorage.setItem('jwt', response.data.jwt);
        localStorage.setItem('permission', response.data.permission || '');
        localStorage.setItem('user_name', response.data.name || email);
        localStorage.setItem('user_email', email);
        
        // Clear any previous WhatsApp skip status
        localStorage.removeItem('whatsapp_skipped');
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.jwt}`;
        
        setIsAuthenticated(true);
        setUserPermission(response.data.permission);
        setUser({
          name: response.data.name || email,
          email: email
        });

        // Check if WhatsApp check is required for this user
        const permissionLevel = parseInt(response.data.permission) || 0;
        if (permissionLevel >= 4) {
          setWhatsappRequired(true);
          setWhatsappChecked(false);
        } else {
          setWhatsappRequired(false);
          setWhatsappChecked(true);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('permission');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('whatsapp_skipped');
    
    delete axios.defaults.headers.common['Authorization'];
    
    setIsAuthenticated(false);
    setUserPermission(null);
    setUser(null);
    setWhatsappRequired(false);
    setWhatsappChecked(false);
    
    // Redirect to login if needed
    if (window.location.pathname !== '/landing-page') {
      window.location.href = '/landing-page';
    }
  };

  // Handle WhatsApp login completion
  const completeWhatsappLogin = () => {
    setWhatsappRequired(false);
    setWhatsappChecked(true);
  };

  // Handle WhatsApp skip
  const skipWhatsappLogin = () => {
    localStorage.setItem('whatsapp_skipped', 'true');
    setWhatsappRequired(false);
    setWhatsappChecked(true);
  };

  // Check if user has required permission role
  const hasPermission = (requiredPermission) => {
    if (!requiredPermission) return true;
    return userPermission === requiredPermission;
  };

  // Check if user has minimum permission level
  const hasMinPermissionLevel = (minLevel) => {
    // Convert the string permission to a number
    const permissionLevel = parseInt(userPermission) || 0;
    return permissionLevel >= minLevel;
  };

  // Check if user needs WhatsApp setup
  const needsWhatsappSetup = () => {
    return whatsappRequired && !whatsappChecked;
  };

  const authContextValue = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasMinPermissionLevel,
    userPermission,
    user,
    whatsappRequired,
    whatsappChecked,
    needsWhatsappSetup,
    completeWhatsappLogin,
    skipWhatsappLogin
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;