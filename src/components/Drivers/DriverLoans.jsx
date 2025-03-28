import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import { 
  Plus, Trash2, Calendar, DollarSign, RefreshCw, 
  AlertTriangle, LockIcon, ArrowLeft, User, CreditCard,
  Clock, Info, Check
} from 'lucide-react';
import { useAuth } from '../AuthContext';

// Permission level required for add/delete operations
const REQUIRED_PERMISSION_LEVEL = 3;

const DriverLoans = () => {
  const { id } = useParams();
  const [loans, setLoans] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalLoans: 0,
    totalAmount: 0,
    averageAmount: 0
  });
  const navigate = useNavigate();
  
  // Get auth context to check permissions
  const { hasMinPermissionLevel } = useAuth();
  
  // Check if user has required permission level
  const canAddDelete = hasMinPermissionLevel(REQUIRED_PERMISSION_LEVEL);
  
  // Track if the component is mounted
  const isMounted = useRef(true);
  
  // Track data loading state
  const isLoadingRef = useRef(false);
  const initialLoadDone = useRef(false);
  
  // Group loans by year and month
  const groupLoansByYearMonth = (loansList) => {
    return loansList.reduce((acc, loan) => {
      const date = new Date(loan.date);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });
      
      if (!acc[year]) {
        acc[year] = {};
      }
      
      if (!acc[year][month]) {
        acc[year][month] = [];
      }
      
      acc[year][month].push(loan);
      return acc;
    }, {});
  };
  
  // Calculate loan statistics
  const calculateStats = (loansList) => {
    if (!loansList || loansList.length === 0) {
      return {
        totalLoans: 0,
        totalAmount: 0,
        averageAmount: 0
      };
    }
    
    const totalLoans = loansList.length;
    const totalAmount = loansList.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
    const averageAmount = totalAmount / totalLoans;
    
    return {
      totalLoans,
      totalAmount,
      averageAmount
    };
  };
  
  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return '$' + parseFloat(value).toFixed(2);
  };
  
  // Separate implementation to avoid dependency issues
  const loadDataImpl = async (driverId, shouldForceRefresh = false) => {
    // Prevent multiple concurrent loads
    if (isLoadingRef.current && !shouldForceRefresh) return;
    isLoadingRef.current = true;
    
    if (!isMounted.current) {
      isLoadingRef.current = false;
      return;
    }
    
    setLoading(true);
    
    try {
      // Get driver info - only if needed
      if (!driver || shouldForceRefresh) {
        const profileResponse = await apiClient.post(
          '/api/GetDriverProfileData',
          {},
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 4000
          }
        );
        
        if (!isMounted.current) {
          isLoadingRef.current = false;
          return;
        }
        
        if (profileResponse.data) {
          const driverData = profileResponse.data.find(d => d.ID.toString() === driverId);
          if (driverData) {
            setDriver(driverData);
          }
        }
      }
      
      // Get driver loans
      const loansResponse = await apiClient.post(
        '/api/GetDriverLoans',
        { id: parseInt(driverId) },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 4000
        }
      );
      
      if (!isMounted.current) {
        isLoadingRef.current = false;
        return;
      }
      
      if (loansResponse.data && loansResponse.data.length > 0) {
        // Sort loans by date (newest first)
        const sortedLoans = [...loansResponse.data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setLoans(sortedLoans);
        
        // Calculate stats
        setStats(calculateStats(sortedLoans));
      } else {
        setLoans([]);
        setStats({
          totalLoans: 0,
          totalAmount: 0,
          averageAmount: 0
        });
      }
    } catch (err) {
      if (!isMounted.current) {
        isLoadingRef.current = false;
        return;
      }
      console.error(err);
      setError("Failed to load driver loans");
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
        initialLoadDone.current = true;
      }
      isLoadingRef.current = false;
    }
  };
  
  // Effect for initial load and ID changes
  useEffect(() => {
    // Set component as mounted
    isMounted.current = true;
    
    // Only load data if we haven't loaded yet or if the ID has changed
    if (!initialLoadDone.current || id) {
      loadDataImpl(id);
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [id]); // Only depend on ID
  
  const handleRefresh = () => {
    if (refreshing) return; // Prevent multiple refreshes
    setRefreshing(true);
    loadDataImpl(id, true); // Force refresh
  };
  
  const confirmDeleteLoan = (loan) => {
    if (!canAddDelete) return;
    setLoanToDelete(loan);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteLoan = async () => {
    if (!loanToDelete || !canAddDelete) return;
    
    setDeleting(true);
    try {
      const response = await apiClient.post(
        '/api/DeleteLoan',
        { id: loanToDelete.ID },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 4000
        }
      );
      
      if (response.status === 200) {
        // Remove the deleted loan from the state
        const updatedLoans = loans.filter(loan => loan.ID !== loanToDelete.ID);
        setLoans(updatedLoans);
        
        // Recalculate stats
        setStats(calculateStats(updatedLoans));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete loan");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setLoanToDelete(null);
    }
  };
  
  const handleAddLoan = () => {
    if (!canAddDelete) return;
    navigate(`/driver/loans/${id}/add`);
  };
  
  const navigateToDriver = () => {
    navigate(`/driver/${id}`);
  };
  
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-4">Loading driver loans...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <p className="text-red-700 font-medium mb-2 text-xl">Error Loading Loans</p>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            onClick={() => loadDataImpl(id)}
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  const groupedLoansByYearMonth = groupLoansByYearMonth(loans);
  const yearsInDescendingOrder = Object.keys(groupedLoansByYearMonth).sort((a, b) => b - a);
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={navigateToDriver} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Back to Driver</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <CreditCard size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Loans</h1>
                <p className="text-gray-500 mt-1">{driver?.name || 'Driver'}</p>
              </div>
            </div>
            
            <div className="flex mt-4 md:mt-0 gap-2">
              {!canAddDelete && (
                <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm flex items-center">
                  <LockIcon size={14} className="mr-1" />
                  <span>View Only</span>
                </div>
              )}
              
              <button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
                aria-label="Refresh loans"
                title="Refresh loans"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>
              
              {canAddDelete && (
                <button 
                  onClick={handleAddLoan} 
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  <span>Add Loan</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Summary */}
        {loans.length > 0 && (
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Total Loans */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Loans</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalLoans}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <CreditCard size={20} />
                  </div>
                </div>
              </div>
              
              {/* Total Amount */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <DollarSign size={20} />
                  </div>
                </div>
              </div>
              
              {/* Average Loan */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Average Loan</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.averageAmount)}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                    <Calculator size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Loans Content */}
        <div className="p-6">
          {loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-gray-100 p-6 rounded-full text-gray-400 mb-4">
                <DollarSign size={64} />
              </div>
              <p className="text-lg text-gray-800 font-medium mb-2">No loans found</p>
              <p className="text-gray-500 mb-6 text-center">This driver doesn't have any recorded loans yet.</p>
              
              {canAddDelete && (
                <button 
                  onClick={handleAddLoan} 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Register Loan
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {yearsInDescendingOrder.map(year => (
                <div key={year} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-gray-800 text-white font-semibold text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar size={18} className="mr-2" />
                      <span>{year}</span>
                    </div>
                    <div className="bg-white bg-opacity-20 text-sm px-2 py-0.5 rounded-full">
                      {Object.values(groupedLoansByYearMonth[year]).flat().length} loans
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {Object.keys(groupedLoansByYearMonth[year]).map(month => (
                      <div key={`${year}-${month}`} className="p-4">
                        <div className="flex items-center px-3 py-2 mb-3 bg-blue-50 rounded-lg text-sm font-medium text-blue-700">
                          <Calendar size={16} className="mr-2" />
                          <span>{month}</span>
                        </div>
                        <div className="space-y-3">
                          {groupedLoansByYearMonth[year][month].map(loan => (
                            <div 
                              key={loan.ID} 
                              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-all hover:shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-full text-green-600">
                                  <DollarSign size={20} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-800">
                                    {formatCurrency(loan.amount)}
                                  </h3>
                                  <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Clock size={14} className="mr-1" />
                                      <span>{new Date(loan.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Info size={14} className="mr-1" />
                                      <span>{loan.method}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {canAddDelete && (
                                <button 
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  onClick={() => confirmDeleteLoan(loan)}
                                  title="Delete loan"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
      
      {/* Delete Confirmation Dialog - Only shown if user has permission */}
      {showDeleteConfirm && loanToDelete && canAddDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Delete Loan</h3>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete this loan of {formatCurrency(loanToDelete.amount)} ({loanToDelete.method}) from {loanToDelete.date}? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                className="px-4 py-2 sm:py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium flex-1 flex items-center justify-center"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex-1 flex items-center justify-center disabled:bg-red-300"
                onClick={handleDeleteLoan}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-white border-white border-opacity-20 rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Delete Loan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Calculator icon component
const Calculator = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={props.className}
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="8" x2="8" y1="14" y2="14" />
      <line x1="12" x2="12" y1="14" y2="14" />
      <line x1="16" x2="16" y1="14" y2="14" />
      <line x1="8" x2="8" y1="18" y2="18" />
      <line x1="12" x2="12" y1="18" y2="18" />
      <line x1="16" x2="16" y1="18" y2="18" />
    </svg>
  );
};

export default DriverLoans;