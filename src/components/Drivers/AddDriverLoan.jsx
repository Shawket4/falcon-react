import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { Calendar, Save, AlertTriangle, Check, ArrowLeft, DollarSign, CreditCard, User } from 'lucide-react';
import apiClient from '../../apiClient';

const AddDriverLoan = ({ serverIp }) => {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  
  // Custom styles to override react-datepicker default styling
  const customDatePickerStyles = `
    .react-datepicker {
      font-family: inherit;
      font-size: 0.9rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .react-datepicker__header {
      background-color: #f3f4f6;
      border-bottom: 1px solid #e5e7eb;
      padding-top: 0.75rem;
    }
    .react-datepicker__current-month {
      font-weight: 600;
      font-size: 1rem;
    }
    .react-datepicker__day--selected {
      background-color: #3b82f6;
      border-radius: 0.25rem;
    }
    .react-datepicker__day:hover {
      background-color: #dbeafe;
      border-radius: 0.25rem;
    }
    .react-datepicker__day--keyboard-selected {
      background-color: #93c5fd;
      border-radius: 0.25rem;
    }
    .react-datepicker__navigation {
      top: 0.75rem;
    }
    .react-datepicker__day {
      margin: 0.2rem;
      width: 2rem;
      line-height: 2rem;
    }
    .react-datepicker__day-name {
      margin: 0.2rem;
      width: 2rem;
    }
    .react-datepicker__month-container {
      padding: 0.5rem;
    }
  `;
  
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const response = await apiClient.post(
          `/api/GetDriverProfileData`,
          {},
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 4000
          }
        );
        
        if (response.data) {
          const driverData = response.data.find(d => d.ID.toString() === id);
          if (driverData) {
            setDriver(driverData);
          } else {
            setError("Driver not found");
          }
        }
      } catch (err) {
        console.error("Failed to fetch driver data:", err);
        setError("Error loading driver data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverData();
  }, [id, serverIp]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date || !amount || !method) {
      alert("Please fill all required fields");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await apiClient.post(
        `/api/RegisterDriverLoan/`,
        {
          driver_id: parseInt(id),
          loan: {
            date: format(date, 'yyyy-MM-dd'),
            amount: parseFloat(amount),
            method: method
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 4000
        }
      );
      
      if (response.status === 200) {
        setShowSuccess(true);
      } else {
        setShowError(true);
      }
    } catch (err) {
      console.error("Failed to register loan:", err);
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/driver/loans/${id}`);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-4">Loading driver data...</p>
      </div>
    );
  }
  
  if (error && !showError) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <p className="text-red-700 font-medium mb-2 text-xl">Error Loading Driver</p>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            onClick={() => navigate(`/driver/${id}`)}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Driver
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={handleCancel} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Back to Driver Loans</span>
        </button>
      </div>

      {/* Add custom datepicker styles */}
      <style>
        {customDatePickerStyles}
      </style>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-3">
              <User size={24} className="text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Register Loan</h1>
                <p className="text-gray-500 mt-1">{driver?.name || 'Driver'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loan Details Section */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Loan Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                {/* Date */}
                <div className="space-y-1">
                  <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <Calendar className="mr-2 text-gray-500" size={18} />
                    Date*
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={date}
                      onChange={date => setDate(date)}
                      dateFormat="MMMM d, yyyy"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      wrapperClassName="w-full"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {/* Amount */}
                <div className="space-y-1">
                  <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <DollarSign className="mr-2 text-gray-500" size={18} />
                    Amount*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="10"
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter loan amount"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <CreditCard className="mr-2 text-gray-500" size={18} />
                  Payment Method*
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder="Enter payment method (e.g., Bank Transfer, Cash, etc.)"
                  required
                />
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-2">
              <button 
                type="button"
                onClick={handleCancel}
                className="py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-white border-white border-opacity-20 rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={20} />
                    Register Loan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Success Dialog */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Loan Registered Successfully</h3>
            <p className="text-center text-gray-600 mb-6">
              The loan of ${parseFloat(amount).toFixed(2)} has been successfully registered for {driver?.name}.
            </p>
            <div className="flex justify-center">
              <button
                className="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={() => {
                  setShowSuccess(false);
                  navigate(`/driver/loans/${id}`);
                }}
              >
                View All Loans
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Dialog */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Error</h3>
            <p className="text-center text-gray-600 mb-6">
              There was an error registering the loan. Please try again.
            </p>
            <div className="flex justify-center">
              <button
                className="py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                onClick={() => setShowError(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDriverLoan;