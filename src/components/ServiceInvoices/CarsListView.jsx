import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Search, 
  RefreshCw,
  ChevronRight,
  Wrench,
  FileText,
  AlertTriangle,
  Filter,
  Grid,
  List
} from 'lucide-react';
import apiClient from '../../apiClient';

const CarsListView = ({ onViewServiceInvoices }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/api/GetCars');
      setCars(response.data || []);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCars();
  };

  // Filter cars based on search
  const filteredCars = cars.filter(car => 
    car.car_no_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.car_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading fleet...</p>
        </div>
      </div>
    );
  }

  const CarCard = ({ car, isListView = false }) => (
    <div 
      className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group ${
        isListView ? 'p-4' : 'p-6'
      }`}
      onClick={() => onViewServiceInvoices(car)}
    >
      <div className={`flex items-center ${isListView ? 'justify-between' : 'justify-between mb-4'}`}>
        <div className="flex items-center space-x-3">
          <div className={`${isListView ? 'w-10 h-10' : 'w-12 h-12'} bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors`}>
            <Car className={`${isListView ? 'h-5 w-5' : 'h-6 w-6'} text-blue-600`} />
          </div>
          <div>
            <h3 className={`${isListView ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>
              {car.car_no_plate}
            </h3>
            <p className={`${isListView ? 'text-xs' : 'text-sm'} text-gray-500`}>
              {car.car_type}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>

      {!isListView && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <Wrench className="h-4 w-4 mr-1" />
              <span>Service Records</span>
            </div>
          </div>
          <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
            <FileText className="h-4 w-4 mr-1" />
            <span>View Details</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Management</h1>
              <p className="text-gray-600">Manage vehicle service inspections and records</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <button 
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plate number or vehicle type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCars.length} of {cars.length} vehicles
          </div>
        </div>

        {/* Cars Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCars.map((car) => (
              <CarCard key={car.ID} car={car} />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50">
            <div className="divide-y divide-gray-200">
              {filteredCars.map((car) => (
                <CarCard key={car.ID} car={car} isListView={true} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCars.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No vehicles found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `No vehicles match "${searchTerm}". Try adjusting your search.`
                : 'No vehicles are currently available for service management.'
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
    </div>
  );
};

export default CarsListView;