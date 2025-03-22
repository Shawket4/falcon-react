import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Droplet, AlertTriangle, Calendar, Gauge, Filter } from 'lucide-react';
import { useAuth } from './AuthContext'; // Import the auth context hook
import apiClient from '../apiClient'; // Import the axios instance with interceptors

// Simple date utility functions
const parseISO = (dateStr) => {
  // Handles various date formats
  const date = new Date(dateStr);
  return isNaN(date) ? null : date;
};

const format = (date, formatStr) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  switch(formatStr) {
    case 'yyyy-MM-dd':
      return d.toISOString().split('T')[0];
    case 'MMM dd, yyyy':
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    default:
      return d.toISOString();
  }
};

const isWithinInterval = (date, { start, end }) => {
  if (!date || !start || !end) return true;
  return date >= start && date <= end;
};

// Utility function for text normalization
const normalizeText = (text) => {
  if (!text) return '';
  
  const normalizationMap = {
    'آ': 'ا', 'أ': 'ا', 'إ': 'ا', 'ٱ': 'ا',
    'ي': 'ى', 'ئ': 'ى',
    'ؤ': 'و',
    'ة': 'ه',
    'ً': '', 'ٌ': '', 'ٍ': '', 'َ': '', 'ُ': '', 'ِ': '', 
    'ّ': '', 'ْ': '', 'ٰ': '', 'ٓ': '', 'ٔ': '', 'ٕ': '',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', 
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  return text.split('').map(char => 
    normalizationMap[char] || char
  ).join('').trim().toLowerCase();
};

// Error Boundary Component
const ErrorBoundary = ({ children, fallback }) => {
  try {
    return children;
  } catch (error) {
    console.error('Uncaught error:', error);
    return fallback || (
      <div className="flex justify-center items-center h-full p-4 bg-red-50 text-red-600">
        <p>Something went wrong. Please try again later.</p>
      </div>
    );
  }
};

// Centralized state management hook
const useFuelEventsState = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Get authentication status
  
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

const FuelEventsList = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth(); // Get auth data
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  const { events, loading, error, fetchEvents } = useFuelEventsState();
  
  // Fixed card height (in pixels)
  const CARD_HEIGHT = 320;
  const CARD_HEADER_HEIGHT = 48;
  const CARD_CONTENT_HEIGHT = CARD_HEIGHT - CARD_HEADER_HEIGHT;
  
  // Fetch events on component mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [fetchEvents, isAuthenticated]);

  // Memoized filtering and grouping
  const processedEvents = useMemo(() => {
    // Normalize search term
    const normalizedSearch = normalizeText(searchTerm);
    
    // Filter events based on search and date range
    const filteredEvents = events.filter(event => {
      // Normalize event details for searching
      const normalizedPlate = normalizeText(event.car_no_plate);
      const normalizedDriver = normalizeText(event.driver_name);
      
      // Search filter
      const matchesSearch = 
        normalizedPlate.includes(normalizedSearch) ||
        normalizedDriver.includes(normalizedSearch);
      
      // Date range filter
      const eventDate = parseISO(event.date);
      const isWithinDateRange = !dateRange.startDate || !dateRange.endDate || 
        isWithinInterval(eventDate, {
          start: dateRange.startDate,
          end: dateRange.endDate
        });
      
      return matchesSearch && isWithinDateRange;
    });
    
    // Group by car plate and calculate stats
    const groupedEvents = filteredEvents.reduce((acc, event) => {
      const carPlate = event.car_no_plate;
      if (!acc[carPlate]) {
        acc[carPlate] = {
          events: [],
          totalLiters: 0,
          totalCost: 0,
          totalDistance: 0,
          avgFuelRate: 0,
          lastUpdated: null // Track the most recent event date
        };
      }
      
      acc[carPlate].events.push(event);
      
      const liters = parseFloat(event.liters);
      const fuelRate = parseFloat(event.fuel_rate);
      
      acc[carPlate].totalLiters += liters;
      acc[carPlate].totalCost += parseFloat(event.price);
      
      // Calculate distance from fuel rate and liters
      // distance = liters * km/L
      const distance = liters * fuelRate;
      acc[carPlate].totalDistance += distance;
      
      // Track the most recent event date for sorting
      const eventDate = new Date(event.date);
      if (!acc[carPlate].lastUpdated || eventDate > acc[carPlate].lastUpdated) {
        acc[carPlate].lastUpdated = eventDate;
      }
      
      return acc;
    }, {});
    
    // Calculate average fuel rate for each car and sort events
    Object.keys(groupedEvents).forEach(carPlate => {
      const carData = groupedEvents[carPlate];
      
      // Avoid division by zero
      if (carData.totalLiters > 0) {
        // avgFuelRate = totalDistance / totalLiters
        carData.avgFuelRate = carData.totalDistance / carData.totalLiters;
      } else {
        carData.avgFuelRate = 0;
      }
      
      // Sort events within each car by date (newest first), then by odometer (highest first)
      carData.events.sort((a, b) => {
        // Primary sort by date
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Sort by date
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA; // Newest first
        }
        
        // If dates are the same, sort by odometer as secondary sort
        const odometerA = parseFloat(a.odometer_after) || 0;
        const odometerB = parseFloat(b.odometer_after) || 0;
        
        return odometerB - odometerA; // Highest first
      });
    });
    
    return groupedEvents;
  }, [events, searchTerm, dateRange]);

  // Get sorted car plates based on most recent event date
  const sortedCarPlates = useMemo(() => {
    const plates = Object.keys(processedEvents);
    
    // Sort car plates by the most recent event date
    return plates.sort((a, b) => {
      const lastDateA = processedEvents[a].lastUpdated;
      const lastDateB = processedEvents[b].lastUpdated;
      
      return lastDateB - lastDateA; // Most recent first
    });
  }, [processedEvents]);

  // Reset date range filter
  const resetDateFilter = () => {
    setDateRange({ startDate: null, endDate: null });
  };
  
  // Render methods
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Droplet className="w-16 h-16 text-gray-400 mb-4" />
      <p className="text-gray-600 mb-4">No fuel events found</p>
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        onClick={() => navigate('/add-fuel')}
      >
        <PlusCircle className="mr-2" /> Add Fuel Event
      </button>
    </div>
  );
  
  // Format odometer value
  const formatOdometer = (value) => {
    if (!value) return 'N/A';
    const numValue = parseFloat(value);
    return isNaN(numValue) ? 'N/A' : numValue.toLocaleString() + ' km';
  };
  
  const renderEventCard = (carPlate, carData) => (
    <div key={carPlate} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{ height: `${CARD_HEIGHT}px` }}>
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center" style={{ height: `${CARD_HEADER_HEIGHT}px` }}>
        <span className="font-medium truncate">{carPlate}</span>
        <div className="flex space-x-2">
          <span className="flex items-center">
            <Droplet className="w-4 h-4 mr-1" />
            {carData.totalLiters.toFixed(1)}L
          </span>
          <span className="flex items-center">
            <Gauge className="w-4 h-4 mr-1" />
            {carData.avgFuelRate.toFixed(1)} km/L
          </span>
        </div>
      </div>
      
      {/* Simple column labels header */}
      <div className="flex justify-between items-center bg-gray-100 px-3 py-2 border-b text-xs font-medium text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          Date
        </div>
        <div className="flex items-center">
          <Gauge className="w-3 h-3 mr-1" />
          Odometer
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1" style={{ maxHeight: `${CARD_CONTENT_HEIGHT - 32}px` }}>
        {carData.events.map(event => (
          <div 
            key={event.ID} 
            className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            onClick={() => navigate(`/details/${event.ID}`)}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                {format(parseISO(event.date), 'MMM dd, yyyy')}
              </div>
              <div className="text-sm font-medium">
                {formatOdometer(event.odometer_after)}
              </div>
            </div>
            <div className="flex justify-between items-center mt-1 text-sm">
              <span>{parseFloat(event.liters).toFixed(2)} L</span>
              <span 
                className={`flex items-center ${
                  parseFloat(event.fuel_rate) < 1.9 ? parseFloat(event.fuel_rate) < 1.8 ? 'text-red-500' : 'text-orange-500' : 'text-green-500'
                }`}
              >
                <Gauge className="w-4 h-4 mr-1 flex-shrink-0" />
                {parseFloat(event.fuel_rate).toFixed(1)} km/L
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Date filter modal
  const DateFilterModal = () => (
    <div className="absolute z-10 bg-white shadow-lg rounded-lg p-4 mt-2 right-0 w-64 border border-gray-200">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
        <input 
          type="date" 
          value={dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => setDateRange(prev => ({
            ...prev, 
            startDate: e.target.value ? new Date(e.target.value) : null
          }))}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
        <input 
          type="date" 
          value={dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => setDateRange(prev => ({
            ...prev, 
            endDate: e.target.value ? new Date(e.target.value) : null
          }))}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex justify-between">
        <button 
          onClick={resetDateFilter}
          className="text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
        >
          Clear
        </button>
        <button 
          onClick={() => setShowFilters(false)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
  
  // Main render
  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4 relative">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Fuel Events</h1>
            {user && (
              <span className="ml-4 text-sm text-gray-600 hidden sm:inline-block">
                Welcome, {user.name || localStorage.getItem('user_name') || 'User'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md transition-colors ${showFilters ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Filter"
              title="Filter by date"
            >
              <Filter size={20} />
            </button>
            <button 
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => navigate('/add-fuel')}
              aria-label="Add new fuel event"
              title="Add new fuel event"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </div>
        
        {/* Date Filter Modal */}
        {showFilters && <DateFilterModal />}
        
        {/* Active Filters Display */}
        {(dateRange.startDate || dateRange.endDate) && (
          <div className="mb-4 flex items-center space-x-2 bg-blue-50 p-2 rounded-md">
            <span className="text-sm text-blue-700">
              Filtered from: 
              {dateRange.startDate ? ` ${format(dateRange.startDate, 'MMM dd, yyyy')}` : ' (any)'}
              {' to '}
              {dateRange.endDate ? format(dateRange.endDate, 'MMM dd, yyyy') : '(any)'}
            </span>
            <button 
              onClick={resetDateFilter}
              className="text-red-500 hover:bg-red-100 px-2 py-1 rounded-md text-sm transition-colors"
            >
              Clear
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
            <button 
              onClick={() => fetchEvents()}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : sortedCarPlates.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCarPlates.map(carPlate => 
              renderEventCard(carPlate, processedEvents[carPlate])
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default FuelEventsList;