import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { Plus, Trash2, Calendar, DollarSign, RefreshCw, AlertTriangle } from 'lucide-react';

const DriverLoans = ({ serverIp }) => {
  const { id } = useParams();
  const [loans, setLoans] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  
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
  
  const loadData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Get driver info
      const profileResponse = await apiClient.post(
        '/api/GetDriverProfileData',
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 4000
        }
      );
      
      if (profileResponse.data) {
        const driverData = profileResponse.data.find(d => d.ID.toString() === id);
        if (driverData) {
          setDriver(driverData);
        }
      }
      
      // Get driver loans
      const loansResponse = await apiClient.post(
        '/api/GetDriverLoans',
        { id: parseInt(id) },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 4000
        }
      );
      
      if (loansResponse.data && loansResponse.data.length > 0) {
        // Sort loans by date (newest first)
        const sortedLoans = [...loansResponse.data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setLoans(sortedLoans);
      } else {
        setLoans([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load driver loans");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, serverIp]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  const confirmDeleteLoan = (loan) => {
    setLoanToDelete(loan);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteLoan = async () => {
    if (!loanToDelete) return;
    
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
        setLoans(loans.filter(loan => loan.ID !== loanToDelete.ID));
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
    navigate(`/driver/loans/${id}/add`);
  };
  
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading driver loans...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-red-500">
          <AlertTriangle size={48} />
        </div>
        <p className="text-gray-800 font-medium">{error}</p>
        <button 
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
          onClick={loadData}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  const groupedLoansByYearMonth = groupLoansByYearMonth(loans);
  const yearsInDescendingOrder = Object.keys(groupedLoansByYearMonth).sort((a, b) => b - a);
  
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">{driver?.name || 'Driver'} - Loans</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh} 
            className="p-2 text-gray-600 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleAddLoan} 
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} className="mr-1" />
            <span>Add Loan</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-gray-400 mb-4">
              <DollarSign size={64} />
            </div>
            <p className="text-gray-600 mb-6">No loans found for this driver</p>
            <button 
              onClick={handleAddLoan} 
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Register Loan
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {yearsInDescendingOrder.map(year => (
              <div key={year} className="py-3">
                <div className="px-4 py-2 bg-gray-100 font-semibold text-gray-800 text-lg flex items-center">
                  <Calendar size={18} className="mr-2" />
                  {year}
                </div>
                {Object.keys(groupedLoansByYearMonth[year]).map(month => (
                  <div key={`${year}-${month}`} className="px-4 py-3">
                    <div className="flex items-center px-3 py-1 mb-2 bg-gray-50 rounded text-sm font-medium text-gray-700">
                      <span>{month}</span>
                    </div>
                    <div className="space-y-2 pl-2">
                      {groupedLoansByYearMonth[year][month].map(loan => (
                        <div 
                          key={loan.ID} 
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">
                              {loan.amount} ({loan.method})
                            </h3>
                            <p className="text-sm text-gray-500">{loan.date}</p>
                          </div>
                          <button 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            onClick={() => confirmDeleteLoan(loan)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {refreshing && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <div className="w-6 h-6 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mr-3"></div>
            <p className="text-gray-600">Refreshing...</p>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && loanToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <Trash2 size={24} className="text-red-500 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Delete Loan</h3>
            </div>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this loan of {loanToDelete.amount} ({loanToDelete.method}) from {loanToDelete.date}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-red-300"
                onClick={handleDeleteLoan}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverLoans;