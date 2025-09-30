import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';

// Import existing trip components
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ActiveFilters from './ActiveFilters';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ParentTripDeleteModal from './ParentTripDeleteModal';
import TripTable from './TripTable';
import MobileTripList from './MobileTripList';
import Pagination from './Pagination';
import ListActions from './ListActions';
import NoResultsAlert from './NoResultsAlert';
import ResponsiveTripStatistics from './TripStatsController';

// Import LocationDialog
import LocationDialog from '../LocationDialog';

// Import icons
import { List, BarChart3 } from 'lucide-react';

const TripList = () => {
  // Function to get the first day of current month
  const getFirstDayOfMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const result = firstDay.toLocaleDateString('en-CA');
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
  const [activeTab, setActiveTab] = useState('list');

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
    startDate: getFirstDayOfMonth(),
    endDate: getToday(),
    missingData: ''
  });
  
  // Global search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Mobile view state
  const [showMobileDetails, setShowMobileDetails] = useState(null);
  
  // Delete confirmation modal state for single trips
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete confirmation modal state for parent trips
  const [showDeleteParentModal, setShowDeleteParentModal] = useState(false);
  const [parentToDelete, setParentToDelete] = useState(null);
  const [parentContainerCount, setParentContainerCount] = useState(0);
  const [isDeletingParent, setIsDeletingParent] = useState(false);

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
    
    if (activeTab === 'list') {
      fetchTrips();
    }
  }, [currentPage, filters.company, filters.startDate, filters.endDate, searchTerm, activeTab]);

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
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
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

  const fetchAllTrips = async () => {
    setIsExporting(true);
    try {
      let url = `/api/trips`;
      let params = { limit: 10000 };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
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
    setCurrentPage(1);
    fetchTrips(1, newLimit);
  };

  const handleShowDetails = async (tripId) => {
    setIsLoadingDetails(true);
    try {
      const response = await apiClient.get(`/api/trips/${tripId}/details`);
      
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
        setError('No location data available for this trip. The trip may not have valid terminal or drop-off coordinates.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      setError('Failed to fetch trip details: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      company: '',
      startDate: '',
      endDate: '',
      missingData: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleClearMissingData = () => {
    setFilters(prev => ({ ...prev, missingData: '' }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
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
  
  const toggleMobileDetails = (id) => {
    setShowMobileDetails(showMobileDetails === id ? null : id);
  };
  
  // Single trip delete handlers
  const openDeleteModal = (id) => {
    setTripToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => setTripToDelete(null), 200);
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

  // Parent trip delete handlers
  const openDeleteParentModal = (parentId) => {
    // Find the container count
    const parentContainers = trips.filter(t => t.parent_trip_id === parentId);
    setParentToDelete(parentId);
    setParentContainerCount(parentContainers.length);
    setShowDeleteParentModal(true);
  };

  const closeDeleteParentModal = () => {
    setShowDeleteParentModal(false);
    setTimeout(() => {
      setParentToDelete(null);
      setParentContainerCount(0);
    }, 200);
  };

  const handleDeleteParent = async () => {
    if (!parentToDelete) return;
    
    setIsDeletingParent(true);
    try {
      await apiClient.delete(`/api/trips/parent/${parentToDelete}`);
      fetchTrips();
      closeDeleteParentModal();
    } catch (err) {
      setError('Failed to delete parent trip: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsDeletingParent(false);
    }
  };
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Client-side filtering for missing data
  const filteredTrips = React.useMemo(() => {
    let filtered = [...trips];
    
    // Filter by missing data
    if (filters.missingData === 'driver') {
      filtered = filtered.filter(trip => trip.driver_name === 'غير مسجل');
    } else if (filters.missingData === 'route') {
      filtered = filtered.filter(trip => trip.drop_off_point === 'غير مسجل');
    } else if (filters.missingData === 'any') {
      filtered = filtered.filter(trip => 
        trip.driver_name === 'غير مسجل' || trip.drop_off_point === 'غير مسجل'
      );
    }
    
    return filtered;
  }, [trips, filters.missingData]);

  const sortedTrips = React.useMemo(() => {
    let sortableItems = [...filteredTrips];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'ascending' 
            ? new Date(aValue) - new Date(bValue) 
            : new Date(bValue) - new Date(aValue);
        }
        
        if (aValue && bValue) {
          aValue = aValue.toString().toLowerCase();
          bValue = bValue.toString().toLowerCase();
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTrips, sortConfig]);

  return (
    <div className="w-full overflow-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4">
      {showDeleteModal && (
        <DeleteConfirmationModal
          isDeleting={isDeleting}
          onClose={closeDeleteModal}
          onDelete={handleDelete}
        />
      )}

      {showDeleteParentModal && (
        <ParentTripDeleteModal
          isDeleting={isDeletingParent}
          containerCount={parentContainerCount}
          onClose={closeDeleteParentModal}
          onDelete={handleDeleteParent}
        />
      )}

      <LocationDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        dropOffLocation={locationData.dropOffLocation}
        terminalLocation={locationData.terminalLocation}
        isEdit={false}
        tripDetails={selectedTripDetails}
        routeData={locationData.routeData}
      />

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
          
          <FilterPanel
            companies={companies}
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {activeTab === 'list' ? (
            <>
              <SearchBar
                searchTerm={searchTerm}
                isSearching={isSearching}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                onKeyPress={handleSearchKeyPress}
                onClear={() => setSearchTerm('')}
              />
              
              <ActiveFilters
                searchTerm={searchTerm}
                filters={filters}
                onClearSearch={() => setSearchTerm('')}
                onClearCompany={() => setFilters({...filters, company: ''})}
                onClearDates={() => setFilters({...filters, startDate: '', endDate: ''})}
                onClearMissingData={handleClearMissingData}
              />
              
              <ListActions
                isLoading={isLoading}
                isExporting={isExporting}
                tripsCount={filteredTrips.length}
                onExport={fetchAllTrips}
              />
              
              {(searchTerm || filters.company || filters.startDate || filters.endDate || 
                filters.missingData) && filteredTrips.length === 0 && !isLoading && (
                <NoResultsAlert />
              )}
              
              {isLoading && (
                <div className="flex justify-center p-8">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {!isLoading && (
                <div className="hidden lg:block">
                  <TripTable
                    isLoading={isLoading}
                    trips={sortedTrips}
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    onDelete={openDeleteModal}
                    onDeleteParent={openDeleteParentModal}
                    onShowDetails={handleShowDetails}
                  />
                </div>
              )}
              
              {!isLoading && (
                <div className="block lg:hidden">
                  <MobileTripList
                    isLoading={isLoading}
                    trips={sortedTrips}
                    visibleDetailId={showMobileDetails}
                    onToggleDetails={toggleMobileDetails}
                    onDelete={openDeleteModal}
                    onDeleteParent={openDeleteParentModal}
                    onShowDetails={handleShowDetails}
                  />
                </div>
              )}
              
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
            <ResponsiveTripStatistics filters={filters} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TripList;