import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import { 
  Plus, Calendar, DollarSign, RefreshCw, 
  AlertTriangle, LockIcon, ArrowLeft, FileText,
  Clock, Filter, ChevronsUpDown, ChevronDown, ChevronUp, Download
} from 'lucide-react';
import { useAuth } from '../AuthContext';

// Permission level required for add/operations
const REQUIRED_PERMISSION_LEVEL = 3;

const DriverSalaries = () => {
  const { id } = useParams();
  const [salaries, setSalaries] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    totalCount: 0,
    totalCost: 0,
    totalExpenses: 0,
    totalLoans: 0,
    netPaid: 0
  });
  
  // Filtering
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: ''
  });
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });
  
  const navigate = useNavigate();
  
  // Get auth context to check permissions
  const { hasMinPermissionLevel } = useAuth();
  
  // Check if user has required permission level
  const canAddSalary = hasMinPermissionLevel(REQUIRED_PERMISSION_LEVEL);
  
  // Track if the component is mounted
  const isMounted = useRef(true);
  
  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return '$' + parseFloat(value).toFixed(2);
  };
  
  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Function to load salaries data
  const loadSalaries = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await apiClient.post(
        '/api/GetDriverSalaries',
        {
          driver_id: id ? parseInt(id) : 0,
          from_date: filters.fromDate,
          to_date: filters.toDate
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
      
      if (!isMounted.current) return;
      
      if (response.data) {
        // Set salaries data
        setSalaries(response.data.salaries || []);
        
        // Set driver info if available
        if (response.data.driver_name && !driver) {
          setDriver({ name: response.data.driver_name });
        }
        
        // Set summary data
        setSummary({
          totalCount: response.data.total_count || 0,
          totalCost: response.data.summary?.total_cost || 0,
          totalExpenses: response.data.summary?.total_expenses || 0,
          totalLoans: response.data.summary?.total_loans || 0,
          netPaid: response.data.summary?.net_paid || 0
        });
      }
    } catch (err) {
      if (!isMounted.current) return;
      console.error(err);
      setError('Failed to load salaries data');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };
  
  // Initial data loading
  useEffect(() => {
    isMounted.current = true;
    loadSalaries();
    
    // Clean up
    return () => {
      isMounted.current = false;
    };
  }, [id]);
  
  // Load data when filters change
  useEffect(() => {
    if (!loading) {
      loadSalaries();
    }
  }, [filters]);
  
  // Handle refresh button
  const handleRefresh = () => {
    if (refreshing) return;
    loadSalaries(true);
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: ''
    });
  };
  
  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sorted salaries
  const getSortedSalaries = () => {
    const sortableItems = [...salaries];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle dates
        if (sortConfig.key === 'start_date' || sortConfig.key === 'close_date' || sortConfig.key === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  };
  
  // Navigate to create salary page
  const navigateToCreateSalary = () => {
    navigate(id ? `/driver/salaries/${id}/add` : '/salaries/add');
  };
  
  // Navigate back to driver page
  const navigateToDriver = () => {
    navigate(`/driver/${id}`);
  };
  
  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-4">Loading salaries data...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <p className="text-red-700 font-medium mb-2 text-xl">Error Loading Salaries</p>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            onClick={() => loadSalaries()}
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  const sortedSalaries = getSortedSalaries();
  
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Breadcrumb - Only show if viewing a specific driver */}
      {id && (
        <div className="mb-6">
          <button 
            onClick={navigateToDriver} 
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>Back to Driver</span>
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Salary Records</h1>
                {driver && <p className="text-gray-500 mt-1">{driver.name}</p>}
              </div>
            </div>
            
            <div className="flex mt-4 md:mt-0 gap-2">
              {!canAddSalary && (
                <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm flex items-center">
                  <LockIcon size={14} className="mr-1" />
                  <span>View Only</span>
                </div>
              )}
              
              <button 
                onClick={toggleFilters} 
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
                aria-label="Toggle filters"
                title="Toggle filters"
              >
                <Filter size={20} />
              </button>
              
              <button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
                aria-label="Refresh salaries"
                title="Refresh salaries"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>
              
              {canAddSalary && (
                <button 
                  onClick={navigateToCreateSalary} 
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  <span>Create Salary</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input 
                  type="date" 
                  id="fromDate" 
                  name="fromDate" 
                  value={filters.fromDate} 
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input 
                  type="date" 
                  id="toDate" 
                  name="toDate" 
                  value={filters.toDate} 
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Summary Stats */}
        {salaries.length > 0 && (
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Records */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Records</p>
                    <p className="text-xl font-bold text-gray-800">{summary.totalCount}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <FileText size={18} />
                  </div>
                </div>
              </div>
              
              {/* Total Driver Cost */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Driver Cost</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.totalCost)}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <DollarSign size={18} />
                  </div>
                </div>
              </div>
              
              {/* Total Expenses */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Expenses</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
                  </div>
                  <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <DollarSign size={18} />
                  </div>
                </div>
              </div>
              
              {/* Total Loans */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Loans</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalLoans)}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <DollarSign size={18} />
                  </div>
                </div>
              </div>
              
              {/* Net Paid */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Net Paid</p>
                    <p className="text-xl font-bold text-purple-600">{formatCurrency(summary.netPaid)}</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                    <DollarSign size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Salaries Content */}
        <div className="p-6">
          {salaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-gray-100 p-6 rounded-full text-gray-400 mb-4">
                <FileText size={64} />
              </div>
              <p className="text-lg text-gray-800 font-medium mb-2">No salary records found</p>
              <p className="text-gray-500 mb-6 text-center">
                {id ? "This driver doesn't have any salary records yet." : "No salary records found with the current filters."}
              </p>
              
              {canAddSalary && (
                <button 
                  onClick={navigateToCreateSalary} 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Create Salary Record
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">
                      <button 
                        onClick={() => handleSort('ID')}
                        className="flex items-center font-medium"
                      >
                        ID
                        <span className="ml-1">
                          {sortConfig.key === 'ID' ? (
                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} className="text-gray-400" />
                          )}
                        </span>
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button 
                        onClick={() => handleSort('driver_id')}
                        className="flex items-center font-medium"
                      >
                        Driver
                        <span className="ml-1">
                          {sortConfig.key === 'driver_id' ? (
                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} className="text-gray-400" />
                          )}
                        </span>
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button 
                        onClick={() => handleSort('start_date')}
                        className="flex items-center font-medium"
                      >
                        Period
                        <span className="ml-1">
                          {sortConfig.key === 'start_date' ? (
                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} className="text-gray-400" />
                          )}
                        </span>
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button 
                        onClick={() => handleSort('driver_cost')}
                        className="flex items-center font-medium"
                      >
                        Driver Cost
                        <span className="ml-1">
                          {sortConfig.key === 'driver_cost' ? (
                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} className="text-gray-400" />
                          )}
                        </span>
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button 
                        onClick={() => handleSort('total_expenses')}
                        className="flex items-center font-medium"
                      >
                        Expenses
                        <span className="ml-1">
                          {sortConfig.key === 'total_expenses' ? (
                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} className="text-gray-400" />
                          )}
                        </span>
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button 
                        onClick={() => handleSort('total_loans')}
                        className="flex items-center font-medium"
                      >
                        Loans
                        <span className="ml-1">
                          {sortConfig.key === 'total_loans' ? (
                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} className="text-gray-400" />
                          )}
                        </span>
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <span className="font-medium">Net Amount</span>
                    </th>
                    <th className="px-4 py-3">
                      <span className="font-medium">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSalaries.map((salary) => {
                    // Calculate net amount
                    const netAmount = salary.driver_cost - (salary.total_loans - salary.total_expenses);
                    
                    return (
                      <tr key={salary.ID} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{salary.ID}</td>
                        <td className="px-4 py-3">{driver ? driver.name : `Driver ${salary.driver_id}`}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span>{formatDate(salary.start_date)}</span>
                            <span className="text-gray-500 text-xs">to</span>
                            <span>{formatDate(salary.close_date)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-blue-600 font-medium">{formatCurrency(salary.driver_cost)}</td>
                        <td className="px-4 py-3 text-red-600">{formatCurrency(salary.total_expenses)}</td>
                        <td className="px-4 py-3 text-green-600">{formatCurrency(salary.total_loans)}</td>
                        <td className="px-4 py-3 font-medium text-purple-600">{formatCurrency(netAmount)}</td>
                        <td className="px-4 py-3">
                          <button 
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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

export default DriverSalaries;