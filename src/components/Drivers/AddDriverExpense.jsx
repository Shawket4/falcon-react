import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import { 
  ArrowLeft, Receipt, Save, AlertTriangle, X, Calendar,
  DollarSign, Tag, FileText, CreditCard, CheckCircle
} from 'lucide-react';
import { useAuth } from '../AuthContext';

// Permission level required for adding expenses
const REQUIRED_PERMISSION_LEVEL = 3;

const AddDriverExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasMinPermissionLevel } = useAuth();
  
  // Check if user has required permission level
  const canAddDriverExpense = hasMinPermissionLevel(REQUIRED_PERMISSION_LEVEL);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    payment_method: 'Cash'
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [driver, setDriver] = useState(null);
  const [driverLoading, setDriverLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Track mounted state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Expense categories
  const categories = [
    'Fuel',
    'Maintenance',
    'Repairs',
    'Insurance',
    'Tickets',
    'Tolls',
    'Parking',
    'Meals',
    'Accommodation',
    'Phone',
    'Equipment',
    'Supplies',
    'Training',
    'Other'
  ];
  
  // Payment methods
  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Mobile Payment',
    'Bank Transfer',
    'Company Card',
    'Reimbursement',
    'Other'
  ];
  
  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!canAddDriverExpense) {
      navigate(`/driver/expenses/${id}`);
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [canAddDriverExpense, id, navigate]);
  
  // Fetch driver data
  useEffect(() => {
    const fetchDriverData = async () => {
      setDriverLoading(true);
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
          } else {
            setError("Driver not found");
          }
        }
      } catch (err) {
        if (!isMounted.current) return;
        console.error(err);
        setError("Failed to load driver data");
      } finally {
        if (isMounted.current) {
          setDriverLoading(false);
        }
      }
    };
    
    fetchDriverData();
  }, [id]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };
  
  const validateForm = () => {
    // Validate amount
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount greater than zero");
      return false;
    }
    
    // Validate date
    if (!formData.date) {
      setError("Please select a date");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Submit the expense
      const response = await apiClient.post(
        '/api/RegisterDriverExpense',
        {
            expense: {     
            cost: parseFloat(formData.amount),
            date: formData.date,
            category: formData.category || 'Uncategorized',
            description: formData.description,
            payment_method: formData.payment_method,
            driver_id: parseInt(id)
            }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 6000
        }
      );
      
      if (!isMounted.current) return;
      
      if (response.data && response.data.message) {
        // Show success message briefly before navigating
        setShowSuccess(true);
        setTimeout(() => {
          if (isMounted.current) {
            navigate(`/driver/expenses/${id}`);
          }
        }, 1500);
      } else {
        throw new Error("Failed to register expense");
      }
    } catch (err) {
      if (!isMounted.current) return;
      console.error(err);
      setError(err.response?.data?.message || err.message || "An error occurred while registering the expense");
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  const cancelAndGoBack = () => {
    navigate(`/driver/expenses/${id}`);
  };
  
  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return '$' + parseFloat(value).toFixed(2);
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={cancelAndGoBack} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Back to Expenses</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-full text-blue-600">
              <Receipt size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Add New Expense</h1>
              <p className="text-blue-100 mt-1">
                {driverLoading ? 'Loading driver info...' : 
                 driver?.name ? `Driver: ${driver.name}` : 'Driver not found'}
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
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="text-green-700 font-medium">Success!</p>
                <p className="text-green-600 text-sm mt-1">Expense registered successfully. Redirecting...</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount field */}
            <div className="space-y-2">
              <label htmlFor="amount" className="flex items-center text-sm font-medium text-gray-700">
                <DollarSign size={16} className="mr-1 text-gray-500" />
                Amount <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="block w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  disabled={loading || showSuccess}
                />
              </div>
              {formData.amount && (
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(formData.amount)}
                </p>
              )}
            </div>
            
            {/* Date field */}
            <div className="space-y-2">
              <label htmlFor="date" className="flex items-center text-sm font-medium text-gray-700">
                <Calendar size={16} className="mr-1 text-gray-500" />
                Date <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || showSuccess}
              />
            </div>
            
            {/* Category field */}
            <div className="space-y-2">
              <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700">
                <Tag size={16} className="mr-1 text-gray-500" />
                Category
              </label>
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleInputChange}
                className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || showSuccess}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Payment Method field */}
            <div className="space-y-2">
              <label htmlFor="payment_method" className="flex items-center text-sm font-medium text-gray-700">
                <CreditCard size={16} className="mr-1 text-gray-500" />
                Payment Method
              </label>
              <select
                name="payment_method"
                id="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || showSuccess}
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Description field - full width */}
          <div className="space-y-2">
            <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700">
              <FileText size={16} className="mr-1 text-gray-500" />
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter expense details..."
              disabled={loading || showSuccess}
            ></textarea>
            <p className="text-xs text-gray-500">
              Provide any additional information about this expense (optional)
            </p>
          </div>
          
          {/* Preview card */}
          {formData.amount && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Expense Preview</h3>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{formatCurrency(formData.amount)}</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {formData.category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {formData.category}
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {formData.date}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {formData.payment_method}
                      </span>
                    </div>
                    {formData.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{formData.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={cancelAndGoBack}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
              disabled={loading || showSuccess}
            >
              <X size={18} className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || showSuccess}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center disabled:bg-blue-300"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-white border-white border-opacity-20 rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDriverExpense;