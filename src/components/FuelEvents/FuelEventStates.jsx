import { useState, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import apiClient from '../../apiClient';
import { format } from '../utils/dateUtils';

export const useFuelEventsState = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  
  // Initialize with null values to use backend defaults (current month)
  const [activeFilter, setActiveFilter] = useState({
    startDate: null,
    endDate: null
  });
  
  const fetchEvents = useCallback(async (dateRange = null) => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Use the date range for the request (either from the parameter or from state)
    const filterToUse = dateRange || activeFilter;
    
    // Update active filter if dateRange is provided (but after using it to avoid race conditions)
    if (dateRange) {
      setActiveFilter(dateRange);
    }
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filterToUse.startDate) {
        params.append('startDate', format(filterToUse.startDate, 'yyyy-MM-dd'));
      }
      if (filterToUse.endDate) {
        params.append('endDate', format(filterToUse.endDate, 'yyyy-MM-dd'));
      }
      
      // Use apiClient which already handles the auth headers and error intercepting
      const response = await apiClient.get(
        `/api/protected/GetFuelEvents${params.toString() ? '?' + params.toString() : ''}`
      );
      setEvents(response.data);
    } catch (err) {
      // The axios interceptor will handle 401 errors automatically
      setError(err.response?.data?.error || 'Failed to fetch events');
      console.error("Error fetching fuel events:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeFilter]);
  
  return { 
    events, 
    setEvents, 
    loading, 
    error, 
    fetchEvents,
    activeFilter,
    setActiveFilter
  };
};