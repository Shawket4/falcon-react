import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../AuthContext';
import apiClient from '../../apiClient';
import { format } from './DateUtils';

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
  
  // Use a ref to track the current request to prevent duplicate calls
  const currentRequestRef = useRef(null);
  
  const fetchEvents = useCallback(async (dateRange = null) => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }
    
    // Use the date range for the request (either from the parameter or from state)
    const filterToUse = dateRange || activeFilter;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filterToUse.startDate) {
      params.append('startDate', format(filterToUse.startDate, 'yyyy-MM-dd'));
    }
    if (filterToUse.endDate) {
      params.append('endDate', format(filterToUse.endDate, 'yyyy-MM-dd'));
    }
    
    // Create a unique request ID based on the params
    const requestId = params.toString();
    
    // Check if this is a duplicate request
    if (currentRequestRef.current === requestId) {
      return; // Skip duplicate request
    }
    
    // Store current request ID
    currentRequestRef.current = requestId;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use apiClient which already handles the auth headers and error intercepting
      const response = await apiClient.get(
        `/api/protected/GetFuelEvents${requestId ? '?' + requestId : ''}`
      );
      setEvents(response.data);
      
      // Update active filter after successful request
      if (dateRange) {
        setActiveFilter(dateRange);
      }
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