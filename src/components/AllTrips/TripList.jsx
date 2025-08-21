import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';

// Import existing trip components
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ActiveFilters from './ActiveFilters';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import TripTable from './TripTable';
import MobileTripList from './MobileTripList';
import Pagination from './Pagination';
import ListActions from './ListActions';
import NoResultsAlert from './NoResultsAlert';
import ResponsiveTripStatistics from './TripStatsController';

// Import LocationDialog
import LocationDialog from '../LocationDialog'; // Adjust path as needed

// Import icons
import { List, BarChart3 } from 'lucide-react';

const TripList = () => {
  // Function to get the first day of current month
  const getFirstDayOfMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (0 = January, 1 = February, etc.)
    const firstDay = new Date(year, month, 1);
    const result = firstDay.toLocaleDateString('en-CA');
    console.log('getFirstDayOfMonth:', { now: now.toISOString(), year, month, firstDay: firstDay.toISOString(), result });
    return result;
  };

  // Function to get today's date
  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [meta, setMeta] = useState({
  page: 1,
  pages: 1,
  total: 0,
  limit: 10,
  company: '',
  start_date: '',
  end_date: '',
  search: ''
});

  // State for tab management
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'statistics'

  // State declarations for trip list
  const [trips, setTrips] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [filters, setFilters] = useState({
    company: '',
    startDate: getFirstDayOfMonth(), // Default to first day of current month
    endDate: getToday() // Default to today
  });
  // Global search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  // Mobile view state
  const [showMobileDetails, setShowMobileDetails] = useState(null);
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Location dialog state
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationData, setLocationData] = useState({
    dropOffLocation: null,
    terminalLocation: null,
    routeData: null
  });
  const [selectedTripDetails, setSelectedTripDetails] = useState({});
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchCompanies();
    
    // Only fetch trips when on the list tab
    if (activeTab === 'list') {
      fetchTrips();
    }
  }, [currentPage, filters, searchTerm, activeTab]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get(`/api/mappings/companies`);
      setCompanies(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchTrips = async (pageNumber = currentPage, pageLimit = meta.limit) => {
  setIsLoading(true);
  setError('');
  
  try {
    let url = `/api/trips`;
    let params = {
      page: pageNumber,
      limit: pageLimit
    };
    
    // Add search term to params if provided
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    // Apply filters if set
    if (filters.company) {
      url = `/api/trips/company/${filters.company}`;
      params.page = pageNumber;
      params.limit = pageLimit;
      
      if (searchTerm) {
        params.search = searchTerm;
      }
    }
    
    if (filters.startDate && filters.endDate) {
      url = `/api/trips/date`;
      params = {
        ...params,
        page: pageNumber,
        limit: pageLimit,
        start_date: filters.startDate,
        end_date: filters.endDate
      };
      
      if (filters.company) {
        params.company = filters.company;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
    }
    
    const response = await apiClient.get(url, { params });
    setTrips(response.data.data || []);
    
    // Update meta information
    if (response.data.meta) {
      setMeta(response.data.meta);
      setTotalPages(response.data.meta.pages || 1);
    }
  } catch (err) {
    setError('Failed to fetch trips: ' + (err.response?.data?.message || err.message));
    console.error(err);
  } finally {
    setIsLoading(false);
    setIsSearching(false);
  }
};


  // Fetch all trips for Excel export (without pagination)
  const fetchAllTrips = async () => {
    setIsExporting(true);
    try {
      let url = `/api/trips`;
      let params = { limit: 10000 }; // Request a large number to get all trips
      
      // Add search term to params if provided
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Apply filters if set
      if (filters.company) {
        url = `/api/trips/company/${filters.company}`;
      }
      
      if (filters.startDate && filters.endDate) {
        url = `/api/trips/date`;
        params = {
          ...params,
          start_date: filters.startDate,
          end_date: filters.endDate
        };
        
        if (filters.company) {
          params.company = filters.company;
        }
      }
      
      const response = await apiClient.get(url, { params });
      return response.data.data || [];
    } catch (err) {
      setError('Failed to export trips: ' + (err.response?.data?.message || err.message));
      console.error(err);
      return [];
    } finally {
      setIsExporting(false);
    }
  };

  const handleLimitChange = (newLimit) => {
  setMeta(prev => ({ ...prev, limit: newLimit }));
  setCurrentPage(1); // Reset to first page when changing limit
  fetchTrips(1, newLimit);
};

  // Handle showing trip details
  const handleShowDetails = async (tripId) => {
    setIsLoadingDetails(true);
    try {
      // Call the API to get trip details with locations
      const response = await apiClient.get(`/api/trips/${tripId}/details`);
      
      // Check if we have location data
      if (response.data && 
          response.data.drop_off_point_location && 
          response.data.terminal_location &&
          response.data.drop_off_point_location.lat && 
          response.data.drop_off_point_location.lng &&
          response.data.terminal_location.lat && 
          response.data.terminal_location.lng) {
        
        setLocationData({
          dropOffLocation: response.data.drop_off_point_location,
          terminalLocation: response.data.terminal_location,
          routeData: response.data.route_data || null
        });
        
        setSelectedTripDetails({
          company: response.data.data.company,
          terminal: response.data.data.terminal,
          drop_off_point: response.data.data.drop_off_point,
          receipt_no: response.data.data.receipt_no,
          mileage: response.data.data.mileage || response.data.data.distance,
          revenue: response.data.data.revenue || response.data.data.fee,
          car_id: response.data.data.car_id,
          date: response.data.data.date,
          id: response.data.data.ID,
        });
        
        setShowLocationDialog(true);
      } else {
        // Show a message if no location data available
        setError('No location data available for this trip. The trip may not have valid terminal or drop-off coordinates.');
        setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      setError('Failed to fetch trip details: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    // Reset to completely empty values
    setFilters({
      company: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1); // Reset to first page when searching
    fetchTrips();
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (page) => {
  setCurrentPage(page);
  fetchTrips(page, meta.limit);
};
  
  // Toggle mobile details view
  const toggleMobileDetails = (id) => {
    setShowMobileDetails(showMobileDetails === id ? null : id);
  };
  
  // Delete modal handlers
  const openDeleteModal = (id) => {
    setTripToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => setTripToDelete(null), 200); // Clear after animation
  };

  const handleDelete = async () => {
    if (!tripToDelete) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/trips/${tripToDelete}`);
      fetchTrips();
      closeDeleteModal();
    } catch (err) {
      setError('Failed to delete trip: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Sorting function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Apply sorting to trips
  const sortedTrips = React.useMemo(() => {
    let sortableItems = [...trips];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle date values
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'ascending' 
            ? new Date(aValue) - new Date(bValue) 
            : new Date(bValue) - new Date(aValue);
        }
        
        // Handle string values (case insensitive)
        if (aValue && bValue) {
          aValue = aValue.toString().toLowerCase();
          bValue = bValue.toString().toLowerCase();
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        
        return 0;
      });
    }
    return sortableItems;
  }, [trips, sortConfig]);

  return (
    // Main container - improved max width and padding for mobile/wide screens
    <div className="w-full overflow-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          isDeleting={isDeleting}
          onClose={closeDeleteModal}
          onDelete={handleDelete}
        />
      )}

      {/* Location Dialog */}
      <LocationDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        dropOffLocation={locationData.dropOffLocation}
        terminalLocation={locationData.terminalLocation}
        isEdit={false} // This is for viewing, not editing
        tripDetails={selectedTripDetails}
        routeData={locationData.routeData}
      />

      {/* Loading overlay for trip details */}
      {isLoadingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading trip details...</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">Trip Management</h2>
            
            {/* Tab Switch Buttons */}
            <div className="flex bg-blue-700 rounded-md">
              <button
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'list' 
                    ? 'bg-white text-blue-700' 
                    : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setActiveTab('list')}
              >
                <List size={16} className="mr-1.5" />
                Trip List
              </button>
              <button
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'statistics' 
                    ? 'bg-white text-blue-700' 
                    : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setActiveTab('statistics')}
              >
                <BarChart3 size={16} className="mr-1.5" />
                Statistics
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded" role="alert">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Shared filter panel for both tabs */}
          <FilterPanel
            companies={companies}
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Display content based on active tab */}
          {activeTab === 'list' ? (
            // Trip List Tab Content
            <>
              {/* Global Search Bar - only visible in list view */}
              <SearchBar
                searchTerm={searchTerm}
                isSearching={isSearching}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                onKeyPress={handleSearchKeyPress}
                onClear={() => setSearchTerm('')}
              />
              
              {/* Active filters/search tags */}
              {(searchTerm || filters.company || filters.startDate || filters.endDate) && (
                <ActiveFilters
                  searchTerm={searchTerm}
                  filters={filters}
                  onClearSearch={() => setSearchTerm('')}
                  onClearCompany={() => setFilters({...filters, company: ''})}
                  onClearDates={() => setFilters({...filters, startDate: '', endDate: ''})}
                />
              )}
              
              {/* Actions */}
              <ListActions
                isLoading={isLoading}
                isExporting={isExporting}
                tripsCount={trips.length}
                onExport={fetchAllTrips}
              />
              
              {/* Search and filter results indicator */}
              {(searchTerm || filters.company || filters.startDate || filters.endDate) && trips.length === 0 && !isLoading && (
                <NoResultsAlert />
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-center p-8">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Desktop Trip list */}
              {!isLoading && (
                <div className="hidden lg:block">
                  <TripTable
                    isLoading={isLoading}
                    trips={sortedTrips}
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    onDelete={openDeleteModal}
                    onShowDetails={handleShowDetails}
                  />
                </div>
              )}
              
              {/* Mobile Trip List */}
              {!isLoading && (
                <div className="block lg:hidden">
                  <MobileTripList
                    isLoading={isLoading}
                    trips={sortedTrips}
                    visibleDetailId={showMobileDetails}
                    onToggleDetails={toggleMobileDetails}
                    onDelete={openDeleteModal}
                    onShowDetails={handleShowDetails}
                  />
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    total={meta.total}
    limit={meta.limit}
    onPageChange={handlePageChange}
    onLimitChange={handleLimitChange}
    isLoading={isLoading}
  />
)}
            </>
          ) : (
            // Statistics Tab Content
            <ResponsiveTripStatistics filters={filters} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TripList;