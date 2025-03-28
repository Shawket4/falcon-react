import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, 
  User, 
  AlertTriangle, 
  Search, 
  Menu, 
  X, 
  CreditCard,
  Users
} from 'lucide-react';
import apiClient from '../../apiClient';
import LoanStatistics from './LoanStatistics'; // Import the new component

// Comprehensive Arabic text normalization - unchanged from original
const normalizeArabicText = (text) => {
  if (!text) return '';
  
  // Comprehensive mapping of Arabic letter variations
  const arabicNormalizationMap = {
    // Alif variations
    'آ': 'ا', 'أ': 'ا', 'إ': 'ا', 'ٱ': 'ا',
    
    // Yaa variations
    'ي': 'ى', 'ئ': 'ى',
    
    // Waw variations
    'ؤ': 'و',
    
    // Taa Marbouta variations
    'ة': 'ه',
    
    // Remove diacritical marks and kashida
    'ً': '', 'ٌ': '', 'ٍ': '', 'َ': '', 'ُ': '', 'ِ': '', 
    'ّ': '', 'ْ': '', 'ٰ': '', 'ٓ': '', 'ٔ': '', 'ٕ': '',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', 
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  // Normalize each character
  return text.split('').map(char => 
    arabicNormalizationMap[char] || char
  ).join('').trim().toLowerCase();
};

const AllDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('drivers'); // New state for tab management
  const navigate = useNavigate();
  
  // Group drivers by transporter
  const groupDriversByTransporter = (driversList) => {
    return driversList.reduce((acc, driver) => {
      const transporter = driver.transporter || 'Unassigned';
      if (!acc[transporter]) {
        acc[transporter] = [];
      }
      acc[transporter].push(driver);
      return acc;
    }, {});
  };
  
  // Define loadData without useCallback to prevent dependency cycles
  const loadData = async () => {
    setLoading(true);
    
    try {
      const response = await apiClient.post('/api/GetDriverProfileData', {}, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 4000
      });
      
      if (response.data) {
        // Sort drivers by name
        const sortedDrivers = [...response.data].sort((a, b) => a.name.localeCompare(b.name));
        setDrivers(sortedDrivers);
      } else {
        setDrivers([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load drivers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Only call loadData once on component mount
  useEffect(() => {
    loadData();
  }, []); // Empty dependency array ensures this runs only once
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  // Close filters when search term is submitted (on mobile)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowFilters(false);
  };
  
  // Filter and group drivers based on search term
  const filteredGroupedDrivers = useMemo(() => {
    if (!searchTerm) return groupDriversByTransporter(drivers);
    
    const normalizedSearchTerm = normalizeArabicText(searchTerm);
    
    // Filter drivers by name or transporter using normalized text
    const filteredDrivers = drivers.filter(driver => {
      const normalizedName = normalizeArabicText(driver.name);
      const normalizedTransporter = normalizeArabicText(driver.transporter || 'Unassigned');
      
      return normalizedName.includes(normalizedSearchTerm) || 
             normalizedTransporter.includes(normalizedSearchTerm);
    });
    
    return groupDriversByTransporter(filteredDrivers);
  }, [drivers, searchTerm]);
  
  const totalFilteredDrivers = Object.values(filteredGroupedDrivers)
    .reduce((total, group) => total + group.length, 0);
  
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-4">Loading drivers...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <p className="text-red-700 font-medium mb-2 text-xl">Error Loading Drivers</p>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            onClick={loadData}
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 mt-6">
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center">
                <Users className="mr-3 text-blue-500" size={24} />
                <h1 className="text-2xl font-bold text-gray-800">Drivers</h1>
                <div className="ml-2 bg-blue-500 text-white font-medium px-2 py-0.5 rounded-full text-sm">
                  {totalFilteredDrivers}
                </div>
              </div>
              
              {/* Search and Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow">
                  <input 
                    type="text" 
                    placeholder="Search by name or transporter..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <button 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Refresh"
                  title="Refresh drivers"
                >
                  <RefreshCw size={20} className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)} 
                  className={`p-2 rounded-lg transition-colors border border-gray-200 hover:bg-gray-50 sm:hidden`}
                  aria-label="Filters"
                  title="Toggle filters"
                >
                  {showFilters ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
                </button>
              </div>
            </div>
            
            {/* Mobile: Collapsible filters */}
            {showFilters && (
              <div className="mt-4 sm:hidden">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search size={16} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search drivers..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleRefresh} 
                    disabled={refreshing}
                    className={`p-2 rounded-lg text-gray-700 bg-gray-100 transition-colors duration-200 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Refresh drivers list"
                  >
                    <RefreshCw size={20} className={`${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </form>
              </div>
            )}
            
            {/* Tab Navigation */}
            <div className="flex mt-6 border-b border-gray-200">
              <button
                className={`py-2 px-4 font-medium text-sm sm:text-base transition-colors duration-200 ${
                  activeTab === 'drivers' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('drivers')}
              >
                <User size={16} className="inline mr-2" />
                Drivers
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm sm:text-base transition-colors duration-200 ${
                  activeTab === 'loans' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('loans')}
              >
                <CreditCard size={16} className="inline mr-2" />
                Loan Statistics
              </button>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="mb-6">
          {activeTab === 'drivers' ? (
            // Drivers Tab Content
            Object.keys(filteredGroupedDrivers).length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-100 p-6 rounded-full text-gray-400 mb-4">
                    <User size={48} />
                  </div>
                  <p className="text-lg text-gray-500 font-medium">No drivers found</p>
                  <p className="text-gray-400 mt-2">Try adjusting your search or refreshing the page</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(filteredGroupedDrivers).map(([transporter, transporterDrivers]) => (
                  <div key={transporter} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-800 px-6 py-4 text-white">
                      <h2 className="font-medium flex items-center justify-between">
                        <span>{transporter}</span>
                        <span className="bg-white bg-opacity-20 text-sm px-2 py-0.5 rounded-full">
                          {transporterDrivers.length}
                        </span>
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                      {transporterDrivers.map(driver => (
                        <div 
                          key={driver.ID} 
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
                          onClick={() => navigate(`/driver/${driver.ID}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-500 flex-shrink-0">
                              <User size={20} />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h3 className="font-medium text-gray-800 truncate">{driver.name}</h3>
                              <p className="text-sm text-gray-500 mt-1 truncate">{driver.mobile_number || 'No phone number'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Loan Statistics Tab Content
            <LoanStatistics />
          )}
        </div>
      </div>
      
      {/* Floating refresh indicator */}
      {refreshing && (
        <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-gray-200 z-20 animate-fadeIn">
          <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Refreshing...</span>
        </div>
      )}
    </div>
  );
};

export default AllDrivers;