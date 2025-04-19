import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  BarChart3, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Clock,
  PieChart,
} from 'lucide-react';
import apiClient from '../../apiClient';
import LoanTimeSeriesAnalysis from './LoanTimeSeriesAnalysis';
import GlobalStats from './GlobalStats';

const LoanStatistics = () => {
  // State management
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Collapsible sections
  const [visibleSections, setVisibleSections] = useState({
    methods: true,
    daily: true,
    weekday: true,
    ranges: true
  });
  
  // Date filter state
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });
  
  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const formatDateDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  // Get first day of month
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1);
  };
  
  // Get last day of month
  const getLastDayOfMonth = (year, month) => {
    // Month is 0-based, so month + 1 gives us the next month
    // Day 0 gives us the last day of the previous month
    return new Date(year, month + 1, 0);
  };
  
  // Set default date range to current month
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // First day of current month
    const startOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Last day of current month
    const endOfMonth = getLastDayOfMonth(currentYear, currentMonth);
    setDateRange({
      fromDate: formatDate(startOfMonth),
      toDate: formatDate(endOfMonth)
    });
  }, []);
  
  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return '$' + parseFloat(value).toFixed(2);
  };
  
  // Toggle section visibility
  const toggleSection = (section) => {
    setVisibleSections({
      ...visibleSections,
      [section]: !visibleSections[section]
    });
  };
  
  // Load loan statistics
  const loadStats = async () => {
    if (!dateRange.fromDate || !dateRange.toDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/api/loans/stats', {
        from_date: dateRange.fromDate,
        to_date: dateRange.toDate
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      } else {
        setError("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load loan statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Load stats when component mounts and when date range changes
  useEffect(() => {
    if (dateRange.fromDate && dateRange.toDate) {
      loadStats();
    }
  }, [dateRange.fromDate, dateRange.toDate]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };
  
  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };
  
  // Set predefined date ranges
  const setThisMonth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const startOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const endOfMonth = getLastDayOfMonth(currentYear, currentMonth);
    
    setDateRange({
      fromDate: formatDate(startOfMonth),
      toDate: formatDate(endOfMonth)
    });
    
    setShowFilters(false);
  };
  
  const setLastMonth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastMonth = now.getMonth() - 1;
    
    // Handle previous year case
    const year = lastMonth < 0 ? currentYear - 1 : currentYear;
    const month = lastMonth < 0 ? 11 : lastMonth;
    
    const startOfLastMonth = getFirstDayOfMonth(year, month);
    const endOfLastMonth = getLastDayOfMonth(year, month);
    
    setDateRange({
      fromDate: formatDate(startOfLastMonth),
      toDate: formatDate(endOfLastMonth)
    });
    
    setShowFilters(false);
  };
  
  const setLast30Days = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    setDateRange({
      fromDate: formatDate(thirtyDaysAgo),
      toDate: formatDate(now)
    });
    
    setShowFilters(false);
  };
  
  // Prepare sorted methods
  const sortedMethods = useMemo(() => {
    if (!stats || !stats.method_stats) return [];
    
    return Object.keys(stats.method_stats)
      .sort((a, b) => stats.method_amounts[b] - stats.method_amounts[a]);
  }, [stats]);
  
  // Daily stats data for chart
  const dailyChartData = useMemo(() => {
    if (!stats) {
      return [];
    }
    
    if (!stats.daily_stats) {
      return [];
    }
    
    
    const result = stats.daily_stats.map(day => ({
      date: day.date,
      amount: day.total_amount,
      count: day.loan_count,
      avg: day.avg_amount
    }));
    
    return result;
  }, [stats]);
  
  // Amount ranges data for chart
  const rangeChartData = useMemo(() => {
    if (!stats || !stats.amount_ranges) return [];
    
    return Object.entries(stats.amount_ranges)
      .map(([range, count]) => ({
        range,
        count,
        percentage: (count / stats.total_loans) * 100
      }))
      .sort((a, b) => {
        // Custom sorting based on range values
        const getMinValue = (range) => {
          const match = range.match(/\$(\d+)/);
          return match ? parseInt(match[1]) : 0;
        };
        
        return getMinValue(a.range) - getMinValue(b.range);
      });
  }, [stats]);
  
  // Weekday data for chart
  const weekdayChartData = useMemo(() => {
    if (!stats || !stats.weekday_stats) return [];
    
    // Define weekday order
    const weekdayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return weekdayOrder
      .filter(day => stats.weekday_stats[day])
      .map(day => ({
        day,
        count: stats.weekday_stats[day].loan_count,
        amount: stats.weekday_stats[day].total_amount,
        avg: stats.weekday_stats[day].avg_amount,
        percentage: (stats.weekday_stats[day].loan_count / stats.total_loans) * 100
      }));
  }, [stats]);
  
  // Render loading state
  if (loading && !refreshing && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-4">Loading statistics...</p>
      </div>
    );
  }
  
  // Render error state
  if (error && !stats) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <p className="text-red-700 font-medium mb-2 text-xl">Error Loading Statistics</p>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            onClick={loadStats}
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Main container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with date filters */}
        <div className="bg-gray-50 border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center">
              <BarChart3 size={24} className="text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Loan Statistics</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`px-3 py-2 rounded-lg border transition-colors flex items-center ${
                  showFilters 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={18} className="mr-2" />
                <span className="font-medium">Date Range</span>
                {showFilters ? <ChevronUp size={18} className="ml-2" /> : <ChevronDown size={18} className="ml-2" />}
              </button>
              
              <button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
                aria-label="Refresh statistics"
                title="Refresh statistics"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          
          {/* Period indicator */}
          <div className="flex items-center text-gray-600 text-sm">
            <Clock size={16} className="mr-2" />
            <span>
      Showing data from <span className="font-medium">
        {formatDateDDMMYYYY(dateRange.fromDate)}
      </span> to <span className="font-medium">
        {formatDateDDMMYYYY(dateRange.toDate)}
      </span>
      {stats && <span className="ml-1">({stats.period_days} days, {stats.period_weeks?.toFixed(1)} weeks)</span>}
    </span>

          </div>
          
          {/* Date Range Filter */}
          {showFilters && (
            <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    id="fromDate"
                    name="fromDate"
                    type="date"
                    value={dateRange.fromDate}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    id="toDate"
                    name="toDate"
                    type="date"
                    value={dateRange.toDate}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              
              {/* Quick date selectors */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={setThisMonth}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  This Month
                </button>
                <button 
                  onClick={setLastMonth}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Last Month
                </button>
                <button 
                  onClick={setLast30Days}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Last 30 Days
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Stats Dashboard */}
        <div className="p-6">
          {/* Summary Stats */}
          <div className="mb-6">
            <GlobalStats stats={stats} formatCurrency={formatCurrency} />
          </div>
          
          {/* Amount Range Distribution */}
          {stats && stats.amount_ranges && (
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <PieChart size={18} className="mr-2 text-purple-600" />
                    Loan Amount Distribution
                  </h3>
                  <button
                    onClick={() => toggleSection('ranges')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {visibleSections.ranges ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                
                {visibleSections.ranges && (
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <h4 className="font-medium text-gray-700 mb-3">Distribution by Range</h4>
                        <div className="space-y-3">
                          {rangeChartData.map(item => (
                            <div key={item.range}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{item.range}</span>
                                <span className="text-sm text-gray-500">{item.count} loans ({item.percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <h4 className="font-medium text-gray-700 mb-3">Amount Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Min Amount</p>
                            <p className="text-lg font-semibold text-gray-800">{formatCurrency(stats.min_amount)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Max Amount</p>
                            <p className="text-lg font-semibold text-gray-800">{formatCurrency(stats.max_amount)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Average</p>
                            <p className="text-lg font-semibold text-blue-600">{formatCurrency(stats.average_amount)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Median</p>
                            <p className="text-lg font-semibold text-green-600">{formatCurrency(stats.median_amount)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Most Common Range</h5>
                          {rangeChartData.length > 0 && (
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                              <div>
                                <p className="font-medium text-purple-800">{
                                  rangeChartData.reduce((prev, current) => {
                                    return prev.count > current.count ? prev : current;
                                  }).range
                                }</p>
                                <p className="text-xs text-purple-600 mt-1">Most frequent loan amount</p>
                              </div>
                              <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                <BarChart3 size={20} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Time Series Analysis */}
          <LoanTimeSeriesAnalysis stats={stats}/>
        </div>
      </div>
      
      {/* Floating refresh indicator */}
      {refreshing && (
        <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-gray-200 z-20 animate-fadeIn">
          <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Refreshing data...</span>
        </div>
      )}
    </div>
  );
};

export default LoanStatistics;