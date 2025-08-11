import { useState, useCallback, useRef, useEffect } from 'react';
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
    endDate: null,
    method: 'all' // Default to 'all' on mount
  });
  
  // Use a ref to track API calls in progress
  const apiCallInProgressRef = useRef(false);
  const pendingCallRef = useRef(null);
  
  // Actual API call function
  const makeApiCall = useCallback(async (filterToUse) => {
    // Set the flag to indicate an API call is in progress
    apiCallInProgressRef.current = true;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filterToUse.startDate) {
      params.append('startDate', format(filterToUse.startDate, 'yyyy-MM-dd'));
    }
    if (filterToUse.endDate) {
      params.append('endDate', format(filterToUse.endDate, 'yyyy-MM-dd'));
    }
    // Add method parameter
    if (filterToUse.method && filterToUse.method !== 'all') {
      params.append('method', filterToUse.method);
    }
    
    const queryString = params.toString();
    console.log("Making API call with params:", queryString || "default");
    
    setLoading(true);
    setError(null);
    
    try {
      // Use apiClient which already handles the auth headers and error intercepting
      const response = await apiClient.get(
        `/api/protected/GetFuelEvents${queryString ? '?' + queryString : ''}`
      );
      setEvents(response.data);
    } catch (err) {
      // The axios interceptor will handle 401 errors automatically
      setError(err.response?.data?.error || 'Failed to fetch events');
      console.error("Error fetching fuel events:", err);
    } finally {
      setLoading(false);
      apiCallInProgressRef.current = false;
      
      // Check if there's a pending call that was queued while this one was in progress
      if (pendingCallRef.current) {
        const pendingFilter = pendingCallRef.current;
        pendingCallRef.current = null;
        makeApiCall(pendingFilter);
      }
    }
  }, []);
  
  // Public fetch function that queues API calls to prevent duplicates
  const fetchEvents = useCallback((dateRange = null, methodFilter = null) => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }
    
    // Create new filter object
    let newFilter = { ...activeFilter };
    
    // Update date range if provided
    if (dateRange) {
      newFilter = { ...newFilter, ...dateRange };
    }
    
    // Update method filter if provided
    if (methodFilter !== null) {
      newFilter = { ...newFilter, method: methodFilter };
    }
    
    // Update active filter
    setActiveFilter(newFilter);
    
    // If an API call is already in progress, queue this one for later
    if (apiCallInProgressRef.current) {
      console.log("API call already in progress, queueing next call");
      pendingCallRef.current = newFilter;
      return;
    }
    
    // Otherwise make the API call immediately
    makeApiCall(newFilter);
  }, [isAuthenticated, activeFilter, makeApiCall]);
  
  // Function to toggle method filter
  const toggleMethodFilter = useCallback((isPetroAppOnly) => {
    const methodFilter = isPetroAppOnly ? 'PetroApp' : 'all';
    fetchEvents(null, methodFilter);
  }, [fetchEvents]);
  
  // Reset filter when component unmounts
  useEffect(() => {
    return () => {
      // Clear any pending API calls
      pendingCallRef.current = null;
    };
  }, []);
  
  return { 
    events, 
    setEvents, 
    loading, 
    error, 
    fetchEvents,
    activeFilter,
    setActiveFilter,
    toggleMethodFilter
  };
};