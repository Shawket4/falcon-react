import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, CreditCard, BarChart3, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../apiClient';

const LoanStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Date filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Set default date range to current month
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setFromDate(formatDate(startOfMonth));
    setToDate(formatDate(endOfMonth));
  }, []);
  
  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Load loan statistics
  const loadStats = async () => {
    if (!fromDate || !toDate) return;
    
    setLoading(true);
    
    try {
      const response = await apiClient.post('/api/loans/stats', {
        from_date: fromDate,
        to_date: toDate
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 4000
      });
      
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      } else {
        setError("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load loan statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Load stats when component mounts and when date range changes
  useEffect(() => {
    if (fromDate && toDate) {
      loadStats();
    }
  }, [fromDate, toDate]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };
  
  // Render method stats cards
  const renderMethodStats = () => {
    if (!stats || !stats.method_stats) return null;
    
    return Object.entries(stats.method_stats).map(([method, count]) => (
      <div key={method} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-700 text-sm sm:text-base">{method}</h3>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-xs text-gray-500">Loans</p>
                <p className="text-lg font-semibold text-gray-800">{count}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-lg font-semibold text-gray-800">
                  ${stats.method_amounts[method]?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-100 p-2 rounded-full text-blue-500">
            <CreditCard size={20} />
          </div>
        </div>
      </div>
    ));
  };
  
  if (loading && !refreshing && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-600 text-sm font-medium">Loading statistics...</p>
      </div>
    );
  }
  
  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          className="mt-3 px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-medium"
          onClick={loadStats}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 rounded-xl shadow-sm overflow-hidden">
      {/* Header with filter toggle */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center text-lg">
          <BarChart3 size={20} className="mr-2 text-blue-500" />
          Loan Statistics
        </h2>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className={`p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Refresh statistics"
          >
            <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center"
          >
            <Calendar size={18} className="mr-1" />
            <span className="text-sm">Filter</span>
            {showFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </button>
        </div>
      </div>
      
      {/* Date filter controls */}
      {showFilters && (
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Statistics summary */}
      <div className="p-4">
        {/* Main statistics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-700 text-sm sm:text-base">Total Loans</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats?.total_loans || 0}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full text-blue-500">
                <CreditCard size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-700 text-sm sm:text-base">Total Amount</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  ${stats?.total_amount?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full text-green-500">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-700 text-sm sm:text-base">Average Loan</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  ${stats?.average_amount?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full text-purple-500">
                <BarChart3 size={24} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment method stats */}
        <h3 className="font-medium text-gray-700 mb-3">Payment Methods</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {renderMethodStats()}
        </div>
      </div>
      
      {/* Floating refresh indicator */}
      {refreshing && (
        <div className="fixed bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-gray-200 z-20">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Refreshing...</span>
        </div>
      )}
    </div>
  );
};

export default LoanStatistics;