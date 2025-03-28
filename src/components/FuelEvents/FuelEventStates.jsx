// File: hooks/useFuelEventsState.js
import { useState, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import apiClient from '../../apiClient';

export const useFuelEventsState = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  
  const fetchEvents = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use apiClient which already handles the auth headers and error intercepting
      const response = await apiClient.get('/api/protected/GetFuelEvents');
      setEvents(response.data);
    } catch (err) {
      // The axios interceptor will handle 401 errors automatically
      setError(err.response?.data?.error || 'Failed to fetch events');
      console.error("Error fetching fuel events:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  return { events, setEvents, loading, error, fetchEvents };
};