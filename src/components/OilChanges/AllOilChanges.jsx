import React, { useState, useEffect, useMemo } from 'react';
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
  Clock,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Car,
  Wrench
} from 'lucide-react';

const OilChangeList = ({ jwt }) => {
  const [oilChanges, setOilChanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'Date',
    direction: 'descending'
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

  // Format short date
  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    fetchOilChanges();
  }, []);

  const fetchOilChanges = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.get('/api/GetAllOilChanges');
      
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
        LastUpdated: event.updated_at || event.UpdatedAt
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
    }, 200);
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

  // Get mileage status
  const getMileageStatus = (mileageLeft) => {
    if (mileageLeft <= 1500) return { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, label: 'Critical' };
    if (mileageLeft <= 3000) return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, label: 'Warning' };
    return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Check, label: 'Good' };
  };

  // Filter and search logic
  const filteredAndSortedOilChanges = useMemo(() => {
    let filtered = [...oilChanges];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(change =>
        change.CarNoPlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        change.Supervisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        change.DriverName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(change => {
        const status = getMileageStatus(change.MileageLeft);
        return status.label.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        if (sortConfig.key === 'Date' || sortConfig.key === 'LastUpdated') {
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
  }, [oilChanges, searchTerm, statusFilter, sortConfig]);

  // Group by car plate
  const groupedOilChanges = useMemo(() => {
    const groups = {};
    filteredAndSortedOilChanges.forEach(item => {
      if (!groups[item.CarNoPlate]) {
        groups[item.CarNoPlate] = [];
      }
      groups[item.CarNoPlate].push(item);
    });
    return groups;
  }, [filteredAndSortedOilChanges]);

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
    const critical = oilChanges.filter(c => c.MileageLeft <= 1500).length;
    const warning = oilChanges.filter(c => c.MileageLeft > 1500 && c.MileageLeft <= 3000).length;
    const good = oilChanges.filter(c => c.MileageLeft > 3000).length;
    const totalCost = oilChanges.reduce((sum, c) => sum + c.Cost, 0);
    const avgMileage = oilChanges.length > 0 
      ? oilChanges.reduce((sum, c) => sum + c.Mileage, 0) / oilChanges.length 
      : 0;
    
    return { critical, warning, good, totalCost, avgMileage };
  }, [oilChanges]);

  // Loading state
  if (isLoading && !oilChanges.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-6 text-lg">Loading oil changes...</p>
      </div>
    );
  }

  // Error state
  if (error && !oilChanges.length) {
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
        <th onClick={() => requestSort('Date')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Date
            {sortConfig.key === 'Date' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th onClick={() => requestSort('Supervisor')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Supervisor
            {sortConfig.key === 'Supervisor' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th onClick={() => requestSort('DriverName')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Driver
            {sortConfig.key === 'DriverName' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th onClick={() => requestSort('OdometerAtChange')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Changed At
            {sortConfig.key === 'OdometerAtChange' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th onClick={() => requestSort('CurrentOdometer')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Current
            {sortConfig.key === 'CurrentOdometer' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th onClick={() => requestSort('MileageLeft')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Remaining
            {sortConfig.key === 'MileageLeft' && (
              sortConfig.direction === 'ascending' ? 
                <ChevronUp size={14} className="ml-1 text-blue-600" /> : 
                <ChevronDown size={14} className="ml-1 text-blue-600" />
            )}
          </div>
        </th>
        <th onClick={() => requestSort('Cost')} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            Cost
            {sortConfig.key === 'Cost' && (
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
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {deleteSuccess ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Check size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
                <p className="text-gray-600">The oil change record has been deleted.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mr-4 shadow-lg">
                    <Trash2 size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
                </div>
                <p className="text-gray-600 mb-8">
                  Are you sure you want to delete this oil change record? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button 
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                  <Wrench className="mr-3" size={28} />
                  Oil Change Management
                </h1>
                <p className="text-blue-100 mt-1">Track and manage vehicle maintenance</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2.5 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center font-medium"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Refresh
                </button>
                <Link
                  to="/add-oil-change"
                  className="px-4 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center font-medium"
                >
                  <Plus size={18} className="mr-2" />
                  Add New
                </Link>
              </div>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50/50">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{oilChanges.length}</p>
                </div>
                <Car className="text-gray-400" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 uppercase tracking-wide">Good</p>
                  <p className="text-2xl font-bold text-emerald-700">{statistics.good}</p>
                </div>
                <Check className="text-emerald-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 uppercase tracking-wide">Warning</p>
                  <p className="text-2xl font-bold text-amber-700">{statistics.warning}</p>
                </div>
                <AlertTriangle className="text-amber-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 uppercase tracking-wide">Critical</p>
                  <p className="text-2xl font-bold text-red-700">{statistics.critical}</p>
                </div>
                <AlertCircle className="text-red-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by car plate, supervisor, or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  statusFilter === 'all' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({oilChanges.length})
              </button>
              <button
                onClick={() => setStatusFilter('good')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  statusFilter === 'good' 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Good ({statistics.good})
              </button>
              <button
                onClick={() => setStatusFilter('warning')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  statusFilter === 'warning' 
                    ? 'bg-amber-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Warning ({statistics.warning})
              </button>
              <button
                onClick={() => setStatusFilter('critical')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  statusFilter === 'critical' 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Critical ({statistics.critical})
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
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {Object.keys(groupedOilChanges).length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wrench size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No oil changes found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating a new oil change record to track maintenance for your vehicles.'}
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Link
                  to="/add-oil-change"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <Plus size={20} className="mr-2" />
                  Create First Record
                </Link>
              )}
            </div>
          ) : (
            Object.entries(groupedOilChanges).map(([carPlate, changes]) => {
              const latestChange = changes[0];
              const status = getMileageStatus(latestChange.MileageLeft);
              const StatusIcon = status.icon;
              
              return (
                <div key={carPlate} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <Car className="mr-3" size={20} />
                      <h3 className="text-lg font-semibold">{carPlate}</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center border ${status.color}`}>
                      <StatusIcon size={14} className="mr-1" />
                      {status.label}
                    </div>
                  </div>

                  {/* Desktop view */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <TableHeader 
                        requestSort={requestSort}
                        sortConfig={sortConfig}
                      />
                      <tbody className="divide-y divide-gray-100">
                        {changes.map((oilChange, index) => {
                          const changeStatus = getMileageStatus(oilChange.MileageLeft);
                          return (
                            <tr key={oilChange.ID} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="flex items-center">
                                  <Calendar size={14} className="mr-2 text-gray-400" />
                                  {formatShortDate(oilChange.Date)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{oilChange.Supervisor || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{oilChange.DriverName || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                                {oilChange.OdometerAtChange.toLocaleString()} km
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                                {oilChange.CurrentOdometer.toLocaleString()} km
                              </td>
                              <td className="px-6 py-4">
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium ${changeStatus.color}`}>
                                  {oilChange.MileageLeft.toLocaleString()} km
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                ${oilChange.Cost.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Link
                                    to={`/edit-oil-change/${oilChange.ID}`}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </Link>
                                  <button
                                    onClick={() => openDeleteModal(oilChange.ID)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile view */}
                  <div className="md:hidden">
                    {changes.map((oilChange) => {
                      const changeStatus = getMileageStatus(oilChange.MileageLeft);
                      const ChangeStatusIcon = changeStatus.icon;
                      
                      return (
                        <div key={oilChange.ID} className="border-b border-gray-100 last:border-0">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center text-gray-900 font-medium mb-1">
                                  <Calendar size={16} className="mr-2 text-gray-400" />
                                  {formatShortDate(oilChange.Date)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <User size={14} className="mr-2 text-gray-400" />
                                  {oilChange.Supervisor || 'No supervisor'}
                                </div>
                              </div>
                              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${changeStatus.color}`}>
                                <ChangeStatusIcon size={14} className="mr-1" />
                                {oilChange.MileageLeft.toLocaleString()} km
                              </div>
                            </div>

                            <button 
                              className="w-full text-left"
                              onClick={() => toggleExpandRow(oilChange.ID)}
                            >
                              <div className="flex items-center justify-between py-2 text-sm text-blue-600 font-medium">
                                <span>View details</span>
                                {expandedView[oilChange.ID] ? 
                                  <ChevronUp size={16} /> : 
                                  <ChevronDown size={16} />
                                }
                              </div>
                            </button>
                            
                            {expandedView[oilChange.ID] && (
                              <div className="mt-3 space-y-3 bg-gray-50 rounded-xl p-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500 mb-1">Driver</p>
                                    <p className="font-medium text-gray-900">{oilChange.DriverName || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 mb-1">Cost</p>
                                    <p className="font-semibold text-gray-900">${oilChange.Cost.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 mb-1">Changed at</p>
                                    <p className="font-medium text-gray-900">{oilChange.OdometerAtChange.toLocaleString()} km</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 mb-1">Current</p>
                                    <p className="font-medium text-gray-900">{oilChange.CurrentOdometer.toLocaleString()} km</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 mb-1">Service interval</p>
                                    <p className="font-medium text-gray-900">{oilChange.Mileage.toLocaleString()} km</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 mb-1">Distance covered</p>
                                    <p className="font-medium text-gray-900">{oilChange.Difference.toLocaleString()} km</p>
                                  </div>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Last updated</p>
                                  <p className="text-sm text-gray-700">{formatDate(oilChange.LastUpdated)}</p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                              <Link
                                to={`/edit-oil-change/${oilChange.ID}`}
                                className="flex-1 flex justify-center items-center py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                              >
                                <Edit size={16} className="mr-2" />
                                Edit
                              </Link>
                              <button
                                onClick={() => openDeleteModal(oilChange.ID)}
                                className="flex-1 flex justify-center items-center py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
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

export default OilChangeList;