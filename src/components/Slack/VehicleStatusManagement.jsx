import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import { 
  RefreshCw, 
  Edit, 
  AlertTriangle, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  User,
  Clock,
  Search,
  AlertCircle,
  Car,
  MapPin,
  Activity,
  MessageSquare,
  Filter,
  X,
  Save,
  Loader
} from 'lucide-react';

const VehicleStatusManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'CarNoPlate',
    direction: 'ascending'
  });
  const [expandedView, setExpandedView] = useState({});
  const [validStatuses, setValidStatuses] = useState([]);
  
  // Edit Mode State - Remove updated_by field
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editForm, setEditForm] = useState({
    status: '',
    location: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  // Bulk Update State - Remove updated_by field
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    status: '',
    location: ''
  });
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetchVehicles();
    fetchValidStatuses();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.get('/api/GetCars');
      
      const transformedData = response.data.map(car => ({
        ID: car.ID,
        CarNoPlate: car.car_no_plate || car.CarNoPlate,
        OperatingArea: car.operating_area || car.OperatingArea,
        OperatingCompany: car.operating_company || car.OperatingCompany,
        SlackStatus: car.slack_status || car.SlackStatus || 'Unknown',
        Location: car.location || car.Location || '',
        GeoFence: car.geo_fence || car.GeoFence || '',
        Driver: typeof (car.driver || car.Driver) === 'object' 
          ? (car.driver?.name || car.Driver?.name || 'Unknown Driver')
          : (car.driver || car.Driver || 'Unknown Driver'),
        LastUpdated: car.last_updated_slack_status || car.LastUpdatedSlackStatus || car.updated_at || car.UpdatedAt,
        Latitude: car.latitude || car.Latitude || '',
        Longitude: car.longitude || car.Longitude || ''
      }));
      
      setVehicles(transformedData);
    } catch (err) {
      setError('Failed to fetch vehicles: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchValidStatuses = async () => {
    try {
      const response = await apiClient.get('/api/slack/statuses');
      setValidStatuses(response.data.statuses || []);
    } catch (err) {
      console.error('Failed to fetch valid statuses:', err);
      // Fallback statuses
      setValidStatuses([
        { value: 'In Terminal', label: 'In Terminal', emoji: '🏢', category: 'Automatic' },
        { value: 'In Drop-Off', label: 'In Drop-Off', emoji: '📦', category: 'Automatic' },
        { value: 'In Garage', label: 'In Garage', emoji: '🅿️', category: 'Automatic' },
        { value: 'Stopped for Maintenance', label: 'Stopped for Maintenance', emoji: '🔧', category: 'Manual' },
        { value: 'On Route to Terminal', label: 'On Route to Terminal', emoji: '🟡', category: 'Manual' },
        { value: 'On Route to Drop-Off', label: 'On Route to Drop-Off', emoji: '🔴', category: 'Manual' },
        { value: 'Driver Resting', label: 'Driver Resting', emoji: '💤', category: 'Manual' }
      ]);
    }
  };

  const handleRefresh = async () => {
    await fetchVehicles();
  };

  const toggleExpandRow = (id) => {
    setExpandedView(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get status details
  const getStatusDetails = (statusValue) => {
    const status = validStatuses.find(s => s.value === statusValue);
    if (status) return status;
    
    // Fallback for unknown statuses
    return { 
      value: statusValue, 
      label: statusValue, 
      emoji: '❓', 
      category: 'Unknown',
      color: 'bg-gray-100 text-gray-700 border-gray-200'
    };
  };

  // Start editing a vehicle - Remove updated_by initialization
  const startEdit = (vehicle) => {
    setEditingVehicle(vehicle.ID);
    setEditForm({
      status: vehicle.SlackStatus,
      location: vehicle.Location
    });
    setUpdateSuccess(null);
    setError('');
  };

  // Cancel editing - Remove updated_by field
  const cancelEdit = () => {
    setEditingVehicle(null);
    setEditForm({ status: '', location: '' });
    setUpdateSuccess(null);
    setError('');
  };

  // Update vehicle status - Remove updated_by validation
  const updateVehicleStatus = async (vehicleId) => {
    if (!editForm.status) {
      setError('Please select a status');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      const requestBody = {
        car_id: vehicleId,
        status: editForm.status
      };
      
      // Only include location if it's not empty
      if (editForm.location && editForm.location.trim()) {
        requestBody.location = editForm.location;
      }

      const response = await apiClient.post(`/api/slack/vehicles/status`, requestBody);

      if (response.data.success) {
        setUpdateSuccess(`Status updated successfully!`);
        setTimeout(() => {
          cancelEdit();
          fetchVehicles(); // Refresh data
        }, 1500);
      }
    } catch (err) {
      setError('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle vehicle selection for bulk update
  const toggleVehicleSelection = (vehicleId) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  // Select all vehicles
  const selectAllVehicles = (checked) => {
    if (checked) {
      setSelectedVehicles(filteredAndSortedVehicles.map(v => v.ID));
    } else {
      setSelectedVehicles([]);
    }
  };

  // Open bulk update modal - Remove updated_by initialization
  const openBulkUpdate = () => {
    if (selectedVehicles.length === 0) {
      setError('Please select at least one vehicle');
      return;
    }
    setShowBulkUpdate(true);
    setBulkForm({ status: '', location: '' });
    setError('');
    setUpdateSuccess(null);
  };

  // Close bulk update modal - Remove updated_by field
  const closeBulkUpdate = () => {
    setShowBulkUpdate(false);
    setBulkForm({ status: '', location: '' });
    setError('');
    setUpdateSuccess(null);
  };

  // Bulk update vehicles - Remove updated_by validation
  const bulkUpdateVehicles = async () => {
    if (selectedVehicles.length === 0) {
      setError('Please select at least one vehicle');
      return;
    }

    if (!bulkForm.status) {
      setError('Please select a status');
      return;
    }

    setIsBulkUpdating(true);
    setError('');

    try {
      const updates = selectedVehicles.map(vehicleId => {
        const update = {
          car_id: vehicleId,
          status: bulkForm.status
        };
        
        // Only include location if it's not empty
        if (bulkForm.location && bulkForm.location.trim()) {
          update.location = bulkForm.location;
        }
        
        return update;
      });

      const response = await apiClient.post('/api/slack/vehicles/status/bulk', {
        updates
      });

      if (response.data.success) {
        setUpdateSuccess(`${response.data.success_count} vehicles updated successfully!`);
        setTimeout(() => {
          closeBulkUpdate();
          setSelectedVehicles([]);
          fetchVehicles();
        }, 1500);
      } else {
        setError(`Partial success: ${response.data.success_count} updated, ${response.data.failed_count} failed`);
      }
    } catch (err) {
      setError('Bulk update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Filter and search logic
  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = [...vehicles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.CarNoPlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.OperatingArea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.OperatingCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.Driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.SlackStatus?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'manual') {
        const manualStatuses = validStatuses.filter(s => s.category === 'Manual').map(s => s.value);
        filtered = filtered.filter(vehicle => manualStatuses.includes(vehicle.SlackStatus));
      } else if (statusFilter === 'automatic') {
        const autoStatuses = validStatuses.filter(s => s.category === 'Automatic').map(s => s.value);
        filtered = filtered.filter(vehicle => autoStatuses.includes(vehicle.SlackStatus));
      } else {
        filtered = filtered.filter(vehicle => vehicle.SlackStatus === statusFilter);
      }
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        if (sortConfig.key === 'LastUpdated') {
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
        
        return 0;
      });
    }

    return filtered;
  }, [vehicles, searchTerm, statusFilter, sortConfig, validStatuses]);

  // Request sort function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const statusCounts = {};
    vehicles.forEach(vehicle => {
      const status = vehicle.SlackStatus || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return {
      total: vehicles.length,
      statusCounts,
      selected: selectedVehicles.length
    };
  }, [vehicles, selectedVehicles]);

  // Loading state
  if (isLoading && !vehicles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-6 text-lg">Loading vehicle status...</p>
      </div>
    );
  }

  // Error state
  if (error && !vehicles.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-red-500 mb-4 flex justify-center">
            <AlertCircle size={64} />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleRefresh}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <RefreshCw size={20} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Table header component
  const TableHeader = ({ requestSort, sortConfig }) => (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-4 text-left">
          <input 
            type="checkbox" 
            className="rounded border-gray-300"
            checked={selectedVehicles.length === filteredAndSortedVehicles.length && filteredAndSortedVehicles.length > 0}
            onChange={(e) => selectAllVehicles(e.target.checked)}
          />
        </th>
        <th onClick={() => requestSort('CarNoPlate')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Vehicle
            {sortConfig.key === 'CarNoPlate' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th onClick={() => requestSort('SlackStatus')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Status
            {sortConfig.key === 'SlackStatus' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th onClick={() => requestSort('OperatingCompany')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Company
            {sortConfig.key === 'OperatingCompany' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th onClick={() => requestSort('OperatingArea')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Area
            {sortConfig.key === 'OperatingArea' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th onClick={() => requestSort('LastUpdated')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Last Updated
            {sortConfig.key === 'LastUpdated' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Bulk Update Modal - Remove updated_by field */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {updateSuccess ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Check size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
                <p className="text-gray-600">{updateSuccess}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Bulk Update ({selectedVehicles.length} vehicles)
                  </h3>
                  <button 
                    onClick={closeBulkUpdate}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      value={bulkForm.status}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      <optgroup label="Manual Status Updates">
                        {validStatuses.filter(s => s.category === 'Manual').map(status => (
                          <option key={status.value} value={status.value}>
                            {status.emoji} {status.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Location-Based Status">
                        {validStatuses.filter(s => s.category === 'Automatic').map(status => (
                          <option key={status.value} value={status.value}>
                            {status.emoji} {status.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
                    <input
                      type="text"
                      value={bulkForm.location}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location details..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={closeBulkUpdate}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                    disabled={isBulkUpdating}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={bulkUpdateVehicles}
                    disabled={isBulkUpdating || !bulkForm.status}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBulkUpdating ? (
                      <>
                        <Loader className="animate-spin mr-2" size={18} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Update All
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                  <Activity className="mr-3" size={28} />
                  Vehicle Status Management
                </h1>
                <p className="text-blue-100 mt-1">Monitor and update fleet status in real-time</p>
              </div>
              
              <div className="flex gap-3">
                {selectedVehicles.length > 0 && (
                  <button
                    onClick={openBulkUpdate}
                    className="px-4 py-2.5 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center font-medium"
                  >
                    <Edit size={18} className="mr-2" />
                    Bulk Update ({selectedVehicles.length})
                  </button>
                )}
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2.5 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center font-medium"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50/50">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.total}</p>
                </div>
                <Car className="text-gray-400" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 uppercase tracking-wide">Selected</p>
                  <p className="text-2xl font-bold text-blue-800">{statistics.selected}</p>
                </div>
                <Check className="text-blue-500" size={24} />
              </div>
            </div>
            {Object.entries(statistics.statusCounts).slice(0, 2).map(([status, count]) => {
              const statusDetails = getStatusDetails(status);
              return (
                <div key={status} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide truncate">{status}</p>
                      <p className="text-2xl font-bold text-gray-800">{count}</p>
                    </div>
                    <span className="text-2xl">{statusDetails.emoji}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by vehicle, company, area, driver, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  statusFilter === 'all' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({statistics.total})
              </button>
              <button
                onClick={() => setStatusFilter('manual')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  statusFilter === 'manual' 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Manual Status
              </button>
              <button
                onClick={() => setStatusFilter('automatic')}className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  statusFilter === 'automatic' 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Auto Status
              </button>
            </div>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Success alert */}
        {updateSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start">
            <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-green-800">Success</p>
              <p className="text-sm text-green-700 mt-1">{updateSuccess}</p>
            </div>
            <button 
              onClick={() => setUpdateSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredAndSortedVehicles.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No vehicles found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No vehicles found in the system. Please check your vehicle database.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <TableHeader 
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                  />
                  <tbody className="divide-y divide-gray-100">
                    {filteredAndSortedVehicles.map((vehicle) => {
                      const statusDetails = getStatusDetails(vehicle.SlackStatus);
                      const isEditing = editingVehicle === vehicle.ID;
                      
                      return (
                        <tr key={vehicle.ID} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300"
                              checked={selectedVehicles.includes(vehicle.ID)}
                              onChange={() => toggleVehicleSelection(vehicle.ID)}
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Car size={14} className="mr-2 text-gray-400" />
                              <div>
                                <p className="font-semibold">{vehicle.CarNoPlate}</p>
                                <p className="text-xs text-gray-500">{vehicle.Driver}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Status</option>
                                <optgroup label="Manual Status">
                                  {validStatuses.filter(s => s.category === 'Manual').map(status => (
                                    <option key={status.value} value={status.value}>
                                      {status.emoji} {status.label}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Location-Based">
                                  {validStatuses.filter(s => s.category === 'Automatic').map(status => (
                                    <option key={status.value} value={status.value}>
                                      {status.emoji} {status.label}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            ) : (
                              <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium ${
                                statusDetails.category === 'Automatic' 
                                  ? 'bg-green-100 text-green-700 border-green-200' 
                                  : 'bg-blue-100 text-blue-700 border-blue-200'
                              }`}>
                                <span className="mr-1">{statusDetails.emoji}</span>
                                {statusDetails.label}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{vehicle.OperatingCompany}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{vehicle.OperatingArea}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock size={14} className="mr-2 text-gray-400" />
                              {formatDate(vehicle.LastUpdated)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isEditing ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={cancelEdit}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                                <button
                                  onClick={() => updateVehicleStatus(vehicle.ID)}
                                  disabled={isUpdating || !editForm.status}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Save"
                                >
                                  {isUpdating ? <Loader className="animate-spin" size={16} /> : <Check size={16} />}
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => startEdit(vehicle)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Status"
                                >
                                  <Edit size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile view */}
              <div className="md:hidden">
                {filteredAndSortedVehicles.map((vehicle) => {
                  const statusDetails = getStatusDetails(vehicle.SlackStatus);
                  const isEditing = editingVehicle === vehicle.ID;
                  
                  return (
                    <div key={vehicle.ID} className="border-b border-gray-100 last:border-0">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start gap-3">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 mt-1"
                              checked={selectedVehicles.includes(vehicle.ID)}
                              onChange={() => toggleVehicleSelection(vehicle.ID)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center text-gray-900 font-semibold mb-1">
                                <Car size={16} className="mr-2 text-gray-400" />
                                {vehicle.CarNoPlate}
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <User size={14} className="mr-2 text-gray-400" />
                                {vehicle.Driver}
                              </div>
                            </div>
                          </div>
                          
                          {!isEditing && (
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${
                              statusDetails.category === 'Automatic' 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                            }`}>
                              <span className="mr-1">{statusDetails.emoji}</span>
                              {statusDetails.label}
                            </div>
                          )}
                        </div>

                        {isEditing && (
                          <div className="mb-4 space-y-3 bg-gray-50 rounded-xl p-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Status *</label>
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Status</option>
                                <optgroup label="Manual Status">
                                  {validStatuses.filter(s => s.category === 'Manual').map(status => (
                                    <option key={status.value} value={status.value}>
                                      {status.emoji} {status.label}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Location-Based">
                                  {validStatuses.filter(s => s.category === 'Automatic').map(status => (
                                    <option key={status.value} value={status.value}>
                                      {status.emoji} {status.label}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Location (Optional)</label>
                              <input
                                type="text"
                                value={editForm.location}
                                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Enter location details..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        )}

                        <button 
                          className="w-full text-left"
                          onClick={() => toggleExpandRow(vehicle.ID)}
                        >
                          <div className="flex items-center justify-between py-2 text-sm text-blue-600 font-medium">
                            <span>View details</span>
                            {expandedView[vehicle.ID] ? 
                              <ChevronUp size={16} /> : 
                              <ChevronDown size={16} />
                            }
                          </div>
                        </button>
                        
                        {expandedView[vehicle.ID] && (
                          <div className="mt-3 space-y-3 bg-gray-50 rounded-xl p-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Company</p>
                                <p className="font-medium text-gray-900">{vehicle.OperatingCompany}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Area</p>
                                <p className="font-medium text-gray-900">{vehicle.OperatingArea}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-gray-500 mb-1">Location</p>
                                <p className="font-medium text-gray-900">{vehicle.Location || 'Not specified'}</p>
                              </div>
                              {vehicle.GeoFence && (
                                <div className="col-span-2">
                                  <p className="text-gray-500 mb-1">Geofence</p>
                                  <p className="font-medium text-gray-900 flex items-center">
                                    <MapPin size={14} className="mr-1" />
                                    {vehicle.GeoFence}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Last updated</p>
                              <p className="text-sm text-gray-700">{formatDate(vehicle.LastUpdated)}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                          {isEditing ? (
                            <>
                              <button
                                onClick={cancelEdit}
                                className="flex-1 flex justify-center items-center py-2.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                              >
                                <X size={16} className="mr-2" />
                                Cancel
                              </button>
                              <button
                                onClick={() => updateVehicleStatus(vehicle.ID)}
                                disabled={isUpdating || !editForm.status}
                                className="flex-1 flex justify-center items-center py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUpdating ? (
                                  <>
                                    <Loader className="animate-spin mr-2" size={16} />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Check size={16} className="mr-2" />
                                    Save
                                  </>
                                )}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEdit(vehicle)}
                              className="w-full flex justify-center items-center py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                            >
                              <Edit size={16} className="mr-2" />
                              Update Status
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Shawket Ibrahim. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default VehicleStatusManagement;