import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import { 
  ArrowLeft, Save, AlertTriangle, X, DollarSign, 
  Calendar, Receipt, CreditCard, CheckCircle, 
  FileText, RefreshCw, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../AuthContext';

// Permission level required for creating salaries
const REQUIRED_PERMISSION_LEVEL = 3;

const AddDriverSalary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasMinPermissionLevel } = useAuth();
  
  // Check if user has required permission level
  const canAddDriverSalary = hasMinPermissionLevel(REQUIRED_PERMISSION_LEVEL);
  
  // State for form data
  const [formData, setFormData] = useState({
    driverID: id ? parseInt(id) : 0,
    driverCost: '',
    startDate: '',
    closeDate: ''
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [driver, setDriver] = useState(null);
  const [preview, setPreview] = useState({
    expenses: [],
    loans: [],
    totalExpenses: 0,
    totalLoans: 0,
    expensesCount: 0,
    loansCount: 0
  });
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [showAllLoans, setShowAllLoans] = useState(false);
  
  // Track mounted state
  const isMounted = useRef(true);
  const previewTimeoutRef = useRef(null);
  
  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return '$' + parseFloat(value).toFixed(2);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Calculate net amount
  const calculateNetAmount = () => {
    const driverCost = parseFloat(formData.driverCost) || 0;
    return driverCost - (preview.totalLoans - preview.totalExpenses);
  };
  
  // Fetch preview data
  const loadPreviewData = async () => {
    if (!formData.startDate || !formData.closeDate || !formData.driverID) {
      return;
    }
    
    setPreviewLoading(true);
    setPreviewError(null);
    
    try {
      const response = await apiClient.post(
        '/api/GetDriverSalaryPreview',
        {
          driver_id: formData.driverID,
          start_date: formData.startDate,
          close_date: formData.closeDate
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
      
      if (!isMounted.current) return;
      
      if (response.data) {
        setPreview({
          expenses: response.data.expenses || [],
          loans: response.data.loans || [],
          totalExpenses: response.data.total_expenses || 0,
          totalLoans: response.data.total_loans || 0,
          expensesCount: response.data.expenses_count || 0,
          loansCount: response.data.loans_count || 0
        });
        
        // Set driver name if available and not already set
        if (response.data.driver_name && !driver) {
          setDriver({ name: response.data.driver_name });
        }
      }
    } catch (err) {
      console.error('Error fetching preview data:', err);
      if (isMounted.current) {
        setPreviewError('Failed to load preview data. Please check your dates and try again.');
      }
    } finally {
      if (isMounted.current) {
        setPreviewLoading(false);
      }
    }
  };
  
  // Check for permission on load
  useEffect(() => {
    if (!canAddDriverSalary) {
      // Redirect if no permission
      if (id) {
        navigate(`/driver/salaries/${id}`);
      } else {
        navigate('/salaries');
      }
    }
    
    // Set mounted state
    isMounted.current = true;
    
    // Default dates to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setFormData(prev => ({
      ...prev,
      startDate: firstDay.toISOString().split('T')[0],
      closeDate: lastDay.toISOString().split('T')[0]
    }));
    
    // Clean up function
    return () => {
      isMounted.current = false;
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [canAddDriverSalary, id, navigate]);
  
  // Fetch driver data
  useEffect(() => {
    const fetchDriverData = async () => {
      if (!id) return;
      
      try {
        const response = await apiClient.post(
          '/api/GetDriverProfileData',
          {},
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 4000
          }
        );
        
        if (!isMounted.current) return;
        
        if (response.data) {
          const driverData = response.data.find(d => d.ID.toString() === id);
          if (driverData) {
            setDriver(driverData);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted.current) {
          setError("Failed to load driver data");
        }
      }
    };
    
    fetchDriverData();
  }, [id]);
  
  // Load preview data when dates change
  useEffect(() => {
    if (formData.startDate && formData.closeDate && formData.driverID) {
      // Clear any existing timeout
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
      
      // Add a small delay to prevent too many requests when typing
      previewTimeoutRef.current = setTimeout(() => {
        loadPreviewData();
      }, 300);
    }
  }, [formData.startDate, formData.closeDate, formData.driverID]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user makes changes
    if (error) {
      setError(null);
    }
  };
  
  // Validate form
  const validateForm = () => {
    if (!formData.driverID) {
      setError('Driver ID is required');
      return false;
    }
    
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    
    if (!formData.closeDate) {
      setError('Close date is required');
      return false;
    }
    
    if (!formData.driverCost || parseFloat(formData.driverCost) <= 0) {
      setError('Please enter a valid driver cost greater than zero');
      return false;
    }
    
    // Check that start date is before or equal to close date
    if (new Date(formData.startDate) > new Date(formData.closeDate)) {
      setError('Start date must be before or equal to close date');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(
        '/api/RegisterDriverSalary',
        {
          driver_id: formData.driverID,
          driver_cost: parseFloat(formData.driverCost),
          start_date: formData.startDate,
          close_date: formData.closeDate
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 6000
        }
      );
      
      if (!isMounted.current) return;
      
      if (response.data && response.data.message) {
        setSuccess(true);
        
        // Redirect after short delay
        setTimeout(() => {
          if (isMounted.current) {
            navigate(id ? `/driver/salaries/${id}` : '/salaries');
          }
        }, 2000);
      } else {
        throw new Error("Failed to register salary");
      }
    } catch (err) {
      console.error(err);
      if (isMounted.current) {
        setError(err.response?.data?.error || err.message || "An error occurred while creating the salary record");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  // Navigate back
  const navigateBack = () => {
    navigate(id ? `/driver/salaries/${id}` : '/salaries');
  };
  
  // Refresh preview data
  const handleRefreshPreview = () => {
    if (!previewLoading) {
      loadPreviewData();
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={navigateBack} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Back to Salaries</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-full text-blue-600">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Salary Record</h1>
              <p className="text-blue-100 mt-1">
                {driver?.name || 'Select a driver and date range'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="text-green-700 font-medium">Salary Created Successfully</p>
                <p className="text-green-600 text-sm mt-1">The salary record has been created and expenses have been marked as paid. Redirecting...</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div className="space-y-5">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <Calendar size={18} className="mr-2 text-blue-500" />
                Date Range
              </h3>
              
              <div className="space-y-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading || success}
                  />
                </div>
                
                {/* Close Date */}
                <div className="space-y-2">
                  <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700">
                    Close Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="closeDate"
                    name="closeDate"
                    value={formData.closeDate}
                    onChange={handleInputChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading || success}
                  />
                </div>
                
                {/* Driver Cost */}
                <div className="space-y-2">
                  <label htmlFor="driverCost" className="block text-sm font-medium text-gray-700">
                    Driver Cost <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="driverCost"
                      name="driverCost"
                      value={formData.driverCost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="block w-full pl-8 py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={loading || success}
                    />
                  </div>
                </div>
              </div>
              
              {/* Summary Card */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                <h4 className="font-medium text-blue-800 mb-3">Salary Summary</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                    <span className="text-gray-700">Period</span>
                    <span className="font-medium">
                      {formatDate(formData.startDate)} - {formatDate(formData.closeDate)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-700">Driver Cost</span>
                    <span className="font-medium text-blue-700">
                      {formatCurrency(formData.driverCost)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-700">Total Expenses</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(preview.totalExpenses)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-700">Total Loans</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(preview.totalLoans)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                    <span className="font-medium text-gray-800">Net Amount</span>
                    <span className="font-bold text-lg text-purple-700">
                      {formatCurrency(calculateNetAmount())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview Panel */}
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <Receipt size={18} className="mr-2 text-blue-500" />
                  Preview
                </h3>
                
                <button 
                  type="button"
                  onClick={handleRefreshPreview}
                  disabled={previewLoading}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <RefreshCw size={16} className={previewLoading ? 'animate-spin' : ''} />
                </button>
              </div>
              
              {/* Preview Error */}
              {previewError && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                  <div className="flex">
                    <Info size={16} className="mr-2 flex-shrink-0" />
                    <p>{previewError}</p>
                  </div>
                </div>
              )}
              
              {/* Preview Loading */}
              {previewLoading && (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Preview Content */}
              {!previewLoading && (
                <div className="space-y-4">
                  {/* Expenses Section */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <Receipt size={16} className="mr-2 text-red-500" />
                        <span className="font-medium">Expenses</span>
                        <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                          {preview.expensesCount}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowAllExpenses(!showAllExpenses)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        {showAllExpenses ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    
                    {preview.expensesCount === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No unpaid expenses in this date range
                      </div>
                    ) : (
                      <div className="p-3">
                        <div className="text-sm text-gray-600 mb-2">
                          These expenses will be marked as paid:
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {/* Show limited or all expenses based on toggle */}
                          {(showAllExpenses ? preview.expenses : preview.expenses.slice(0, 3)).map(expense => (
                            <div 
                              key={expense.ID} 
                              className="bg-white p-2 rounded border border-gray-200 flex justify-between"
                            >
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-800">{formatCurrency(expense.cost)}</span>
                                  {expense.category && (
                                    <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                      {expense.category}
                                    </span>
                                  )}
                                </div>
                                {expense.description && (
                                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{expense.description}</p>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(expense.date)}
                              </div>
                            </div>
                          ))}
                          
                          {/* Show view more/less button if needed */}
                          {preview.expenses.length > 3 && !showAllExpenses && (
                            <button 
                              type="button"
                              onClick={() => setShowAllExpenses(true)}
                              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 p-1"
                            >
                              View all {preview.expensesCount} expenses
                            </button>
                          )}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Expenses:</span>
                          <span className="font-medium text-red-600">{formatCurrency(preview.totalExpenses)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Loans Section */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <CreditCard size={16} className="mr-2 text-green-500" />
                        <span className="font-medium">Loans</span>
                        <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          {preview.loansCount}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowAllLoans(!showAllLoans)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        {showAllLoans ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    
                    {preview.loansCount === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No loans in this date range
                      </div>
                    ) : (
                      <div className="p-3">
                        <div className="text-sm text-gray-600 mb-2">
                          These loans will be included:
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {/* Show limited or all loans based on toggle */}
                          {(showAllLoans ? preview.loans : preview.loans.slice(0, 3)).map(loan => (
                            <div 
                              key={loan.ID} 
                              className="bg-white p-2 rounded border border-gray-200 flex justify-between"
                            >
                              <div className="font-medium text-gray-800">
                                {formatCurrency(loan.amount)}
                                {loan.method && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    via {loan.method}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(loan.date)}
                              </div>
                            </div>
                          ))}
                          
                          {/* Show view more/less button if needed */}
                          {preview.loans.length > 3 && !showAllLoans && (
                            <button 
                              type="button"
                              onClick={() => setShowAllLoans(true)}
                              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 p-1"
                            >
                              View all {preview.loansCount} loans
                            </button>
                          )}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Loans:</span>
                          <span className="font-medium text-green-600">{formatCurrency(preview.totalLoans)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={navigateBack}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
              disabled={loading || success}
            >
              <X size={18} className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center disabled:bg-blue-300"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-white border-white border-opacity-20 rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Created!
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Create Salary
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDriverSalary;