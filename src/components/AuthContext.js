import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SERVER_IP } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPermission, setUserPermission] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('jwt');
      
      if (token) {
        // Set the default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Instead of validating with the server on every refresh (which can cause issues),
          // we'll trust the token in localStorage and just set the auth state
          setIsAuthenticated(true);
          
          // Get user permission level
          const permission = localStorage.getItem('permission');
          setUserPermission(permission);
          
          // Optional: You can still do a lightweight validation in the background
          // without blocking the auth flow
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
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.jwt}`;
        
        setIsAuthenticated(true);
        setUserPermission(response.data.permission);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Define logout function outside of useEffect to avoid circular reference
  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('permission');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    
    delete axios.defaults.headers.common['Authorization'];
    
    setIsAuthenticated(false);
    setUserPermission(null);
  };

  // Check if user has required permission
  const hasPermission = (requiredPermission) => {
    if (!requiredPermission) return true;
    return userPermission === requiredPermission;
  };

  const authContextValue = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    userPermission
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;