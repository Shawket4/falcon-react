import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useFuelEventsState } from './FuelEventStates';
import { parseISO, normalizeText } from './DateUtils';
import ErrorBoundary from './ErrorBoundary';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import FuelEventCard from './FuelEventCard';
import DateFilterModal from './DateFilterModal';
import GlobalStatistics from './GlobalStatistics';
import ActiveFilters from './ActiveFilters';

const FuelEventsList = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localDateRange, setLocalDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  const { 
    events, 
    loading, 
    error, 
    fetchEvents, 
    activeFilter, 
    setActiveFilter 
  } = useFuelEventsState();
  
  // Fetch events on component mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch will use default date range (current month) from backend
      fetchEvents();
    }
    // Only run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Update local date range when active filter changes
  useEffect(() => {
    setLocalDateRange(activeFilter);
  }, [activeFilter]);

  // Apply date filter
  const applyDateFilter = useCallback((dateRange) => {
    // Send the new date range to fetch data from the backend
    fetchEvents(dateRange);
  }, [fetchEvents]);

  // Reset date range filter
  const resetDateFilter = useCallback(() => {
    const emptyDateRange = { startDate: null, endDate: null };
    // Fetch with null values to use backend defaults (current month)
    fetchEvents(emptyDateRange);
  }, [fetchEvents]);

  // Apply current month filter
  const applyCurrentMonthFilter = useCallback(() => {
    const now = new Date();
    // First day of current month at start of day
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    
    // Last day of current month at end of day
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    const currentMonthRange = {
      startDate: firstDay,
      endDate: lastDay
    };
    
    // No need to set local date range here, it will be updated by the fetchEvents call
    fetchEvents(currentMonthRange);
  }, [fetchEvents]);

  // Memoized filtering for client-side search
  const filteredEvents = useMemo(() => {
    // Normalize search term
    const normalizedSearch = normalizeText(searchTerm);
    
    // If no search term, return all events
    if (!normalizedSearch) return events;
    
    // Filter events based on search
    return events.filter(event => {
      // Normalize event details for searching
      const normalizedPlate = normalizeText(event.car_no_plate);
      const normalizedDriver = normalizeText(event.driver_name);
      
      // Search filter
      return normalizedPlate.includes(normalizedSearch) ||
             normalizedDriver.includes(normalizedSearch);
    });
  }, [events, searchTerm]);

  // Group events by car plate
  const processedEvents = useMemo(() => {
    // Group by car plate and calculate stats
    const groupedEvents = filteredEvents.reduce((acc, event) => {
      const carPlate = event.car_no_plate;
      if (!acc[carPlate]) {
        acc[carPlate] = {
          events: [],
          totalLiters: 0,
          totalCost: 0,
          totalDistance: 0,
          validLitersForAvg: 0,
          validDistanceForAvg: 0,
          avgFuelRate: 0,
          lastUpdated: null
        };
      }
      
      acc[carPlate].events.push(event);
      
      const liters = parseFloat(event.liters) || 0;
      const fuelRate = parseFloat(event.fuel_rate) || 0;
      const price = parseFloat(event.price) || 0;
      
      // Include all events in these totals
      acc[carPlate].totalLiters += liters;
      acc[carPlate].totalCost += price;
      
      // Calculate distance from fuel rate and liters
      const distance = liters * fuelRate;
      acc[carPlate].totalDistance += distance;
      
      // But only include valid fuel rates in the average calculation
      if (fuelRate >= 1.0 && fuelRate <= 2.7) {
        acc[carPlate].validLitersForAvg += liters;
        acc[carPlate].validDistanceForAvg += distance;
      }
      
      // Track the most recent event date for sorting
      const eventDate = parseISO(event.date);
      if (eventDate && (!acc[carPlate].lastUpdated || eventDate > acc[carPlate].lastUpdated)) {
        acc[carPlate].lastUpdated = eventDate;
      }
      
      return acc;
    }, {});
    
    // Calculate average fuel rate for each car using only valid events and sort events
    Object.keys(groupedEvents).forEach(carPlate => {
      const carData = groupedEvents[carPlate];
      
      // Avoid division by zero - Calculate avg using only valid fuel rates
      if (carData.validLitersForAvg > 0) {
        carData.avgFuelRate = carData.validDistanceForAvg / carData.validLitersForAvg;
      } else {
        carData.avgFuelRate = 0;
      }
      
      // Sort events within each car by date (newest first), then by odometer (highest first)
      carData.events.sort((a, b) => {
        // Primary sort by date
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        
        // Sort by date
        if (dateA && dateB && dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA; // Newest first
        }
        
        // If dates are the same, sort by odometer as secondary sort
        const odometerA = parseFloat(a.odometer_after) || 0;
        const odometerB = parseFloat(b.odometer_after) || 0;
        
        return odometerB - odometerA; // Highest first
      });
    });
    
    return groupedEvents;
  }, [filteredEvents]);

  // Get sorted car plates based on most recent event date
  const sortedCarPlates = useMemo(() => {
    const plates = Object.keys(processedEvents);
    
    // Sort car plates by the most recent event date
    return plates.sort((a, b) => {
      const lastDateA = processedEvents[a].lastUpdated;
      const lastDateB = processedEvents[b].lastUpdated;
      
      // Handle null dates
      if (!lastDateA && !lastDateB) return 0;
      if (!lastDateA) return 1;
      if (!lastDateB) return -1;
      
      return lastDateB - lastDateA; // Most recent first
    });
  }, [processedEvents]);

  // Calculate global stats for all filtered events
  const globalStats = useMemo(() => {
    let totalLiters = 0;
    let totalCost = 0;
    let totalValidLiters = 0;
    let totalValidDistance = 0;
    let totalEvents = 0;
    
    // Date range determination
    let startDate, endDate;
    
    // If we have an active date filter (custom date filter), use those dates
    if (activeFilter.startDate || activeFilter.endDate) {
      startDate = activeFilter.startDate;
      endDate = activeFilter.endDate;
    } 
    // For default and search views, use start of month to today
    else {
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth(), 1); // First day of current month
      endDate = today; // Today
    }
    
    // Gather all other statistics
    sortedCarPlates.forEach(plate => {
      const carData = processedEvents[plate];
      totalLiters += carData.totalLiters;
      totalCost += carData.totalCost;
      totalValidLiters += carData.validLitersForAvg;
      totalValidDistance += carData.validDistanceForAvg;
      totalEvents += carData.events.length;
    });
    
    const avgFuelRate = totalValidLiters > 0 ? 
      totalValidDistance / totalValidLiters : 0;
    
    // Calculate day-based statistics
    let avgCostPerDay = 0;
    let avgLitersPerDay = 0;
    let totalDays = 0;
    
    if (startDate && endDate) {
      // Normalize dates to remove time component
      const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      // Calculate difference in days and add 1 to include both start and end dates
      totalDays = Math.round((normalizedEndDate - normalizedStartDate) / (1000 * 60 * 60 * 24)) + 1;
      
      // Ensure we always have at least 1 day
      totalDays = Math.max(1, totalDays);
      
      avgCostPerDay = totalCost / totalDays;
      avgLitersPerDay = totalLiters / totalDays;
    }
    
    return {
      totalEvents,
      totalLiters,
      totalCost,
      avgFuelRate,
      avgCostPerDay,
      avgLitersPerDay,
      totalDays,
      earliestDate: startDate,
      latestDate: endDate
    };
  }, [sortedCarPlates, processedEvents]);

  // Check if custom filter is active (not the default current month)
  const isCustomFilter = useMemo(() => {
    return localDateRange.startDate !== null || localDateRange.endDate !== null;
  }, [localDateRange]);

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">Fuel Events</h1>
            {user && (
              <span className="ml-4 text-sm text-gray-600 hidden sm:inline-block">
                Welcome, {user.name || localStorage.getItem('user_name') || 'User'}
              </span>
            )}
          </div>
          
          {/* Search and Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Search by plate or driver..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters || isCustomFilter
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Filter"
              title="Filter by date"
            >
              <Filter size={20} />
            </button>
            <button 
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 shadow-sm transition-all duration-200"
              onClick={() => navigate('/add-fuel')}
              aria-label="Add new fuel event"
              title="Add new fuel event"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </div>
        
        {/* Date Filter Modal */}
        {showFilters && (
          <DateFilterModal 
            dateRange={localDateRange} 
            setDateRange={setLocalDateRange}
            applyDateFilter={applyDateFilter}
            resetDateFilter={resetDateFilter} 
            applyCurrentMonthFilter={applyCurrentMonthFilter}
            setShowFilters={setShowFilters}
          />
        )}
        
        {/* Active Filters Display */}
        {isCustomFilter && (
          <ActiveFilters 
            dateRange={localDateRange}
            resetDateFilter={resetDateFilter}
            applyCurrentMonthFilter={applyCurrentMonthFilter}
          />
        )}
        
        {/* Global Statistics */}
        {sortedCarPlates.length > 0 && (
          <GlobalStatistics stats={globalStats} />
        )}
        
        {/* Content Area */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} retry={fetchEvents} />
        ) : sortedCarPlates.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div className="flex flex-col gap-4 mt-6">
            {/* Mobile View (Single Column with Collapsible Cards) */}
            <div className="block md:hidden space-y-2">
              {sortedCarPlates.map(carPlate => (
                <FuelEventCard 
                  key={carPlate}
                  carPlate={carPlate}
                  carData={processedEvents[carPlate]}
                  navigate={navigate}
                  isMobile={true}
                />
              ))}
            </div>
            
            {/* Tablet and Desktop View (Original Card Style) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCarPlates.map(carPlate => (
                <FuelEventCard 
                  key={carPlate}
                  carPlate={carPlate}
                  carData={processedEvents[carPlate]}
                  navigate={navigate}
                  isMobile={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default FuelEventsList;