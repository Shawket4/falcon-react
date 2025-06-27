import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import SearchableDropdown from './SearchableDropdown';
import { 
  Car, 
  User, 
  Edit, 
  Save, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  ArrowLeft,
  Calendar,
  MapPin,
  Gauge,
  Shield,
  Search,
  ChevronDown,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronUp
} from 'lucide-react';

const CarManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit state
  const [editingCar, setEditingCar] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Search and mobile state
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Utility functions (defined before useMemo)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  const isExpired = (dateString) => {
    if (!dateString) return false;
    try {
      return new Date(dateString) < new Date();
    } catch (e) {
      return false;
    }
  };

  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30;
    } catch (e) {
      return false;
    }
  };

  const getDriverName = (car) => {
    if (!car.driver_id) return 'No driver assigned';
    const driver = drivers.find(d => d.ID === car.driver_id);
    return driver ? driver.name : 'Unknown driver';
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-clear success message
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
        setEditingCar(null);
        setSelectedDriver(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);
  
  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [carsResponse, driversResponse] = await Promise.allSettled([
        apiClient.get('/api/GetCars'),
        apiClient.get('/api/GetDrivers')
      ]);
      
      if (carsResponse.status === 'fulfilled') {
        setCars(carsResponse.value.data || []);
      } else {
        console.error('Failed to fetch cars:', carsResponse.reason);
        setError('Failed to load cars');
      }
      
      if (driversResponse.status === 'fulfilled') {
        setDrivers(driversResponse.value.data || []);
      } else {
        console.error('Failed to fetch drivers:', driversResponse.reason);
        setError('Failed to load drivers');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Memoized filtered cars
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const matchesSearch = car.car_no_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.car_type?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [cars, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const assigned = cars.filter(c => c.driver_id && c.driver_id > 0).length;
    const expired = cars.filter(c => 
      isExpired(c.license_expiration_date) || 
      isExpired(c.calibration_expiration_date) ||
      (c.car_type === 'Trailer' && isExpired(c.tank_license_expiration_date))
    ).length;
    const expiringSoon = cars.filter(c => 
      isExpiringSoon(c.license_expiration_date) || 
      isExpiringSoon(c.calibration_expiration_date) ||
      (c.car_type === 'Trailer' && isExpiringSoon(c.tank_license_expiration_date))
    ).length;

    return { assigned, expired, expiringSoon, total: cars.length };
  }, [cars]);
  
  // Start editing a car
  const startEdit = (car) => {
    setEditingCar(car);
    const currentDriver = drivers.find(d => d.ID === car.driver_id);
    setSelectedDriver(currentDriver || null);
    setSaveSuccess(false);
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingCar(null);
    setSelectedDriver(null);
    setSaveSuccess(false);
  };
  
  // Save driver assignment
  const saveDriverAssignment = async () => {
    if (!editingCar) return;
    
    setSaving(true);
    setError('');
    
    try {
      const response = await apiClient.patch('/api/protected/SetCarDriverPair', {
        car_id: editingCar.ID,
        driver_id: selectedDriver ? selectedDriver.ID : 0
      });
      
      if (response.status === 200) {
        setCars(prevCars => 
          prevCars.map(car => 
            car.ID === editingCar.ID 
              ? { ...car, driver_id: selectedDriver ? selectedDriver.ID : 0 }
              : car
          )
        );
        
        setSaveSuccess(true);
      }
    } catch (err) {
      console.error('Error saving driver assignment:', err);
      setError('Failed to save driver assignment');
    } finally {
      setSaving(false);
    }
  };
  
  // Get status badge for expiration dates
  const getExpirationStatus = (dateString) => {
    if (!dateString) return { status: 'unknown', className: 'bg-gray-100 text-gray-600', icon: AlertCircle };
    
    if (isExpired(dateString)) {
      return { status: 'expired', className: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    }
    
    if (isExpiringSoon(dateString)) {
      return { status: 'warning', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
    }
    
    return { status: 'valid', className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
  };

  // Toggle card expansion (mobile only)
  const toggleCardExpansion = (carId) => {
    if (!isMobile) return;
    
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(carId)) {
        newSet.delete(carId);
      } else {
        newSet.add(carId);
      }
      return newSet;
    });
  };
  
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-solid rounded-full animate-pulse"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-6 text-lg">Loading car fleet...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex items-center mb-4 lg:mb-0">
              <button 
                onClick={() => navigate('/')} 
                className="mr-4 p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Manage fleet vehicle and driver assignments
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className={`flex items-center px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
                  refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'
                }`}
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-gray-700">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Cars</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-xl font-bold text-gray-900">{stats.assigned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Expiring</p>
                <p className="text-xl font-bold text-gray-900">{stats.expiringSoon}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search Controls */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by plate number or car type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200/50">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredCars.length}</span> of <span className="font-semibold">{cars.length}</span> cars
              {searchTerm && <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>}
            </p>
          </div>
        </div>
        
        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCars.map((car) => {
            const hasExpiredDocs = isExpired(car.license_expiration_date) || 
                                  isExpired(car.calibration_expiration_date) ||
                                  (car.car_type === 'Trailer' && isExpired(car.tank_license_expiration_date));
            
            const isExpanded = expandedCards.has(car.ID);
            const shouldShowContent = !isMobile || isExpanded;
            
            return (
              <div 
                key={car.ID} 
                className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border transition-all duration-300 hover:shadow-lg ${
                  !isMobile ? 'hover:scale-[1.02]' : ''
                } ${
                  editingCar?.ID === car.ID ? 'ring-2 ring-blue-500 border-blue-200 shadow-lg scale-[1.02]' : 'border-gray-200/50'
                } ${hasExpiredDocs ? 'ring-1 ring-red-200' : ''}`}
              >
                {/* Car Header */}
                <div 
                  className={`rounded-t-xl p-4 bg-white border-b border-gray-100 ${
                    isMobile ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => toggleCardExpansion(car.ID)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Car className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{car.car_no_plate}</h3>
                        <p className="text-sm text-gray-500">{car.car_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasExpiredDocs && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
                          ⚠ Expired
                        </span>
                      )}
                      {isMobile && (
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Car Details - Collapsible on mobile */}
                {shouldShowContent && (
                  <div className="p-5">
                    {/* Current Driver */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          Driver Assignment
                        </h4>
                        {editingCar?.ID === car.ID ? (
                          <button
                            onClick={cancelEdit}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                            title="Cancel edit"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(car)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                            title="Edit driver assignment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {editingCar?.ID === car.ID ? (
                        <div className="space-y-4">
                          <SearchableDropdown
                            options={drivers.map(d => ({ value: d.ID, label: d.name }))}
                            value={selectedDriver?.ID || ''}
                            onChange={(driverId) => {
                              const driver = drivers.find(d => d.ID === driverId);
                              setSelectedDriver(driver || null);
                            }}
                            placeholder="Select a driver..."
                            label=""
                            icon={User}
                          />
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={saveDriverAssignment}
                              disabled={saving}
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                            >
                              {saving ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Save className="h-4 w-4 mr-2" />
                              )}
                              {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            
                            <button
                              onClick={cancelEdit}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                          
                          {saveSuccess && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center animate-fade-in">
                              <Check className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm text-green-700 font-medium">Assignment updated successfully!</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              car.driver_id ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <User className={`h-4 w-4 ${car.driver_id ? 'text-blue-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {getDriverName(car)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {car.driver_id ? 'Active assignment' : 'Available for assignment'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* License Information */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Document Status</h4>
                      
                      {[
                        { key: 'license_expiration_date', label: 'Car License', icon: Calendar },
                        { key: 'calibration_expiration_date', label: 'Calibration', icon: Shield },
                        ...(car.car_type === 'Trailer' ? [{ key: 'tank_license_expiration_date', label: 'Tank License', icon: Gauge }] : [])
                      ].map(({ key, label, icon: Icon }) => {
                        const status = getExpirationStatus(car[key]);
                        const StatusIcon = status.icon;
                        
                        return (
                          <div key={key} className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">{label}</span>
                            </div>
                            <div className={`flex items-center px-3 py-1 rounded-full border text-xs font-medium ${status.className}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {formatDate(car[key])}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Location Information */}
                    {car.location && (
                      <div className="mt-5 pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Current Location:</span>
                          <span className="ml-2">{car.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Empty State */}
        {filteredCars.length === 0 && !loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No cars found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'No cars match your current search criteria. Try adjusting your search terms.'
                : 'No cars are currently registered in your fleet. Add some vehicles to get started.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Custom Styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        @media (max-width: 768px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CarManagement;