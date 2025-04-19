import React, { useState, useEffect } from 'react';
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

const LoanTimeSeriesAnalysis = ({ stats }) => {
  const [activeMetric, setActiveMetric] = useState('amount');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Monitor window size for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format numbers for display - with 2 decimal places
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  // Format currency with 2 decimal places
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(num);
  };

  // If no data, show empty state
  if (!stats || !stats.daily_stats || stats.daily_stats.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Time Series Analysis</h3>
        <div className="bg-gray-50 p-4 sm:p-8 text-center rounded-lg">
          <svg className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">No timeline data available</h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Try adjusting your date range to see time-based statistics.
          </p>
        </div>
      </div>
    );
  }

  // Format the data for the chart
  const chartData = stats.daily_stats.map(day => {
    // Format the date to be more readable
    const dateObj = new Date(day.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return {
      date: formattedDate,
      originalDate: day.date, // Keep original date for tooltip
      loans: day.loan_count || 0,
      amount: day.total_amount || 0,
      avgAmount: day.avg_amount || 0
    };
  });

  // Calculate summary statistics
  const totalDays = chartData.length;
  const totalLoans = chartData.reduce((sum, day) => sum + day.loans, 0);
  const totalAmount = chartData.reduce((sum, day) => sum + day.amount, 0);
  
  const avgLoansPerDay = totalDays > 0 ? totalLoans / totalDays : 0;
  const avgAmountPerDay = totalDays > 0 ? totalAmount / totalDays : 0;
  
  // Calculate projected monthly amount (30 days)
  const projectedMonthlyAmount = avgAmountPerDay * 31;


  // Get data key and name for active metric
  const getMetricInfo = (metric) => {
    switch(metric) {
      case 'amount':
        return {
          dataKey: 'amount',
          name: 'Total Amount ($)',
          color: '#10B981', // GREEN
          fillId: 'colorAmount',
          format: (val) => formatCurrency(val),
          avg: avgAmountPerDay,
          total: totalAmount
        };
      case 'avgAmount':
        return {
          dataKey: 'avgAmount',
          name: 'Average Loan ($)',
          color: '#8B5CF6', // PURPLE
          fillId: 'colorAvgAmount',
          format: (val) => formatCurrency(val),
          avg: stats.average_amount || 0,
          total: stats.average_amount || 0
        };
      default:
        return {
          dataKey: 'loans',
          name: 'Loan Count',
          color: '#3B82F6', // BLUE
          fillId: 'colorLoans',
          format: (val) => formatNumber(val),
          avg: avgLoansPerDay,
          total: totalLoans
        };
    }
  };

  // Get current metric data
  const currentMetric = getMetricInfo(activeMetric);

  // Calculate trend data
  const calculateTrend = (metric) => {
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
  };
  
  // Function to get trend indicator
  const getTrendIndicator = (metric) => {
    const trend = calculateTrend(metric);
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
  
  // Function to get trend analysis text
  const getTrendAnalysis = (metric) => {
    const trend = calculateTrend(metric);
    if (chartData.length < 3) return "Not enough data";
    
    // Shorter text for mobile
    if (windowWidth < 640) {
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

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200 text-xs sm:text-sm">
          <p className="font-semibold text-gray-800">{data.originalDate}</p>
          <div className="mt-2 space-y-1">
            <p style={{ color: currentMetric.color }}>
              <span className="inline-block w-24 sm:w-28">{currentMetric.name}:</span>
              <span className="font-medium">{currentMetric.format(data[currentMetric.dataKey])}</span>
            </p>
            <p className="text-gray-600">
              <span className="inline-block w-24 sm:w-28">Loans:</span>
              <span className="font-medium">{formatNumber(data.loans)}</span>
            </p>
            <p className="text-gray-600">
              <span className="inline-block w-24 sm:w-28">Avg Loan Amount:</span>
              <span className="font-medium">{formatCurrency(data.avgAmount)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Metric selector buttons with icons
  const MetricButton = ({ metric, label, color, icon }) => (
    <button
      onClick={() => setActiveMetric(metric)}
      className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
        activeMetric === metric 
          ? 'bg-opacity-15 border' 
          : 'text-gray-600 hover:bg-gray-100 border border-transparent'
      }`}
      style={activeMetric === metric ? { 
        backgroundColor: `${color}15`, 
        color: color, 
        borderColor: `${color}30` 
      } : {}}
    >
      {icon}
      <span className={windowWidth < 480 ? 'hidden' : ''}>{label}</span>
    </button>
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h3 className="text-base sm:text-lg font-semibold">Time Series Analysis</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <MetricButton 
            metric="amount" 
            label="Total Amount" 
            color="#10B981" 
            icon={<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>} 
          />
          <MetricButton 
            metric="avgAmount" 
            label="Average Loan" 
            color="#8B5CF6" 
            icon={<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>} 
          />
          <MetricButton 
            metric="loans" 
            label="Loan Count" 
            color="#3B82F6" 
            icon={<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>} 
          />
        </div>
      </div>

      {/* Summary Cards - Full numbers with 2 decimal places */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">Total Loans</p>
          <p className="text-sm sm:text-base font-semibold text-blue-800 overflow-x-auto">
            {formatNumber(totalLoans)}
          </p>
        </div>
        <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-green-600 font-medium">Total Amount</p>
          <p className="text-sm sm:text-base font-semibold text-green-800 overflow-x-auto">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-purple-600 font-medium">Average Amount</p>
          <p className="text-sm sm:text-base font-semibold text-purple-800 overflow-x-auto">
            {formatCurrency(stats.average_amount || 0)}
          </p>
        </div>
      </div>

      {/* Chart - Height adjusts based on screen size */}
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
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAvgAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
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
                // Format based on the active metric
                if (activeMetric === 'amount' || activeMetric === 'avgAmount') {
                  return value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value.toFixed(0)}`;
                }
                return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0);
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {windowWidth >= 640 && <Legend />}
            
            {/* Draw the current metric */}
            <Area 
              type="monotone" 
              dataKey={currentMetric.dataKey} 
              stroke={currentMetric.color} 
              fillOpacity={1} 
              fill={`url(#${currentMetric.fillId})`} 
              activeDot={{ r: windowWidth < 640 ? 4 : 6 }}
              name={currentMetric.name}
            />
            
            {/* Reference line with responsive label */}
            <ReferenceLine 
              y={currentMetric.avg} 
              stroke={currentMetric.color} 
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
                          fill={currentMetric.color}
                          fontSize={windowWidth < 640 ? 10 : 12}
                          fontWeight={500}
                          textAnchor="start"
                        >
                          Avg
                        </text>
                        <text 
                          x={x + (windowWidth < 640 ? 5 : 10)} 
                          y={y + (windowWidth < 640 ? 10 : 12)} 
                          fill={currentMetric.color}
                          fontSize={windowWidth < 640 ? 10 : 12}
                          fontWeight={600}
                          textAnchor="start"
                        >
                          {activeMetric === 'amount' || activeMetric === 'avgAmount'
                            ? formatCurrency(currentMetric.avg) 
                            : formatNumber(currentMetric.avg)}
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

      {/* Trend analysis - Made more responsive with stacked layout on mobile */}
      {chartData.length > 1 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Trend Analysis & Projections</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-green-600 font-medium">Amount Trend</p>
                {getTrendIndicator('amount')}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                {getTrendAnalysis('amount')}
              </p>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-green-100">
                <p className="text-xs text-green-600 font-medium">Projected Monthly</p>
                <p className="text-sm sm:text-base font-semibold text-green-800 overflow-x-auto">
                  {formatCurrency(projectedMonthlyAmount)}
                </p>
                <p className="text-xs text-gray-500">
                  Based on {totalDays} day{totalDays !== 1 ? 's' : ''} avg
                </p>
              </div>
            </div>
            <div className="bg-white border border-purple-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-purple-600 font-medium">Avg Amount Trend</p>
                {getTrendIndicator('avgAmount')}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                {getTrendAnalysis('avgAmount')}
              </p>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-purple-100">
                <p className="text-xs text-purple-600 font-medium">Min / Max</p>
                <p className="text-sm sm:text-base font-semibold text-purple-800 overflow-x-auto">
                  {formatCurrency(stats.min_amount || 0)} / {formatCurrency(stats.max_amount || 0)}
                </p>
              </div>
            </div>
            <div className="bg-white border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-blue-600 font-medium">Loan Count Trend</p>
                {getTrendIndicator('loans')}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                {getTrendAnalysis('loans')}
              </p>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Daily Average</p>
                <p className="text-sm sm:text-base font-semibold text-blue-800 overflow-x-auto">
                  {formatNumber(avgLoansPerDay)} loans
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanTimeSeriesAnalysis;