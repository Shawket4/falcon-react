import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';
import apiClient from '../../apiClient';

const FuelTimeSeriesAnalysis = ({ dateRange }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Format numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(num);
  };

  // Memoized chart data
  const chartData = useMemo(() => {
    if (!stats || !stats.daily_stats) return [];

    return stats.daily_stats.map(day => {
      // Format the date to be more readable
      const dateObj = new Date(day.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      return {
        date: formattedDate,
        originalDate: day.date,
        liters: day.total_liters || 0,
        amount: day.total_price || 0
      };
    });
  }, [stats]);

  // Metric Button Component (kept for layout consistency)
  const MetricButton = ({ label, color, icon }) => (
    <div className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2`}>
      {icon}
      <span className={windowWidth < 480 ? 'hidden' : ''}>{label}</span>
    </div>
  );

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200 text-xs sm:text-sm">
          <p className="font-semibold text-gray-800">{data.originalDate}</p>
          <div className="mt-2 space-y-1">
            <p className="text-blue-600">
              <span className="inline-block w-24 sm:w-28">Liters:</span>
              <span className="font-medium">{formatNumber(data.liters)}</span>
            </p>
            <p className="text-green-600">
              <span className="inline-block w-24 sm:w-28">Total Price:</span>
              <span className="font-medium">{formatCurrency(data.amount)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Trend calculation for liters
  const calculateLitersTrend = () => {
    if (!stats || !stats.daily_stats || stats.daily_stats.length < 2) return 0;

    const chartData = stats.daily_stats.map(day => ({
      date: day.date,
      liters: day.total_liters
    }));

    // Divide data into halves
    const halfPoint = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, halfPoint);
    const secondHalf = chartData.slice(halfPoint);
    
    // Calculate averages for each half
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.liters, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.liters, 0) / secondHalf.length;
    
    // Calculate percentage change
    if (firstHalfAvg === 0) return secondHalfAvg > 0 ? 100 : 0;
    return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  };

  // Trend indicator for liters
  const getLitersTrendIndicator = () => {
    const trend = calculateLitersTrend();
    const color = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400';
    
    return (
      <div className={`flex items-center ${color}`}>
        {trend > 0 ? (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ) : trend < 0 ? (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        ) : (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        )}
        <span className="text-xs font-semibold ml-1">{trend.toFixed(1)}%</span>
      </div>
    );
  };

  // Trend analysis for liters
  const getLitersTrendAnalysis = () => {
    if (!stats || !stats.daily_stats || stats.daily_stats.length < 3) return "Not enough data";

    const trend = calculateLitersTrend();
    
    // Shorter text for mobile
    if (window.innerWidth < 640) {
      if (Math.abs(trend) < 5) {
        return "Stable trend";
      } else if (trend > 0) {
        return `Increasing ${trend.toFixed(1)}%`;
      } else {
        return `Decreasing ${Math.abs(trend).toFixed(1)}%`;
      }
    }
    
    // Full text for larger screens
    if (Math.abs(trend) < 5) {
      return "Relatively stable with minimal variation";
    } else if (trend > 0) {
      return `Increasing trend with ${trend.toFixed(1)}% growth`;
    } else {
      return `Decreasing trend with ${Math.abs(trend).toFixed(1)}% reduction`;
    }
  };

  // Monitor window size for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch statistics when component mounts or date range changes
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Construct query parameters
        const params = {};
        if (dateRange?.startDate) {
          params.start_date = dateRange.startDate.toISOString().split('T')[0];
        }
        if (dateRange?.endDate) {
          params.end_date = dateRange.endDate.toISOString().split('T')[0];
        }

        const response = await apiClient.get('/api/fuel/statistics', { params });
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch fuel statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [dateRange]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Fuel Time Series Analysis</h3>
        <div className="bg-gray-50 p-4 sm:p-8 text-center rounded-lg">
          <div className="animate-pulse">
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-red-600">Error</h3>
        <p className="text-sm text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!stats || !stats.daily_stats || stats.daily_stats.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Fuel Time Series Analysis</h3>
        <div className="bg-gray-50 p-4 sm:p-8 text-center rounded-lg">
          <svg className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">No fuel data available</h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Try adjusting your date range to see time-based statistics.
          </p>
        </div>
      </div>
    );
  }

  // Metrics for liters and price
  const litersMetric = {
    dataKey: 'liters',
    name: 'Liters',
    color: '#3B82F6', // BLUE
    fillId: 'colorLiters',
    avg: stats.average_liters || 0,
    total: stats.total_liters,
    projectedMonthly: (stats.total_liters / (stats.period_days || 1)) * 30
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h3 className="text-base sm:text-lg font-semibold">Fuel Time Series Analysis</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <MetricButton 
            label="Liters" 
            color="#3B82F6" 
            icon={<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>} 
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">Total Liters</p>
          <p className="text-sm sm:text-base font-semibold text-blue-800 overflow-x-auto">
            {formatNumber(stats.total_liters)}
          </p>
        </div>
        <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-green-600 font-medium">Total Price</p>
          <p className="text-sm sm:text-base font-semibold text-green-800 overflow-x-auto">
            {formatCurrency(stats.total_price)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ 
              top: 5, 
              right: windowWidth < 640 ? 5 : 30, 
              left: windowWidth < 640 ? 5 : 20, 
              bottom: 30 
            }}
          >
            <defs>
              <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ 
                fill: '#6B7280', 
                fontSize: windowWidth < 640 ? 10 : 12 
              }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
              height={windowWidth < 640 ? 30 : 40}
            />
            <YAxis 
              tick={{ 
                fill: '#6B7280', 
                fontSize: windowWidth < 640 ? 10 : 12 
              }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
              width={windowWidth < 640 ? 35 : 55}
              tickFormatter={(value) => {
                return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0);
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {windowWidth >= 640 && <Legend />}
            
            {/* Draw the liters metric */}
            <Area 
              type="monotone" 
              dataKey="liters" 
              stroke="#3B82F6" 
              fillOpacity={1} 
              fill="url(#colorLiters)" 
              activeDot={{ r: windowWidth < 640 ? 4 : 6 }}
              name="Liters"
            />
            
            {/* Reference line with average */}
            <ReferenceLine 
              y={litersMetric.avg} 
              stroke="#3B82F6" 
              strokeDasharray="3 3" 
              strokeWidth={1}
              isFront={true}
            >
              {windowWidth >= 480 ? (
                <Label 
                  content={({ viewBox }) => {
                    const { x, y } = viewBox;
                    return (
                      <g>
                        <text 
                          x={x + (windowWidth < 640 ? 5 : 10)} 
                          y={y - (windowWidth < 640 ? 4 : 6)} 
                          fill="#3B82F6"
                          fontSize={windowWidth < 640 ? 10 : 12}
                          fontWeight={500}
                          textAnchor="start"
                        >
                          Avg
                        </text>
                        <text 
                          x={x + (windowWidth < 640 ? 5 : 10)} 
                          y={y + (windowWidth < 640 ? 10 : 12)} 
                          fill="#3B82F6"
                          fontSize={windowWidth < 640 ? 10 : 12}
                          fontWeight={600}
                          textAnchor="start"
                        >
                          {formatNumber(litersMetric.avg)}
                        </text>
                      </g>
                    );
                  }}
                />
              ) : null}
            </ReferenceLine>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis Section */}
      {chartData.length > 1 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Trend Analysis & Projections</h4>
          <div className="grid grid-cols-1 gap-2 sm:gap-4">
            <div className="bg-white border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-blue-600 font-medium">Liters Trend</p>
                {getLitersTrendIndicator()}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                {getLitersTrendAnalysis()}
              </p>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Projected Monthly</p>
                <p className="text-sm sm:text-base font-semibold text-blue-800 overflow-x-auto">
                  {formatNumber(litersMetric.projectedMonthly || 0)} liters
                </p>
                <p className="text-xs text-gray-500">
                  Based on {stats.period_days} day{stats.period_days !== 1 ? 's' : ''} avg
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelTimeSeriesAnalysis;