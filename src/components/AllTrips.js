import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../apiClient';
import * as XLSX from 'xlsx';

<style jsx>{`
  .table-container {
    overflow-x: auto;
    width: 100%;
  }
  table {
    min-width: 100%;
  }
`}</style>

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
  // Mobile view state
  const [showMobileDetails, setShowMobileDetails] = useState(null);
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchTrips();
  }, [currentPage, filters]);

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
      let url = `/api/trips?page=${currentPage}`;
      let params = {};
      
      // Apply filters if set
      if (filters.company) {
        url = `/api/trips/company/${filters.company}`;
        params.page = currentPage;
      }
      
      if (filters.startDate && filters.endDate) {
        // Fix: Use query parameters instead of path for date filtering to avoid the route conflict
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
      }
      
      const response = await apiClient.get(url, { params });
      setTrips(response.data.data || []);
      setTotalPages(response.data.meta?.pages || 1);
    } catch (err) {
      setError('Failed to fetch trips: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all trips for Excel export (without pagination)
  const fetchAllTrips = async () => {
    setIsExporting(true);
    try {
      let url = `/api/trips`;
      let params = { limit: 1000 }; // Request a large number to get all trips
      
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
    setCurrentPage(1);
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

  const exportToExcel = async () => {
    const trips = await fetchAllTrips();
    if (!trips.length) return;

    // Format data for Excel
    const worksheet = XLSX.utils.json_to_sheet(
      trips.map(trip => ({
        'Receipt No': trip.receipt_no || '',
        'Date': trip.date || '',
        'Company': trip.company || '',
        'Terminal': trip.terminal || '',
        'Drop-off Point': trip.drop_off_point || '',
        'Tank Capacity': trip.tank_capacity || '',
        'Driver': trip.driver_name || '',
        'Car': trip.car_no_plate || '',
        'Distance (km)': typeof trip.mileage === 'number' ? trip.mileage.toFixed(2) : trip.mileage || '',
        'Fee': typeof trip.fee === 'number' ? trip.fee : trip.fee || ''
      }))
    );

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Receipt No
      { wch: 12 }, // Date
      { wch: 20 }, // Company
      { wch: 20 }, // Terminal
      { wch: 20 }, // Drop-off Point
      { wch: 15 }, // Tank Capacity
      { wch: 20 }, // Driver
      { wch: 15 }, // Car
      { wch: 15 }, // Distance
      { wch: 12 }  // Fee
    ];
    
    worksheet['!cols'] = columnWidths;

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trips');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const fileName = `trips_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Create a temporary download link and trigger the download
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    // Main container - improved max width and padding for mobile/wide screens
    <div className="w-full overflow-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-auto overflow-hidden shadow-xl transform transition-all">
            <div className="p-4 sm:p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {/* Warning Icon */}
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Delete Trip</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Are you sure you want to delete this trip? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
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
          
          {/* Filter panel - improved mobile layout */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 overflow-hidden">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <select
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Actions - improved responsive layout */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 sticky top-0 bg-white z-10 pb-2">
            <div className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-0">
              {isLoading ? 'Loading trips...' : (
                trips.length > 0 ? `Showing ${trips.length} trips` : 'No trips found'
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={exportToExcel}
                disabled={isExporting}
                className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 flex-1 sm:flex-none"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </>
                )}
              </button>
              <Link
                to="/add-trip"
                className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 sm:flex-none"
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Trip
              </Link>
            </div>
          </div>
          {/* Desktop Trip list with horizontal scroll for small/mid screens */}
          <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm w-full">
  <table className="w-full min-w-[800px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-24"
                      onClick={() => requestSort('receipt_no')}
                    >
                      <div className="flex items-center">
                        Receipt No
                        {sortConfig.key === 'receipt_no' && (
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              sortConfig.direction === 'ascending' 
                                ? "M5 15l7-7 7 7" 
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-24"
                      onClick={() => requestSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === 'date' && (
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              sortConfig.direction === 'ascending' 
                                ? "M5 15l7-7 7 7" 
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32"
                      onClick={() => requestSort('company')}
                    >
                      <div className="flex items-center">
                        Company
                        {sortConfig.key === 'company' && (
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              sortConfig.direction === 'ascending' 
                                ? "M5 15l7-7 7 7" 
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32"
                      onClick={() => requestSort('terminal')}
                    >
                      <div className="flex items-center">
                        Terminal
                        {sortConfig.key === 'terminal' && (
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              sortConfig.direction === 'ascending' 
                                ? "M5 15l7-7 7 7" 
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32"
                      onClick={() => requestSort('drop_off_point')}
                    >
                      <div className="flex items-center">
                        Drop-off
                        {sortConfig.key === 'drop_off_point' && (
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              sortConfig.direction === 'ascending' 
                                ? "M5 15l7-7 7 7" 
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-24"
                      onClick={() => requestSort('tank_capacity')}
                    >
                      <div className="flex items-center">
                        Tank
                        {sortConfig.key === 'tank_capacity' && (
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              sortConfig.direction === 'ascending' 
                                ? "M5 15l7-7 7 7" 
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32"
                      onClick={() => requestSort('driver_name')}
                    >
                      <div className="flex items-center">
                        Driver
                        {sortConfig.key === 'driver_name' && (
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              sortConfig.direction === 'ascending' 
                                ? "M5 15l7-7 7 7" 
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-24"
                      onClick={() => requestSort('car_no_plate')}
                    >
                      <div className="flex items-center">
                        Car
                        {sortConfig.key === 'car_no_plate' && (
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              sortConfig.direction === 'ascending' 
                                ? "M5 15l7-7 7 7" 
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-24"
                      onClick={() => requestSort('mileage')}
                    >
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Distance
                        {sortConfig.key === 'mileage' && (
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              sortConfig.direction === 'ascending' 
                                ? "M5 15l7-7 7 7" 
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-24"
                      onClick={() => requestSort('fee')}
                    >
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Fee
                        {sortConfig.key === 'fee' && (
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              sortConfig.direction === 'ascending' 
                                ? "M5 15l7-7 7 7" 
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="relative px-3 py-3 text-right w-28">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading && !trips.length ? (
                    <tr>
                      <td colSpan="11" className="px-4 py-8 text-center text-sm text-gray-500">
                        <div className="flex justify-center">
                          <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Loading trips...</span>
                        </div>
                      </td>
                    </tr>
                  ) : trips.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-4 py-8 text-center text-sm text-gray-500">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
                          <p className="mt-1 text-sm text-gray-500">Get started by creating a new trip.</p>
                          <div className="mt-6">
                            <Link
                              to="/add-trip"
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              New Trip
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedTrips.map((trip) => (
                      <tr key={trip.ID} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 truncate">
                          {trip.receipt_no || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                          {trip.date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                          {trip.company}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                          {trip.terminal}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                          {trip.drop_off_point}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                          {trip.tank_capacity || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                          {trip.driver_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                          {trip.car_no_plate}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {typeof trip.mileage === 'number' ? 
                            `${trip.mileage.toFixed(2)} km` : 
                            trip.mileage}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {typeof trip.fee === 'number' ? 
                            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.fee) : 
                            trip.fee}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/trips/${trip.ID}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Link>
                            <button
                              onClick={() => openDeleteModal(trip.ID)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Mobile Trip List - Improved for better mobile display */}
          <div className="block lg:hidden">
            {isLoading && !trips.length ? (
              <div className="bg-white rounded-lg shadow overflow-hidden p-4 text-center">
                <div className="flex justify-center">
                  <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading trips...</span>
                </div>
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new trip.</p>
                <div className="mt-6">
                  <Link
                    to="/add-trip"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Trip
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTrips.map((trip) => (
                  <div key={trip.ID} className="bg-white rounded-md shadow overflow-hidden">
                    <div 
                      className="px-3 py-3 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleMobileDetails(trip.ID)}
                    >
                      <div className="w-4/5 overflow-hidden">
                        <div className="font-medium text-gray-900 truncate">
                          {trip.receipt_no ? `#${trip.receipt_no}` : 'No Receipt'} • {trip.date}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {trip.company} • {trip.terminal} → {trip.drop_off_point}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 mr-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                          {typeof trip.fee === 'number' ? 
                            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(trip.fee) : 
                            trip.fee}
                        </span>
                        <svg className="h-5 w-5 text-gray-400 transform transition-transform duration-200" 
                          style={{ transform: showMobileDetails === trip.ID ? 'rotate(180deg)' : 'rotate(0)' }}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {showMobileDetails === trip.ID && (
                      <div className="px-3 py-3 bg-gray-50 space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-medium text-gray-500">Company</div>
                            <div className="font-medium">{trip.company}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">Terminal</div>
                            <div>{trip.terminal}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">Drop-off Point</div>
                            <div>{trip.drop_off_point}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">Tank Capacity</div>
                            <div>{trip.tank_capacity || '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">Driver</div>
                            <div>{trip.driver_name}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">Car</div>
                            <div>{trip.car_no_plate}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">Distance</div>
                            <div className="font-medium">
                              {typeof trip.mileage === 'number' ? `${trip.mileage.toFixed(2)} km` : trip.mileage || '—'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">Fee</div>
                            <div className="font-medium">
                              {typeof trip.fee === 'number' ? 
                                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.fee) : 
                                trip.fee || '—'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between pt-2 border-t border-gray-200 space-x-2">
                          <Link
                            to={`/trips/${trip.ID}`}
                            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => openDeleteModal(trip.ID)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Pagination - Improved for mobile */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 sm:mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show pages around current page when there are many pages
                  let pageNum;
                  if (totalPages <= 5) {
                    // Show all pages if total pages <= 5
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // At the beginning, show first 5 pages
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // At the end, show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // In the middle, show current page and 2 pages on each side
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
  );
};

export default TripList;