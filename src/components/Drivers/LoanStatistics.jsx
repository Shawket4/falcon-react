import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, CreditCard, BarChart3, RefreshCw, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import apiClient from '../../apiClient';

const LoanStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Date filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Custom styles to override date picker default styling
  const customDatePickerStyles = `
    input[type="date"] {
      height: 42px;
      font-size: 0.95rem;
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
      margin-left: 0.5rem;
      opacity: 0.6;
      cursor: pointer;
    }
    input[type="date"]::-webkit-calendar-picker-indicator:hover {
      opacity: 0.9;
    }
  `;
  
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
  
  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return '$' + parseFloat(value).toFixed(2);
  };
  
  // Render method stats cards
  const renderMethodStats = () => {
    if (!stats || !stats.method_stats) return null;
    
    return Object.entries(stats.method_stats).map(([method, count]) => (
      <div key={method} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-800">{method}</h3>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Loans</p>
              <p className="text-xl font-semibold text-gray-800">{count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Amount</p>
              <p className="text-xl font-semibold text-blue-600">
                {formatCurrency(stats.method_amounts[method])}
              </p>
            </div>
          </div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <CreditCard size={22} />
          </div>
        </div>
      </div>
    ));
  };
  
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
  
  if (error && !stats) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
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
    <div className="space-y-6">
      <style>{customDatePickerStyles}</style>
      
      {/* Main container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <BarChart3 size={24} className="text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Loan Statistics</h2>
            </div>
            
            <div className="flex items-center gap-3">
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
          
          {/* Date Range Filter */}
          {showFilters && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="from-date" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <Calendar className="mr-2 text-gray-500" size={18} />
                    From Date
                  </label>
                  <div className="relative">
                    <input
                      id="from-date"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="to-date" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <Calendar className="mr-2 text-gray-500" size={18} />
                    To Date
                  </label>
                  <div className="relative">
                    <input
                      id="to-date"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {/* Total Loans Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                <h3 className="font-medium text-blue-700">Total Loans</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-800">{stats?.total_loans || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Loans processed</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <CreditCard size={24} />
                </div>
              </div>
            </div>
            
            {/* Total Amount Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                <h3 className="font-medium text-green-700">Total Amount</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-800">
                    {formatCurrency(stats?.total_amount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Funds distributed</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
            
            {/* Average Loan Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-purple-50 px-4 py-3 border-b border-purple-100">
                <h3 className="font-medium text-purple-700">Average Loan</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-800">
                    {formatCurrency(stats?.average_amount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Per transaction</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                  <BarChart3 size={24} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Methods Section */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Payment Methods
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderMethodStats()}
            </div>
          </div>
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

export default LoanStatistics;