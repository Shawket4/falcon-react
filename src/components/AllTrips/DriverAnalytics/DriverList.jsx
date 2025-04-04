import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  TrendingUp, 
  Search, 
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const DriverList = ({ 
  drivers, 
  selectedDriver, 
  onSelectDriver, 
  hasFinancialAccess 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'revenue_per_day',
    direction: 'desc'
  });

  // Consistent efficiency color logic
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 1.2) return { 
      bgClass: 'bg-green-500 text-green-50', 
      label: 'Outstanding' 
    };
    if (efficiency >= 1.1) return { 
      bgClass: 'bg-green-400 text-green-50', 
      label: 'Excellent' 
    };
    if (efficiency >= 1.0) return { 
      bgClass: 'bg-blue-500 text-blue-50', 
      label: 'Good' 
    };
    if (efficiency >= 0.9) return { 
      bgClass: 'bg-blue-400 text-blue-50', 
      label: 'Average' 
    };
    if (efficiency >= 0.8) return { 
      bgClass: 'bg-yellow-500 text-yellow-50', 
      label: 'Needs Improvement' 
    };
    if (efficiency > 0) return { 
      bgClass: 'bg-red-400 text-red-50', 
      label: 'Poor' 
    };
    return { 
      bgClass: 'bg-gray-400 text-gray-50', 
      label: 'No Data' 
    };
  };

  // Memoized filtered and sorted drivers
  const processedDrivers = useMemo(() => {
    // First, filter by search term
    const filtered = drivers.filter(driver =>
      driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch(sortConfig.key) {
        case 'driver_name':
          comparison = a.driver_name.localeCompare(b.driver_name);
          break;
        case 'total_trips':
          comparison = (b.total_trips || 0) - (a.total_trips || 0);
          break;
        case 'revenue_per_day':
        default:
          // Calculate revenue per day
          const aRevPerDay = a.total_amount ? a.total_amount / (a.working_days || 1) : 0;
          const bRevPerDay = b.total_amount ? b.total_amount / (b.working_days || 1) : 0;
          comparison = bRevPerDay - aRevPerDay;
          break;
      }

      return sortConfig.direction === 'desc' ? comparison : -comparison;
    });
  }, [drivers, searchTerm, sortConfig]);
  
  // Format numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { 
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    }).format(num || 0);
  };
  
  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-white" />
          <h2 className="text-lg font-bold text-white">Driver Performance</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search drivers..."
            className="w-full pl-8 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2 top-3 w-4 h-4 text-white/70" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-3 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sorting Options */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        {[
          { key: 'driver_name', label: 'Name' },
          { key: 'total_trips', label: 'Trips' },
          { key: 'revenue_per_day', label: 'Revenue/Day' }
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`flex items-center text-xs font-medium transition-colors ${
              sortConfig.key === key 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => handleSort(key)}
          >
            {label}
            {sortConfig.key === key && (
              sortConfig.direction === 'desc' 
                ? <ArrowDown className="ml-1 w-3 h-3" /> 
                : <ArrowUp className="ml-1 w-3 h-3" />
            )}
          </button>
        ))}
      </div>

      {/* Driver List */}
      <div className="divide-y divide-gray-100">
        {processedDrivers.map((driver) => {
          // Calculate revenue per day
          const revenuePerDay = driver.total_amount 
            ? driver.total_amount / (driver.working_days || 1) 
            : 0;

          // Get efficiency color details
          const efficiencyDetails = getEfficiencyColor(driver.efficiency);

          return (
            <div 
              key={driver.driver_name}
              className={`
                cursor-pointer p-4 hover:bg-blue-50 transition-colors
                ${selectedDriver?.driver_name === driver.driver_name 
                  ? 'bg-blue-100 border-l-4 border-blue-500' 
                  : ''}
              `}
              onClick={() => onSelectDriver(driver)}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 truncate" title={driver.driver_name}>
                    {driver.driver_name}
                  </div>
                </div>
                <div 
                  className={`
                    px-2 py-1 rounded-full text-xs font-semibold 
                    ${efficiencyDetails.bgClass}
                  `}
                >
                  {formatNumber(driver.efficiency * 100)}%
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded p-2 text-center">
                  <div className="text-blue-600 font-bold text-sm">{formatNumber(driver.total_trips)}</div>
                  <div className="text-gray-500 text-xs">Trips</div>
                </div>
                <div className="bg-green-50 rounded p-2 text-center">
                  <div className="text-green-600 font-bold text-sm">{formatNumber(driver.total_distance)} km</div>
                  <div className="text-gray-500 text-xs">Distance</div>
                </div>
                <div className="bg-yellow-50 rounded p-2 text-center">
                  <div className="text-yellow-600 font-bold text-sm">{driver.working_days}</div>
                  <div className="text-gray-500 text-xs">Days</div>
                </div>
                {hasFinancialAccess && (
                  <div className="bg-purple-50 rounded p-2 text-center">
                    <div className="text-purple-600 font-bold text-sm">
                      ${formatNumber(revenuePerDay)}
                    </div>
                    <div className="text-gray-500 text-xs">Rev/Day</div>
                  </div>
                )}
              </div>

              {/* Revenue details if financial access */}
              {hasFinancialAccess && (
                <div className="mt-3 bg-gray-50 rounded-lg p-2 flex justify-between">
                  <span className="text-xs text-gray-600">Total Revenue</span>
                  <span className="text-sm font-bold text-green-600">
                    ${formatNumber(driver.total_amount || 0)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
        <span>
          Showing {processedDrivers.length} of {drivers.length} drivers
        </span>
        <span className="text-blue-500">
          {Math.round((processedDrivers.length / drivers.length) * 100)}%
        </span>
      </div>
    </div>
  );
};

DriverList.propTypes = {
  drivers: PropTypes.arrayOf(PropTypes.shape({
    driver_name: PropTypes.string.isRequired,
    total_trips: PropTypes.number,
    total_distance: PropTypes.number,
    working_days: PropTypes.number,
    total_amount: PropTypes.number,
    efficiency: PropTypes.number
  })).isRequired,
  selectedDriver: PropTypes.object,
  onSelectDriver: PropTypes.func.isRequired,
  hasFinancialAccess: PropTypes.bool
};

export default DriverList;