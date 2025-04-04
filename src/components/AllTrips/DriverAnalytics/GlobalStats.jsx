import React from 'react';

const GlobalStats = ({ stats, hasFinancialAccess }) => {
  // Format numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-700">Global Statistics</h2>
        <p className="text-xs text-gray-500 mt-1">Overall performance metrics for all drivers</p>
      </div>
      
      <div className="p-4">
        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Trips */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500 text-xs font-medium mb-1">Total Trips</div>
            <div className="text-lg font-bold text-gray-800">{formatNumber(stats.total_trips)}</div>
          </div>
          
          {/* Total Distance */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500 text-xs font-medium mb-1">Total Distance</div>
            <div className="text-lg font-bold text-gray-800">{formatNumber(stats.total_distance)} km</div>
          </div>
          
          {/* Total Volume */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500 text-xs font-medium mb-1">Total Volume</div>
            <div className="text-lg font-bold text-gray-800">{formatNumber(stats.total_volume)} L</div>
          </div>
          
          {/* Revenue or Efficiency */}
          {hasFinancialAccess ? (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500 text-xs font-medium mb-1">Total Revenue</div>
              <div className="text-lg font-bold text-gray-800">${formatNumber(stats.total_revenue)}</div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500 text-xs font-medium mb-1">Volume/Distance</div>
              <div className="text-lg font-bold text-gray-800">{formatNumber(stats.avg_volume_per_km)} L/km</div>
            </div>
          )}
        </div>
        
        {/* Averages */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Average Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-blue-500 text-xs font-medium mb-1">Per Driver</div>
              <div className="text-sm font-bold text-gray-800">{formatNumber(stats.avg_trips_per_driver)} trips</div>
              <div className="text-xs text-gray-500 mt-1">{formatNumber(stats.avg_distance_per_driver)} km</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-green-500 text-xs font-medium mb-1">Per Day</div>
              <div className="text-sm font-bold text-gray-800">{formatNumber(stats.avg_trips_per_day)} trips</div>
              <div className="text-xs text-gray-500 mt-1">{formatNumber(stats.avg_km_per_day)} km</div>
            </div>
          </div>
        </div>
        
        {/* Top Drivers */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Top Performing Drivers</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {stats.top_drivers.map((driver, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-2 flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                  index === 0 ? 'bg-yellow-400 text-yellow-800' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-yellow-700 text-yellow-100' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                <div className="text-sm font-medium text-gray-800 truncate">{driver}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalStats;