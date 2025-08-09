import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell, 
  Treemap
} from 'recharts';

// Modern color palette
const COLORS = {
  blue: '#3B82F6',
  indigo: '#6366F1',
  purple: '#8B5CF6',
  pink: '#EC4899',
  rose: '#F43F5E',
  orange: '#F97316',
  amber: '#F59E0B',
  yellow: '#EAB308',
  lime: '#84CC16',
  green: '#10B981',
  emerald: '#34D399',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  sky: '#0EA5E9',
  lightBlue: '#38BDF8'
};

const COLOR_ARRAY = Object.values(COLORS);

const CarDataSection = ({ carTotals, hasFinancialAccess, formatNumber, formatCurrency }) => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'base_revenue', direction: 'desc' });
  const [showAllCars, setShowAllCars] = useState(false);
  
  // Calculate enhanced car data with revenue percentages
  const enhancedCarData = useMemo(() => {
    if (!carTotals || !carTotals.length || !hasFinancialAccess) return carTotals || [];
    
    // Calculate average revenue per liter and per km across all cars
    const totalRevenue = carTotals.reduce((sum, car) => sum + ((car.base_revenue || 0) + (car.vat || 0) + (car.rent || 0)), 0);
    const totalVolume = carTotals.reduce((sum, car) => sum + (car.liters || 0), 0);
    const totalDistance = carTotals.reduce((sum, car) => sum + (car.distance || 0), 0);
    
    const avgRevenuePerLiter = totalVolume > 0 ? totalRevenue / totalVolume : 0;
    const avgRevenuePerKm = totalDistance > 0 ? totalRevenue / totalDistance : 0;
    
    return carTotals.map(car => {
      const carTotalRevenue = (car.base_revenue || 0) + (car.vat || 0) + (car.rent || 0);
      const carRevenuePerLiter = car.liters > 0 ? carTotalRevenue / car.liters : 0;
      const carRevenuePerKm = car.distance > 0 ? carTotalRevenue / car.distance : 0;
      
      // Calculate percentage relative to average (100% = average performance)
      const volumeRevenuePercentage = avgRevenuePerLiter > 0 ? (carRevenuePerLiter / avgRevenuePerLiter) * 100 : 0;
      const distanceRevenuePercentage = avgRevenuePerKm > 0 ? (carRevenuePerKm / avgRevenuePerKm) * 100 : 0;
      
      return {
        ...car,
        revenuePerLiter: carRevenuePerLiter,
        revenuePerKm: carRevenuePerKm,
        volumeRevenuePercentage,
        distanceRevenuePercentage
      };
    });
  }, [carTotals, hasFinancialAccess]);
  
  // Sort cars based on current sort configuration - Must be called before any early returns
  const sortedCarTotals = useMemo(() => {
    if (!enhancedCarData || !enhancedCarData.length) return [];
    
    let sortable = [...enhancedCarData];
    
    // Default sort by revenue descending if financial access available
    if (hasFinancialAccess && !sortConfig.key) {
      sortable.sort((a, b) => ((b.base_revenue || 0) + (b.vat || 0) + (b.rent || 0)) - 
                              ((a.base_revenue || 0) + (a.vat || 0) + (a.rent || 0)));
      return sortable;
    }
    
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        // If sorting by total amount
        if (sortConfig.key === 'totalAmount') {
          const aTotal = (a.base_revenue || 0) + (a.vat || 0) + (a.rent || 0);
          const bTotal = (b.base_revenue || 0) + (b.vat || 0) + (b.rent || 0);
          return sortConfig.direction === 'asc' ? aTotal - bTotal : bTotal - aTotal;
        }
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortable;
  }, [enhancedCarData, sortConfig, hasFinancialAccess]);

  // No data handling - Now AFTER the useMemo hook
  if (!carTotals || !carTotals.length) {
    return (
      <div className="bg-white p-4 sm:p-8 text-center rounded-lg shadow-sm border border-gray-100">
        <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No car data available</h3>
        <p className="mt-1 text-sm text-gray-500">
          No car-specific data is available for the selected time period.
        </p>
      </div>
    );
  }

  // Format car data for charts
  const getCarChartData = () => {
    return sortedCarTotals.map(car => ({
      name: car.car_no_plate,
      liters: car.liters || 0,
      distance: car.distance || 0,
      revenue: hasFinancialAccess ? (car.base_revenue || 0) : 0,
      vat: hasFinancialAccess ? (car.vat || 0) : 0,
      rent: hasFinancialAccess ? (car.rent || 0) : 0,
      totalAmount: hasFinancialAccess ? ((car.base_revenue || 0) + (car.vat || 0) + (car.rent || 0)) : 0,
      // For visualization
      value: hasFinancialAccess ? 
        ((car.base_revenue || 0) + (car.vat || 0) + (car.rent || 0)) : 
        (car.liters || 0), // For treemap/pie chart
    }));
  };

  const carChartData = getCarChartData();

  // Sort handler
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction indicator
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Helper function to get performance indicator color and text
  const getPerformanceIndicator = (percentage) => {
    if (percentage >= 120) return { color: 'text-green-700 bg-green-100', text: 'Excellent' };
    if (percentage >= 110) return { color: 'text-green-600 bg-green-50', text: 'Very Good' };
    if (percentage >= 100) return { color: 'text-blue-600 bg-blue-50', text: 'Good' };
    if (percentage >= 90) return { color: 'text-yellow-600 bg-yellow-50', text: 'Average' };
    if (percentage >= 80) return { color: 'text-orange-600 bg-orange-50', text: 'Below Avg' };
    return { color: 'text-red-600 bg-red-50', text: 'Poor' };
  };

  // Calculate total values
  const totalLiters = carTotals.reduce((sum, car) => sum + (car.liters || 0), 0);
  const totalDistance = carTotals.reduce((sum, car) => sum + (car.distance || 0), 0);
  const totalRevenue = carTotals.reduce((sum, car) => sum + (car.base_revenue || 0), 0);
  const totalVAT = carTotals.reduce((sum, car) => sum + (car.vat || 0), 0);
  const totalRent = carTotals.reduce((sum, car) => sum + (car.rent || 0), 0);
  const totalAmount = totalRevenue + totalVAT + totalRent;

  // Custom tooltip formatter for charts
  const customTooltipFormatter = (value, name) => {
    if (name === 'revenue') return [`${formatCurrency(value)}`, 'Base Revenue'];
    if (name === 'totalAmount') return [`${formatCurrency(value)}`, 'Total Amount'];
    if (name === 'vat') return [`${formatCurrency(value)}`, 'VAT (14%)'];
    if (name === 'rent') return [`${formatCurrency(value)}`, 'Rental Fees'];
    
    if (name === 'distance') return [`${formatNumber(value)} km`, 'Distance'];
    if (name === 'liters') return [`${formatNumber(value)} L`, 'Volume'];
    
    return [formatNumber(value), name];
  };

  // Check if we have VAT and rental data
  const hasVAT = carTotals.some(car => car.vat > 0);
  const hasRent = carTotals.some(car => car.rent > 0);

  // Get top N cars for highlight
  const getTopCars = (n = 5, metric = 'base_revenue') => {
    if (metric === 'totalAmount') {
      return [...carTotals]
        .sort((a, b) => ((b.base_revenue || 0) + (b.vat || 0) + (b.rent || 0)) - 
                        ((a.base_revenue || 0) + (a.vat || 0) + (a.rent || 0)))
        .slice(0, n);
    }
    return [...carTotals]
      .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
      .slice(0, n);
  };

  const topRevenueCars = hasFinancialAccess ? getTopCars(5, 'totalAmount') : [];
  const topVolumeCars = getTopCars(5, 'liters');

  // Determine how many cars to show in the table
  const displayedCars = showAllCars ? sortedCarTotals : sortedCarTotals.slice(0, 10);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Car Data Summary Header with KPIs */}
      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Car Fleet Performance</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
            <span>{carTotals.length} vehicles</span>
            <span className="hidden sm:inline">•</span>
            <span>
              {hasFinancialAccess 
                ? `${formatCurrency(totalAmount / carTotals.length)} avg/car` 
                : `${formatNumber(totalDistance / carTotals.length)} km avg/car`}
            </span>
          </div>
        </div>
        
        {/* Key metrics cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-blue-100">
            <div className="flex items-center">
              <div className="hidden sm:flex p-2 sm:p-3 rounded-lg bg-blue-100 text-blue-600 mr-3 sm:mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Cars</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{carTotals.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-green-100">
            <div className="flex items-center">
              <div className="hidden sm:flex p-2 sm:p-3 rounded-lg bg-green-100 text-green-600 mr-3 sm:mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Volume</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatNumber(totalLiters)} L</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-yellow-100">
            <div className="flex items-center">
              <div className="hidden sm:flex p-2 sm:p-3 rounded-lg bg-yellow-100 text-yellow-600 mr-3 sm:mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Distance</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatNumber(totalDistance)} km</p>
              </div>
            </div>
          </div>
          
          {hasFinancialAccess && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-purple-100">
              <div className="flex items-center">
                <div className="hidden sm:flex p-2 sm:p-3 rounded-lg bg-purple-100 text-purple-600 mr-3 sm:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Revenue</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Legend - Only show if financial access is available */}
      {hasFinancialAccess && (
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Performance Legend</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div>
              <span className="text-green-700">≥120% Excellent</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-50 border border-green-100 rounded mr-2"></div>
              <span className="text-green-600">110-119% Very Good</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-50 border border-blue-100 rounded mr-2"></div>
              <span className="text-blue-600">100-109% Good</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-50 border border-yellow-100 rounded mr-2"></div>
              <span className="text-yellow-600">90-99% Average</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-50 border border-orange-100 rounded mr-2"></div>
              <span className="text-orange-600">80-89% Below Avg</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-50 border border-red-100 rounded mr-2"></div>
              <span className="text-red-600">&lt;80% Poor</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Performance percentages are calculated relative to fleet average (100% = average revenue per liter/km)
          </p>
        </div>
      )}

      {/* Top Performers Section - Mobile-friendly cards */}
      {hasFinancialAccess && (
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Top Performing Cars</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h5 className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">Top 5 Cars by Revenue</h5>
              <div className="space-y-2 sm:space-y-3">
                {topRevenueCars.map((car, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 sm:p-3 rounded-lg transition-all duration-150 border ${
                      selectedCar === car.car_no_plate 
                        ? 'bg-purple-50 border-purple-200' 
                        : 'bg-gray-50 border-gray-100 hover:bg-purple-50 hover:border-purple-200'
                    }`}
                    onClick={() => setSelectedCar(selectedCar === car.car_no_plate ? null : car.car_no_plate)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          idx === 0 ? 'bg-purple-100 text-purple-600' : 
                          idx === 1 ? 'bg-indigo-100 text-indigo-600' : 
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="ml-2 sm:ml-3 text-sm sm:text-base font-medium">{car.car_no_plate}</span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-purple-600 whitespace-nowrap">
                        {formatCurrency((car.base_revenue || 0) + (car.vat || 0) + (car.rent || 0))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <h5 className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">Top 5 Cars by Volume</h5>
              <div className="space-y-2 sm:space-y-3">
                {topVolumeCars.map((car, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 sm:p-3 rounded-lg transition-all duration-150 border ${
                      selectedCar === car.car_no_plate 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-100 hover:bg-green-50 hover:border-green-200'
                    }`}
                    onClick={() => setSelectedCar(selectedCar === car.car_no_plate ? null : car.car_no_plate)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          idx === 0 ? 'bg-green-100 text-green-600' : 
                          idx === 1 ? 'bg-emerald-100 text-emerald-600' : 
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="ml-2 sm:ml-3 text-sm sm:text-base font-medium">{car.car_no_plate}</span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-green-600 whitespace-nowrap">
                        {formatNumber(car.liters || 0)} L
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualization Section - Responsive charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue or Volume Treemap - Animation removed */}
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">
            {hasFinancialAccess ? "Revenue Distribution" : "Volume Distribution"}
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            Relative size shows the {hasFinancialAccess ? "revenue" : "volume"} contribution of each car
          </p>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={carChartData}
                dataKey="value"
                nameKey="name"
                aspectRatio={4/3}
                stroke="#fff"
                fill={COLORS.blue}
                animationDuration={0} // No animation
                onClick={(data) => data && setSelectedCar(data.name === selectedCar ? null : data.name)}
              >
                {carChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedCar === entry.name ? 
                      (hasFinancialAccess ? COLORS.purple : COLORS.green) : 
                      COLOR_ARRAY[index % COLOR_ARRAY.length]} 
                    cursor="pointer"
                  />
                ))}
                <Tooltip
                  formatter={(value, name, props) => {
                    const carName = props?.payload?.name || '';
                    return hasFinancialAccess 
                      ? [`${formatCurrency(value)}`, carName] 
                      : [`${formatNumber(value)} L`, carName];
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Volume or Distance - More mobile friendly */}
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">
            {hasFinancialAccess ? "Revenue Breakdown" : "Distance by Car"}
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            {hasFinancialAccess ? "Showing base revenue, VAT, and rental fees" : "Total distance traveled by each car"}
          </p>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {hasFinancialAccess ? (
                <BarChart data={carChartData.slice(0, 6)} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tick={{ fontSize: 10, width: 70, wordWrap: 'break-word' }} 
                    interval={0} 
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={customTooltipFormatter} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="revenue" name="Base Revenue" stackId="a" fill={COLORS.purple}>
                    {carChartData.slice(0, 6).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={selectedCar === entry.name ? COLORS.pink : COLORS.purple} 
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                  {hasVAT && <Bar dataKey="vat" name="VAT (14%)" stackId="a" fill={COLORS.indigo} />}
                  {hasRent && <Bar dataKey="rent" name="Rental Fees" stackId="a" fill={COLORS.sky} />}
                </BarChart>
              ) : (
                <BarChart data={carChartData.slice(0, 6)} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tick={{ fontSize: 10, width: 70, wordWrap: 'break-word' }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={customTooltipFormatter} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="distance" name="Distance" fill={COLORS.amber}>
                    {carChartData.slice(0, 6).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={selectedCar === entry.name ? COLORS.orange : COLORS.amber} 
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Showing top 6 cars. See table below for more details.
          </p>
        </div>
      </div>

      {/* Data Table Section - Mobile optimized */}
      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-800">Vehicle Performance</h4>
            <p className="text-xs text-gray-500 mt-1">
              {selectedCar ? `Viewing: ${selectedCar}` : `${displayedCars.length} of ${carTotals.length} cars shown`}
            </p>
          </div>
          <div className="flex mt-2 sm:mt-0 gap-2">
            {selectedCar && (
              <button 
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 py-1 px-2 border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100"
                onClick={() => setSelectedCar(null)}
              >
                Clear Selection
              </button>
            )}
            {carTotals.length > 10 && (
              <button 
                className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 py-1 px-2 border border-indigo-200 rounded-md bg-indigo-50 hover:bg-indigo-100"
                onClick={() => setShowAllCars(!showAllCars)}
              >
                {showAllCars ? 'Show Less' : 'Show All Cars'}
              </button>
            )}
          </div>
        </div>
        
        {/* Responsive table with horizontal scroll on small screens */}
        <div className="relative overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('car_no_plate')}
                >
                  <div className="flex items-center">
                    <span className="whitespace-nowrap">License</span>
                    {getSortDirectionIndicator('car_no_plate')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('liters')}
                >
                  <div className="flex items-center">
                    <span className="whitespace-nowrap">Volume</span>
                    {getSortDirectionIndicator('liters')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('distance')}
                >
                  <div className="flex items-center">
                    <span className="whitespace-nowrap">Distance</span>
                    {getSortDirectionIndicator('distance')}
                  </div>
                </th>
                {hasFinancialAccess && (
                  <>
                    <th 
                      scope="col" 
                      className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('base_revenue')}
                    >
                      <div className="flex items-center">
                        <span className="whitespace-nowrap">Revenue</span>
                        {getSortDirectionIndicator('base_revenue')}
                      </div>
                    </th>
                    {hasVAT && (
                      <th 
                        scope="col" 
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('vat')}
                      >
                        <div className="flex items-center">
                          <span className="whitespace-nowrap">VAT</span>
                          {getSortDirectionIndicator('vat')}
                        </div>
                      </th>
                    )}
                    {hasRent && (
                      <th 
                        scope="col" 
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('rent')}
                      >
                        <div className="flex items-center">
                          <span className="whitespace-nowrap">Rental</span>
                          {getSortDirectionIndicator('rent')}
                        </div>
                      </th>
                    )}
                    {(hasVAT || hasRent) && (
                      <th 
                        scope="col" 
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('totalAmount')}
                      >
                        <div className="flex items-center">
                          <span className="whitespace-nowrap">Total</span>
                          {getSortDirectionIndicator('totalAmount')}
                        </div>
                      </th>
                    )}
                    {/* New Performance Columns */}
                    <th 
                      scope="col" 
                      className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('volumeRevenuePercentage')}
                    >
                      <div className="flex items-center">
                        <span className="whitespace-nowrap">Rev/Vol %</span>
                        {getSortDirectionIndicator('volumeRevenuePercentage')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('distanceRevenuePercentage')}
                    >
                      <div className="flex items-center">
                        <span className="whitespace-nowrap">Rev/Dist %</span>
                        {getSortDirectionIndicator('distanceRevenuePercentage')}
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedCars.map((car, index) => (
                <tr 
                  key={index} 
                  className={`${selectedCar === car.car_no_plate ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors duration-150 ease-in-out`}
                  onClick={() => setSelectedCar(selectedCar === car.car_no_plate ? null : car.car_no_plate)}
                >
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {car.car_no_plate}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                    {formatNumber(car.liters || 0)}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                    {formatNumber(car.distance || 0)}
                  </td>
                  {hasFinancialAccess && (
                    <>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                        {formatCurrency(car.base_revenue || 0)}
                      </td>
                      {hasVAT && (
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                          {formatCurrency(car.vat || 0)}
                        </td>
                      )}
                      {hasRent && (
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                          {formatCurrency(car.rent || 0)}
                        </td>
                      )}
                      {(hasVAT || hasRent) && (
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {formatCurrency((car.base_revenue || 0) + (car.vat || 0) + (car.rent || 0))}
                        </td>
                      )}
                      {/* New Performance Percentage Columns */}
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceIndicator(car.volumeRevenuePercentage || 0).color}`}>
                            {(car.volumeRevenuePercentage || 0).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceIndicator(car.distanceRevenuePercentage || 0).color}`}>
                            {(car.distanceRevenuePercentage || 0).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            {/* Table footer with totals */}
            <tfoot className="bg-gray-100">
              <tr>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                  TOTAL
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                  {formatNumber(totalLiters)}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                  {formatNumber(totalDistance)}
                </td>
                {hasFinancialAccess && (
                  <>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                      {formatCurrency(totalRevenue)}
                    </td>
                    {hasVAT && (
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                        {formatCurrency(totalVAT)}
                      </td>
                    )}
                    {hasRent && (
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                        {formatCurrency(totalRent)}
                      </td>
                    )}
                    {(hasVAT || hasRent) && (
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                        {formatCurrency(totalAmount)}
                      </td>
                    )}
                    {/* Average performance indicators */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        100%
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        100%
                      </span>
                    </td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-4 text-xs sm:text-sm text-gray-500 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap items-center gap-4">
            <p>Click on column headers to sort. Click on a car row to highlight.</p>
            {hasFinancialAccess && (
              <p className="text-xs text-gray-400">
                Rev/Vol % = Revenue efficiency per liter • Rev/Dist % = Revenue efficiency per km
              </p>
            )}
          </div>
          {carTotals.length > 10 && !showAllCars && (
            <button 
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800"
              onClick={() => setShowAllCars(true)}
            >
              View all {carTotals.length} cars
            </button>
          )}
        </div>
      </div>

      {/* Efficiency Metrics Section - Enhanced with percentage indicators */}
      {hasFinancialAccess && (
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Efficiency Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sortedCarTotals.slice(0, 6).map((car, idx) => {
              const totalRevenue = (car.base_revenue || 0) + (car.vat || 0) + (car.rent || 0);
const revenuePerLiter = car.liters ? (totalRevenue / car.liters) : 0;
const revenuePerKm = car.distance ? (totalRevenue / car.distance) : 0;
              const volumeIndicator = getPerformanceIndicator(car.volumeRevenuePercentage || 0);
              const distanceIndicator = getPerformanceIndicator(car.distanceRevenuePercentage || 0);
              
              return (
                <div 
                  key={idx} 
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-150 ${
                    selectedCar === car.car_no_plate 
                      ? 'border-indigo-300 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                  }`}
                  onClick={() => setSelectedCar(selectedCar === car.car_no_plate ? null : car.car_no_plate)}
                >
                  <h5 className="text-sm sm:text-base font-medium text-gray-800 mb-2">{car.car_no_plate}</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Revenue per L</p>
                      <p className="text-sm sm:text-lg font-semibold text-indigo-600">{formatCurrency(revenuePerLiter)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${volumeIndicator.color}`}>
                        {(car.volumeRevenuePercentage || 0).toFixed(0)}% {volumeIndicator.text}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Revenue per km</p>
                      <p className="text-sm sm:text-lg font-semibold text-indigo-600">{formatCurrency(revenuePerKm)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${distanceIndicator.color}`}>
                        {(car.distanceRevenuePercentage || 0).toFixed(0)}% {distanceIndicator.text}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Volume</p>
                      <p className="text-xs sm:text-sm text-gray-700">{formatNumber(car.liters)} L</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-xs sm:text-sm text-gray-700">{formatCurrency(car.base_revenue)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {sortedCarTotals.length > 6 && (
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-500">Showing top 6 cars by revenue. See table above for all cars.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CarDataSection;