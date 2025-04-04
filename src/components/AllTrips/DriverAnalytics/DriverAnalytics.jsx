import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import apiClient from '../../../apiClient';
import DriverList from './DriverList';
import DriverDetails from './DriverDetails';
import GlobalStats from './GlobalStats';
import DateRangePicker from './DateRangePicker';
import LoadingSpinner from './LoadingSpinner';

const DriverAnalytics = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Get initial date range from URL params or default to current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(
    queryParams.get('start_date') || firstDayOfMonth.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    queryParams.get('end_date') || today.toISOString().split('T')[0]
  );
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [driverData, setDriverData] = useState({
    drivers: [],
    global_stats: {
      avg_trips_per_driver: 0,
      avg_distance_per_driver: 0,
      avg_trips_per_day: 0,
      avg_km_per_day: 0,
      avg_volume_per_km: 0,
      total_trips: 0,
      total_distance: 0,
      total_volume: 0,
      top_drivers: []
    }
  });
  const [hasFinancialAccess, setHasFinancialAccess] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'total_trips', direction: 'desc' });
  
  // Fetch driver analytics data
  const fetchDriverAnalytics = async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response = await apiClient.get('/api/trips/watanya/driver-analytics', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      
      setDriverData(response.data.data);
      setHasFinancialAccess(response.data.hasFinancialAccess);
      
      // If we already have a selected driver, try to find and select the same driver in the new data
      if (selectedDriver && response.data.data.drivers.length > 0) {
        const updatedDriver = response.data.data.drivers.find(d => d.driver_name === selectedDriver.driver_name);
        setSelectedDriver(updatedDriver || response.data.data.drivers[0]);
      } else if (response.data.data.drivers.length > 0) {
        // Otherwise select the first driver
        setSelectedDriver(response.data.data.drivers[0]);
      } else {
        setSelectedDriver(null);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch driver analytics');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Sort drivers based on the current sort config
  const getSortedDrivers = () => {
    const sortableDrivers = [...driverData.drivers];
    if (sortConfig.key) {
      sortableDrivers.sort((a, b) => {
        // Special case for driver_name to handle Arabic names
        if (sortConfig.key === 'driver_name') {
          return sortConfig.direction === 'asc' 
            ? a.driver_name.localeCompare(b.driver_name, 'ar')
            : b.driver_name.localeCompare(a.driver_name, 'ar');
        }
        
        // For numeric values
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableDrivers;
  };
  
  // Handle sort requests
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };
  
  // Handle date range changes
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchDriverAnalytics(true);
  };
  
  // Fetch data when date range changes
  useEffect(() => {
    fetchDriverAnalytics();
    
    // Update URL with the current date range for better bookmarking/sharing
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('start_date', startDate);
    searchParams.set('end_date', endDate);
    
    const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    window.history.pushState(null, '', newRelativePathQuery);
  }, [startDate, endDate]);
  
  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span>Watanya Driver Analytics</span>
                {isRefreshing && (
                  <span className="ml-3">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Performance metrics for {driverData.drivers.length} drivers | {startDate} to {endDate}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Link 
                to="/trips"
                className="flex items-center text-blue-600 hover:text-blue-800 transition duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Trips</span>
              </Link>
              
              <button 
                onClick={handleRefresh} 
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors rounded-full hover:bg-gray-100"
                disabled={isRefreshing}
                title="Refresh data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <DateRangePicker 
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-6">
        {/* Permission warning if needed */}
        {!hasFinancialAccess && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Limited view: Financial data is hidden. Contact admin for access.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">Error Loading Data</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <LoadingSpinner message="Loading driver analytics..." />
        ) : (
          <>
            {/* Global statistics at the top */}
            <div className="mb-6">
              <GlobalStats 
                stats={driverData.global_stats}
                hasFinancialAccess={hasFinancialAccess}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left sidebar - Driver list */}
              <div className="lg:col-span-1">
                <DriverList 
                  drivers={getSortedDrivers()}
                  selectedDriver={selectedDriver}
                  onSelectDriver={setSelectedDriver}
                  onSort={requestSort}
                  sortConfig={sortConfig}
                  hasFinancialAccess={hasFinancialAccess}
                />
              </div>
              
              {/* Main content - Driver details */}
              <div className="lg:col-span-2">
                {selectedDriver ? (
                  <DriverDetails 
                    driver={selectedDriver}
                    globalStats={driverData.global_stats}
                    hasFinancialAccess={hasFinancialAccess}
                    dateRange={{ startDate, endDate }}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center h-64">
                    <svg className="h-16 w-16 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-gray-500">Select a driver to view detailed analytics</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DriverAnalytics;