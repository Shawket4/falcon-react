// File: components/AddDriverLoan.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { Calendar, Save, AlertTriangle, Check, ArrowLeft, DollarSign, CreditCard, User, X } from 'lucide-react';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerButtonRef = useRef(null);
  const datePickerRef = useRef(null);
  const navigate = useNavigate();
  
  // Helper function to calculate position of date picker
  const calculateDatePickerPosition = () => {
    if (!datePickerButtonRef.current || !datePickerRef.current) return {};
    
    const buttonRect = datePickerButtonRef.current.getBoundingClientRect();
    const pickerHeight = datePickerRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    
    // Check if there's enough space below the button
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    if (spaceBelow < pickerHeight && spaceAbove > pickerHeight) {
      // Position above the button if there's not enough space below
      return {
        bottom: '100%',
        marginBottom: '8px',
        top: 'auto'
      };
    } else {
      // Position below the button (default)
      return {
        top: '100%',
        marginTop: '8px',
        bottom: 'auto'
      };
    }
  };
  
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
    
    // Add click outside handler for date picker
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current && 
        !datePickerRef.current.contains(event.target) &&
        datePickerButtonRef.current && 
        !datePickerButtonRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return format(date, 'MMMM d, yyyy');
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
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                    <button
                      type="button"
                      ref={datePickerButtonRef}
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <span>{formatDate(date)}</span>
                      <Calendar size={18} className="text-gray-400" />
                    </button>
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
      
      {/* Date Picker Portal - Positioned in document body to avoid container clipping */}
      {showDatePicker && (
        <div 
          ref={datePickerRef}
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3"
          style={{
            width: '320px',
            left: datePickerButtonRef.current?.getBoundingClientRect().left,
            ...calculateDatePickerPosition()
          }}
        >
          <div className="flex justify-between items-center mb-2 pb-2 border-b">
            <h3 className="text-sm font-medium text-gray-700">Select Date</h3>
            <button 
              type="button"
              onClick={() => setShowDatePicker(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                setDate(selectedDate);
                setShowDatePicker(false);
              }
            }}
            modifiersClassNames={{
              selected: 'bg-blue-600 text-white rounded-md',
              today: 'text-red-600 font-bold'
            }}
            styles={{
              caption: { color: '#4b5563' },
              day: { margin: '0.15rem' }
            }}
          />
        </div>
      )}
      
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