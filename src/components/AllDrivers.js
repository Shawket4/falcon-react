import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, User, AlertTriangle, Search, Menu, X } from 'lucide-react';
import apiClient from '../apiClient';

// Comprehensive Arabic text normalization
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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading drivers...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <div className="text-red-500 mb-4">
          <AlertTriangle size={48} />
        </div>
        <p className="text-lg font-medium text-gray-800 mb-6">{error}</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 shadow-md"
          onClick={loadData}
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Fixed on all devices */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-3 sm:p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Drivers</h1>
          
          {/* Mobile: Menu toggle + Counter */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="bg-blue-500 text-white font-medium px-2 py-1 rounded-full flex items-center justify-center min-w-[28px] text-sm shadow-sm">
              {totalFilteredDrivers}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              aria-label={showFilters ? "Close filters" : "Show filters"}
            >
              {showFilters ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          
          {/* Desktop: Always visible search and controls */}
          <div className="hidden sm:flex items-center gap-3 flex-grow max-w-xl ml-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Search drivers by name or transporter" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className={`p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Refresh drivers list"
              >
                <RefreshCw size={20} className={`${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="bg-blue-500 text-white font-medium px-3 py-1 rounded-full flex items-center justify-center min-w-[32px] shadow-sm">
                {totalFilteredDrivers}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile: Collapsible search form */}
        {showFilters && (
          <div className="mt-3 sm:hidden">
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
      </div>
      
      {/* Content Area - Scrollable */}
      <div className="flex-grow overflow-y-auto p-3 sm:p-4">
        {Object.keys(filteredGroupedDrivers).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
            <div className="bg-gray-100 p-6 rounded-full text-gray-400 mb-4">
              <User size={48} />
            </div>
            <p className="text-lg text-gray-500 font-medium">No drivers found.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or refreshing the page.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(filteredGroupedDrivers).map(([transporter, transporterDrivers]) => (
              <div key={transporter} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                  <h2 className="font-bold text-gray-700 flex items-center text-sm sm:text-base">
                    {transporter}
                    <span className="ml-2 text-xs sm:text-sm bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {transporterDrivers.length}
                    </span>
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3 sm:gap-4 sm:p-4">
                  {transporterDrivers.map(driver => (
                    <div 
                      key={driver.ID} 
                      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer hover:border-blue-300"
                      onClick={() => navigate(`/driver/${driver.ID}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-500 flex-shrink-0">
                          <User size={20} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium text-gray-800 truncate text-sm sm:text-base">{driver.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{driver.mobile_number || 'No phone number'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating refresh indicator */}
      {refreshing && (
        <div className="fixed bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-gray-200 z-20">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs sm:text-sm text-gray-600">Refreshing...</span>
        </div>
      )}
    </div>
  );
};

export default AllDrivers;