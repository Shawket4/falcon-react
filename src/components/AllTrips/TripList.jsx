// File: components/trips/TripList.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';

import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ActiveFilters from './ActiveFilters';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import TripTable from './TripTable';
import MobileTripList from './MobileTripList';
import Pagination from './Pagination';
import ListActions from './ListActions';
import NoResultsAlert from './NoResultsAlert';

const TripList = () => {
  // State declarations
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
    startDate: '',
    endDate: ''
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

  useEffect(() => {
    fetchCompanies();
    fetchTrips();
  }, [currentPage, filters, searchTerm]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get(`/api/mappings/companies`);
      setCompanies(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchTrips = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let url = `/api/trips`;
      let params = {
        page: currentPage
      };
      
      // Add search term to params if provided
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Apply filters if set
      if (filters.company) {
        url = `/api/trips/company/${filters.company}`;
        params.page = currentPage;
        
        if (searchTerm) {
          params.search = searchTerm;
        }
      }
      
      if (filters.startDate && filters.endDate) {
        url = `/api/trips/date`;
        params = {
          ...params,
          page: currentPage,
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
      setTotalPages(response.data.meta?.pages || 1);
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
      let params = { limit: 1000 }; // Request a large number to get all trips
      
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
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

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-3 sm:px-4 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">Trip Management</h2>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded" role="alert">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Global Search Bar */}
          <SearchBar
            searchTerm={searchTerm}
            isSearching={isSearching}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            onKeyPress={handleSearchKeyPress}
            onClear={() => setSearchTerm('')}
          />
          
          {/* Filter panel */}
          <FilterPanel
            companies={companies}
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
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
          
          {/* Desktop Trip list */}
          <div className="hidden lg:block">
            <TripTable
              isLoading={isLoading}
              trips={sortedTrips}
              sortConfig={sortConfig}
              onSort={requestSort}
              onDelete={openDeleteModal}
            />
          </div>
          
          {/* Mobile Trip List */}
          <div className="block lg:hidden">
            <MobileTripList
              isLoading={isLoading}
              trips={sortedTrips}
              visibleDetailId={showMobileDetails}
              onToggleDetails={toggleMobileDetails}
              onDelete={openDeleteModal}
            />
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TripList;