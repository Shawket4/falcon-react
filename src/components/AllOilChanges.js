import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../apiClient';

const OilChangeList = ({ jwt }) => {
  const [oilChanges, setOilChanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'CarNoPlate',
    direction: 'ascending'
  });
  const [expandedView, setExpandedView] = useState({});
  
  // Delete Dialog State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Group by car plate function
  const groupByCarPlate = (data) => {
    const groups = {};
    data.forEach(item => {
      if (!groups[item.CarNoPlate]) {
        groups[item.CarNoPlate] = [];
      }
      groups[item.CarNoPlate].push(item);
    });
    return groups;
  };

  useEffect(() => {
    fetchOilChanges();
  }, []);

  const fetchOilChanges = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.get('/api/GetAllOilChanges');
      
      // Transform the data to match the expected structure
      const transformedData = response.data.map(event => ({
        ID: event.ID,
        CarNoPlate: event.car_no_plate,
        Supervisor: event.super_visor,
        DriverName: event.driver_name,
        Date: event.date,
        Mileage: parseFloat(event.mileage),
        OdometerAtChange: parseFloat(event.odometer_at_change),
        CurrentOdometer: parseFloat(event.current_odometer),
        Cost: parseFloat(event.cost),
        Difference: parseFloat(event.current_odometer) - parseFloat(event.odometer_at_change),
        MileageLeft: parseFloat(event.mileage) - (parseFloat(event.current_odometer) - parseFloat(event.odometer_at_change))
      }));
      
      setOilChanges(transformedData);
    } catch (err) {
      setError('Failed to fetch oil changes: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchOilChanges();
  };

  // Delete handlers
  const openDeleteModal = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => setItemToDelete(null), 200); // Clear after animation
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/DeleteOilChange/${itemToDelete}`);
      fetchOilChanges();
      closeDeleteModal();
    } catch (err) {
      setError('Failed to delete oil change');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpandRow = (id) => {
    setExpandedView(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Apply sorting to oil changes
  const sortedOilChanges = React.useMemo(() => {
    let sortableItems = [...oilChanges];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle date values
        if (sortConfig.key === 'Date') {
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
        
        return 0;
      });
    }
    return sortableItems;
  }, [oilChanges, sortConfig]);

  // Group sorted oil changes by car plate
  const groupedOilChanges = React.useMemo(() => {
    return groupByCarPlate(sortedOilChanges);
  }, [sortedOilChanges]);

  // Request sort function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Get mileage status color
  const getMileageStatusColor = (mileageLeft) => {
    if (mileageLeft <= 1500) return 'text-red-600';
    if (mileageLeft <= 3000) return 'text-orange-500';
    return 'text-green-600';
  };

  if (isLoading && !oilChanges.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !oilChanges.length) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-600 text-xl mb-4">
          <svg className="h-20 w-20 text-red-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-center mt-4">{error}</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden shadow-xl transform transition-all">
            <div className="p-6">
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
                  <h3 className="text-lg font-medium text-gray-900">Delete Oil Change Record</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Are you sure you want to delete this oil change record? This action cannot be undone.
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">Oil Change Management</h2>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded" role="alert">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="text-sm text-gray-500">
              {isLoading ? 'Loading oil changes...' : (
                oilChanges.length > 0 ? `Showing ${oilChanges.length} oil changes` : 'No oil changes found'
              )}
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="whitespace-nowrap">Refresh</span>
              </button>
              <Link
                to="/add-oil-change"
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="whitespace-nowrap">Add New Oil Change</span>
              </Link>
            </div>
          </div>
          
          {/* List of oil changes grouped by car */}
          <div className="space-y-3 sm:space-y-6">
            {Object.keys(groupedOilChanges).length === 0 ? (
              <div className="bg-white overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg py-6 sm:py-10">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No oil changes found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new oil change record.</p>
                  <div className="mt-6">
                    <Link
                      to="/add-oil-change"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Oil Change
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              Object.entries(groupedOilChanges).map(([carPlate, changes]) => (
                <div key={carPlate} className="bg-white overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <div className="bg-black text-white px-4 sm:px-6 py-3 sm:py-4">
                    <h3 className="text-base sm:text-lg font-semibold">{carPlate}</h3>
                  </div>

                  {/* Desktop view (md and up) - Regular table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th 
                            scope="col" 
                            className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('Date')}
                          >
                            <div className="flex items-center">
                              Date
                              {sortConfig.key === 'Date' && (
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
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('Supervisor')}
                          >
                            <div className="flex items-center">
                              Supervisor
                              {sortConfig.key === 'Supervisor' && (
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
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('DriverName')}
                          >
                            <div className="flex items-center">
                              Driver
                              {sortConfig.key === 'DriverName' && (
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
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('OdometerAtChange')}
                          >
                            <div className="flex items-center">
                              Odometer at Change
                              {sortConfig.key === 'OdometerAtChange' && (
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
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('CurrentOdometer')}
                          >
                            <div className="flex items-center">
                              Current Odometer
                              {sortConfig.key === 'CurrentOdometer' && (
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
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('Mileage')}
                          >
                            <div className="flex items-center">
                              Mileage
                              {sortConfig.key === 'Mileage' && (
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
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('MileageLeft')}
                          >
                            <div className="flex items-center">
                              Mileage Left
                              {sortConfig.key === 'MileageLeft' && (
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
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('Cost')}
                          >
                            <div className="flex items-center">
                              Cost
                              {sortConfig.key === 'Cost' && (
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
                          <th scope="col" className="relative px-3 py-3 text-right">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {changes.map((oilChange) => (
                          <tr key={oilChange.ID} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                              {oilChange.Date}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {oilChange.Supervisor}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {oilChange.DriverName}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {oilChange.OdometerAtChange.toLocaleString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {oilChange.CurrentOdometer.toLocaleString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {oilChange.Mileage.toLocaleString()}
                            </td>
                            <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${getMileageStatusColor(oilChange.MileageLeft)}`}>
                              {oilChange.MileageLeft.toLocaleString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                              ${oilChange.Cost.toFixed(2)}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  to={`/edit-oil-change/${oilChange.ID}`}
                                  className="text-blue-600 hover:text-blue-900 flex items-center"
                                >
                                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </Link>
                                <button
                                  onClick={() => openDeleteModal(oilChange.ID)}
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
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile & Tablet view (sm and below) - Card-based layout */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {changes.map((oilChange) => (
                      <div key={oilChange.ID} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium text-gray-900">{oilChange.Date}</div>
                            <div className="text-sm text-gray-600">{oilChange.Supervisor}</div>
                          </div>
                          <div className={`text-sm font-medium ${getMileageStatusColor(oilChange.MileageLeft)}`}>
                            {oilChange.MileageLeft.toLocaleString()} km left
                          </div>
                        </div>

                        <button 
                          className="flex items-center text-sm text-blue-600 mb-2"
                          onClick={() => toggleExpandRow(oilChange.ID)}
                        >
                          {expandedView[oilChange.ID] ? 'Hide details' : 'Show details'}
                          <svg 
                            className={`ml-1 h-4 w-4 transition-transform ${expandedView[oilChange.ID] ? 'transform rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            </button>
                            
                            {expandedView[oilChange.ID] && (
                              <div className="space-y-3 mt-3 pl-1 text-sm">
                                <div className="grid grid-cols-2 gap-1">
                                  <div className="text-gray-500">Driver:</div>
                                  <div>{oilChange.DriverName}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                  <div className="text-gray-500">Odometer at Change:</div>
                                  <div>{oilChange.OdometerAtChange.toLocaleString()}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                  <div className="text-gray-500">Current Odometer:</div>
                                  <div>{oilChange.CurrentOdometer.toLocaleString()}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                  <div className="text-gray-500">Mileage:</div>
                                  <div>{oilChange.Mileage.toLocaleString()}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                  <div className="text-gray-500">Cost:</div>
                                  <div>${oilChange.Cost.toFixed(2)}</div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex mt-3 pt-2 border-t border-gray-100">
                              <Link
                                to={`/edit-oil-change/${oilChange.ID}`}
                                className="flex-1 flex justify-center items-center py-2 text-sm text-blue-600"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Link>
                              <button
                                onClick={() => openDeleteModal(oilChange.ID)}
                                className="flex-1 flex justify-center items-center py-2 text-sm text-red-600"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                            </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OilChangeList;