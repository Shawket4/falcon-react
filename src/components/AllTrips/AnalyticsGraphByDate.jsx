import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  ReferenceLine
} from 'recharts';

const TripStatsByDate = ({ statsByDate, hasFinancialAccess }) => {
  const [activeMetric, setActiveMetric] = useState('revenue');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window size for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  // If no data, show empty state
  if (!statsByDate || statsByDate.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
        <h3 className="text-lg font-semibold mb-4">Time Series Analysis</h3>
        <div className="bg-gray-50 p-4 sm:p-8 text-center rounded-lg">
          <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline data available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your date range to see time-based statistics.
          </p>
        </div>
      </div>
    );
  }

  // Format the data for the chart
  const chartData = statsByDate.map(day => {
    // Format the date to be more readable
    const dateObj = new Date(day.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    return {
      date: formattedDate,
      originalDate: day.date, // Keep original date for tooltip
      trips: day.total_trips || 0,
      volume: day.total_volume || 0,
      distance: day.total_distance || 0,
      revenue: hasFinancialAccess ? (day.total_revenue || 0) : 0,
      companies: day.company_details?.length || 0
    };
  });

  // Calculate statistics
  const totalDays = chartData.length;
  const totalRevenue = chartData.reduce((sum, day) => sum + day.revenue, 0);
  const avgRevenuePerDay = totalDays > 0 ? totalRevenue / totalDays : 0;
  const projectedMonthlyRevenue = avgRevenuePerDay * 31;
  
  const avgTripsPerDay = totalDays > 0 ? 
    chartData.reduce((sum, day) => sum + day.trips, 0) / totalDays : 0;
  const avgVolumePerDay = totalDays > 0 ? 
    chartData.reduce((sum, day) => sum + day.volume, 0) / totalDays : 0;
  const avgDistancePerDay = totalDays > 0 ? 
    chartData.reduce((sum, day) => sum + day.distance, 0) / totalDays : 0;

  // Calculate averages for the reference line
  const getAverage = (metric) => {
    if (!chartData.length) return 0;
    return chartData.reduce((sum, item) => sum + item[metric], 0) / chartData.length;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.originalDate}</p>
          <div className="mt-2 space-y-1">
            {activeMetric === 'revenue' && hasFinancialAccess && (
              <p className="text-sm text-gray-600">
                <span className="inline-block w-24">Revenue:</span>
                <span className="font-medium text-purple-600">{formatCurrency(data.revenue)}</span>
              </p>
            )}
            {activeMetric === 'volume' && (
              <p className="text-sm text-gray-600">
                <span className="inline-block w-24">Volume:</span>
                <span className="font-medium text-green-600">{formatNumber(data.volume)} L</span>
              </p>
            )}
            {activeMetric === 'distance' && (
              <p className="text-sm text-gray-600">
                <span className="inline-block w-24">Distance:</span>
                <span className="font-medium text-yellow-600">{formatNumber(data.distance)} km</span>
              </p>
            )}
            {/* Always show trips for context */}
            <p className="text-sm text-gray-600">
              <span className="inline-block w-24">Trips:</span>
              <span className="font-medium text-blue-600">{formatNumber(data.trips)}</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="inline-block w-24">Companies:</span>
              <span className="font-medium text-indigo-600">{data.companies}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get color for the active metric
  const getMetricColor = (metric) => {
    switch(metric) {
      case 'revenue': return '#8B5CF6'; // Purple
      case 'volume': return '#10B981'; // Green
      case 'distance': return '#F59E0B'; // Yellow
      default: return '#3B82F6'; // Blue
    }
  };

  // Get gradient ID for the active metric
  const getGradientId = (metric) => {
    switch(metric) {
      case 'revenue': return 'colorRevenue';
      case 'volume': return 'colorVolume';
      case 'distance': return 'colorDistance';
      default: return 'colorTrips';
    }
  };

  // Metric selector buttons
  const MetricButton = ({ metric, label, color, icon }) => (
    <button
      onClick={() => setActiveMetric(metric)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
        activeMetric === metric 
          ? 'bg-opacity-20 border' 
          : 'text-gray-600 hover:bg-gray-100 border border-transparent'
      }`}
      style={activeMetric === metric ? { 
        backgroundColor: `${color}20`, 
        color: color, 
        borderColor: `${color}40` 
      } : {}}
    >
      {icon}
      <span className={windowWidth < 640 ? 'hidden' : ''}>{label}</span>
    </button>
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h3 className="text-lg font-semibold">Time Series Analysis</h3>
        <div className="flex flex-wrap gap-2">
          {hasFinancialAccess && (
            <MetricButton 
              metric="revenue" 
              label="Revenue" 
              color="#8B5CF6" 
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>} 
            />
          )}
          <MetricButton 
            metric="volume" 
            label="Volume" 
            color="#10B981" 
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>} 
          />
          <MetricButton 
            metric="distance" 
            label="Distance" 
            color="#F59E0B" 
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>} 
          />
        </div>
      </div>

      {/* Expanded Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">Avg Trips/Day</p>
          <p className="text-sm sm:text-lg font-semibold text-blue-800">
            {formatNumber(avgTripsPerDay)}
          </p>
        </div>
        <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-green-600 font-medium">Avg Volume/Day</p>
          <p className="text-sm sm:text-lg font-semibold text-green-800">
            {formatNumber(avgVolumePerDay)} L
          </p>
        </div>
        <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-yellow-600 font-medium">Avg Distance/Day</p>
          <p className="text-sm sm:text-lg font-semibold text-yellow-800">
            {formatNumber(avgDistancePerDay)} km
          </p>
        </div>
        {hasFinancialAccess && (
          <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
            <p className="text-xs text-purple-600 font-medium">Projected Monthly</p>
            <p className="text-sm sm:text-lg font-semibold text-purple-800">
              {formatCurrency(projectedMonthlyRevenue)}
            </p>
            <p className="text-xs text-purple-500">
              Based on {totalDays} day{totalDays !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ 
            top: 5, 
            right: windowWidth < 640 ? 5 : 30, 
            left: windowWidth < 640 ? 5 : 20, 
            bottom: windowWidth < 640 ? 5 : 30 
          }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#6B7280', fontSize: windowWidth < 640 ? 9 : 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
              tickMargin={windowWidth < 640 ? 2 : 5}
              interval={windowWidth < 640 ? 'preserveStartEnd' : 0}
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: windowWidth < 640 ? 9 : 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
              tickMargin={windowWidth < 640 ? 2 : 5}
              width={windowWidth < 640 ? 30 : 40}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: windowWidth < 640 ? 10 : 12 }} />
            
            {/* Dynamic rendering based on active metric */}
            {activeMetric === 'revenue' && hasFinancialAccess && (
              <>
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8B5CF6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6 }}
                  name="Revenue ($)"
                />
                <ReferenceLine 
                  y={avgRevenuePerDay} 
                  stroke="#8B5CF6" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Avg', 
                    position: 'right',
                    fill: '#8B5CF6',
                    fontSize: windowWidth < 640 ? 10 : 12
                  }} 
                />
              </>
            )}
            
            {activeMetric === 'volume' && (
              <>
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                  activeDot={{ r: 6 }}
                  name="Volume (L)"
                />
                <ReferenceLine 
                  y={avgVolumePerDay} 
                  stroke="#10B981" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Avg', 
                    position: 'right',
                    fill: '#10B981',
                    fontSize: windowWidth < 640 ? 10 : 12
                  }} 
                />
              </>
            )}
            
            {activeMetric === 'distance' && (
              <>
                <Area 
                  type="monotone" 
                  dataKey="distance" 
                  stroke="#F59E0B" 
                  fillOpacity={1} 
                  fill="url(#colorDistance)" 
                  activeDot={{ r: 6 }}
                  name="Distance (km)"
                />
                <ReferenceLine 
                  y={avgDistancePerDay} 
                  stroke="#F59E0B" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Avg', 
                    position: 'right',
                    fill: '#F59E0B',
                    fontSize: windowWidth < 640 ? 10 : 12
                  }} 
                />
              </>
            )}
            
            {/* Show company count line on top of all charts */}
            <Line 
              type="monotone" 
              dataKey="companies" 
              stroke="#6366F1" 
              strokeWidth={2}
              dot={{ r: windowWidth < 640 ? 2 : 4 }}
              activeDot={{ r: windowWidth < 640 ? 4 : 6 }}
              name="Companies"
              yAxisId="right"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Trend analysis */}
      {chartData.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Trend Analysis</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            {hasFinancialAccess && (
              <div className="bg-white border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-purple-600 font-medium">Revenue Trend</p>
                  {getTrendIndicator('revenue')}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {getTrendAnalysis('revenue')}
                </p>
              </div>
            )}
            <div className="bg-white border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-green-600 font-medium">Volume Trend</p>
                {getTrendIndicator('volume')}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getTrendAnalysis('volume')}
              </p>
            </div>
            <div className="bg-white border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-yellow-600 font-medium">Distance Trend</p>
                {getTrendIndicator('distance')}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getTrendAnalysis('distance')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to calculate trend
  function calculateTrend(metric) {
    if (chartData.length < 2) return 0;
    
    // Divide data into halves
    const halfPoint = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, halfPoint);
    const secondHalf = chartData.slice(halfPoint);
    
    // Calculate averages for each half
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item[metric], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item[metric], 0) / secondHalf.length;
    
    // Calculate percentage change
    if (firstHalfAvg === 0) return secondHalfAvg > 0 ? 100 : 0;
    return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  }
  
  // Function to get trend indicator
  function getTrendIndicator(metric) {
    const trend = calculateTrend(metric);
    const color = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400';
    
    return (
      <div className={`flex items-center ${color}`}>
        {trend > 0 ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ) : trend < 0 ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        )}
        <span className="text-xs font-semibold ml-1">{trend.toFixed(1)}%</span>
      </div>
    );
  }
  
  // Function to get trend analysis text
  function getTrendAnalysis(metric) {
    const trend = calculateTrend(metric);
    if (chartData.length < 3) return "Not enough data for reliable trend analysis";
    
    if (Math.abs(trend) < 5) {
      return "Relatively stable with minimal variation over the period";
    } else if (trend > 0) {
      return `Increasing trend with ${trend.toFixed(1)}% growth from first to second half of period`;
    } else {
      return `Decreasing trend with ${Math.abs(trend).toFixed(1)}% reduction from first to second half of period`;
    }
  }
};

export default TripStatsByDate;