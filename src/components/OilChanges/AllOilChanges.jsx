import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import { 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  User,
  DollarSign,
  Gauge,
  Clock
} from 'lucide-react';

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
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Format to dd/MM/yyyy & h:mm a
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

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
        MileageLeft: parseFloat(event.mileage) - (parseFloat(event.current_odometer) - parseFloat(event.odometer_at_change)),
        LastUpdated: event.updated_at || event.UpdatedAt // Handle both lowercase and uppercase versions
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
    setDeleteSuccess(false);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
      setItemToDelete(null);
      setDeleteSuccess(false);
    }, 200); // Clear after animation
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/DeleteOilChange/${itemToDelete}`);
      setDeleteSuccess(true);
      setTimeout(() => {
        closeDeleteModal();
        fetchOilChanges();
      }, 1500);
    } catch (err) {
      setError('Failed to delete oil change');
      console.error(err);
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
        if (sortConfig.key === 'Date' || sortConfig.key === 'LastUpdated') {
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

  // Loading state
  if (isLoading && !oilChanges.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-4">Loading oil changes...</p>
      </div>
    );
  }

  // Error state with no data
  if (error && !oilChanges.length) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <p className="text-red-700 font-medium mb-2 text-xl">Error Loading Oil Changes</p>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Table header component for reuse
  const TableHeader = ({ requestSort, sortConfig }) => (
    <thead className="bg-gray-50">
      <tr>
        <SortableHeader 
          label="Date" 
          field="Date" 
          sortConfig={sortConfig} 
          requestSort={requestSort}
        />
        <SortableHeader 
          label="Last Updated" 
          field="LastUpdated" 
          sortConfig={sortConfig} 
          requestSort={requestSort}
        />
        <SortableHeader 
          label="Supervisor" 
          field="Supervisor" 
          sortConfig={sortConfig} 
          requestSort={requestSort}
        />
        <SortableHeader 
          label="Driver" 
          field="DriverName" 
          sortConfig={sortConfig} 
          requestSort={requestSort}
        />
        <SortableHeader 
          label="Odometer at Change" 
          field="OdometerAtChange" 
          sortConfig={sortConfig} 
          requestSort={requestSort}
        />
        <SortableHeader 
          label="Current Odometer" 
          field="CurrentOdometer" 
          sortConfig={sortConfig} 
          requestSort={requestSort}
        />
        <SortableHeader 
          label="Mileage" 
          field="Mileage" 
          sortConfig={sortConfig} 
          requestSort={requestSort}
        />
        <SortableHeader 
          label="Mileage Left" 
          field="MileageLeft" 
          sortConfig={sortConfig} 
          requestSort={requestSort}
        />
        <SortableHeader 
          label="Cost" 
          field="Cost" 
          sortConfig={sortConfig} 
          requestSort={requestSort}
        />
        <th scope="col" className="relative px-3 py-3 text-right">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
  );

  // Sortable header component
  const SortableHeader = ({ label, field, sortConfig, requestSort }) => (
    <th 
      scope="col" 
      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
      onClick={() => requestSort(field)}
    >
      <div className="flex items-center">
        {label}
        {sortConfig.key === field && (
          <span className="ml-1">
            {sortConfig.direction === 'ascending' ? 
              <ChevronUp size={16} className="text-blue-500" /> : 
              <ChevronDown size={16} className="text-blue-500" />
            }
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            {deleteSuccess ? (
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Successfully Deleted</h3>
                <p className="text-gray-600 mb-2">The oil change record has been deleted.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-red-100 rounded-full mr-3">
                    <Trash2 size={24} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Delete Oil Change Record</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this oil change record? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                  >
                    <X size={18} className="mr-2" />
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-white border-white border-opacity-20 rounded-full animate-spin mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} className="mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Gauge className="mr-3 text-blue-500" size={24} />
              Oil Change Management
            </h1>
            
            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={18} className="mr-2" />
                <span>Refresh</span>
              </button>
              <Link
                to="/add-oil-change"
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={18} className="mr-2" />
                <span>Add New Oil Change</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Error alert */}
          {error && (
            <div className="flex items-start p-4 mb-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <AlertTriangle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {/* Stats summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500 mb-4">
            <div>
              {isLoading ? 'Loading oil changes...' : (
                oilChanges.length > 0 ? `Showing ${oilChanges.length} oil changes` : 'No oil changes found'
              )}
            </div>
          </div>
         
          {/* List of oil changes grouped by car */}
          <div className="space-y-6">
            {Object.keys(groupedOilChanges).length === 0 ? (
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gauge size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No oil changes found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Get started by creating a new oil change record to track maintenance for your vehicles.</p>
                <Link
                  to="/add-oil-change"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={18} className="mr-2" />
                  New Oil Change
                </Link>
              </div>
            ) : (
              Object.entries(groupedOilChanges).map(([carPlate, changes]) => (
                <div key={carPlate} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-800 text-white px-6 py-3">
                    <h3 className="text-lg font-medium">{carPlate}</h3>
                  </div>

                  {/* Desktop view (md and up) - Regular table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <TableHeader 
                        requestSort={requestSort}
                        sortConfig={sortConfig}
                      />
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {changes.map((oilChange) => (
                          <tr key={oilChange.ID} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                              {oilChange.Date}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatDate(oilChange.LastUpdated)}
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
                              <div className="flex justify-end space-x-3">
                                <Link
                                  to={`/edit-oil-change/${oilChange.ID}`}
                                  className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  <Edit size={16} className="mr-1" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => openDeleteModal(oilChange.ID)}
                                  className="text-red-600 hover:text-red-800 flex items-center"
                                >
                                  <Trash2 size={16} className="mr-1" />
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
                            <div className="font-medium text-gray-900 flex items-center">
                              <Calendar size={16} className="mr-2 text-gray-400" />
                              {oilChange.Date}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 flex items-center">
                              <User size={14} className="mr-2 text-gray-400" />
                              {oilChange.Supervisor || 'No supervisor'}
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${getMileageStatusColor(oilChange.MileageLeft)} px-2 py-1 rounded-full bg-gray-100`}>
                            {oilChange.MileageLeft.toLocaleString()} km left
                          </div>
                        </div>

                        <button 
                          className="flex items-center text-sm text-blue-600 mb-2"
                          onClick={() => toggleExpandRow(oilChange.ID)}
                        >
                          {expandedView[oilChange.ID] ? 'Hide details' : 'Show details'}
                          {expandedView[oilChange.ID] ? 
                            <ChevronUp size={16} className="ml-1" /> : 
                            <ChevronDown size={16} className="ml-1" />
                          }
                        </button>
                             
                        {expandedView[oilChange.ID] && (
                          <div className="space-y-3 mt-3 bg-gray-50 p-3 rounded-lg text-sm">
                            <div className="grid grid-cols-2 gap-1">
                              <div className="text-gray-500 flex items-center">
                                <Clock size={14} className="mr-1 text-gray-400" />
                                Last Updated:
                              </div>
                              <div>{formatDate(oilChange.LastUpdated)}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="text-gray-500 flex items-center">
                                <User size={14} className="mr-1 text-gray-400" />
                                Driver:
                              </div>
                              <div>{oilChange.DriverName}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="text-gray-500 flex items-center">
                                <Gauge size={14} className="mr-1 text-gray-400" />
                                Odometer at Change:
                              </div>
                              <div>{oilChange.OdometerAtChange.toLocaleString()}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="text-gray-500 flex items-center">
                                <Gauge size={14} className="mr-1 text-gray-400" />
                                Current Odometer:
                              </div>
                              <div>{oilChange.CurrentOdometer.toLocaleString()}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="text-gray-500 flex items-center">
                                <Gauge size={14} className="mr-1 text-gray-400" />
                                Mileage:
                              </div>
                              <div>{oilChange.Mileage.toLocaleString()}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="text-gray-500 flex items-center">
                                <DollarSign size={14} className="mr-1 text-gray-400" />
                                Cost:
                              </div>
                              <div>${oilChange.Cost.toFixed(2)}</div>
                            </div>
                          </div>
                        )}
                             
                        <div className="flex mt-3 pt-2 border-t border-gray-100">
                          <Link
                            to={`/edit-oil-change/${oilChange.ID}`}
                            className="flex-1 flex justify-center items-center py-2 text-sm text-blue-600"
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </Link>
                          <button
                            onClick={() => openDeleteModal(oilChange.ID)}
                            className="flex-1 flex justify-center items-center py-2 text-sm text-red-600"
                          >
                            <Trash2 size={16} className="mr-1" />
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