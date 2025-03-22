import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { Calendar, Save, AlertTriangle, Check, X } from 'lucide-react';

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
  
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const response = await axios.post(
          `${serverIp}/api/GetDriverProfileData`,
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
      const response = await axios.post(
        `${serverIp}/api/RegisterDriverLoan/`,
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
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  if (error && !showError) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="flex justify-center text-red-500 mb-4">
          <AlertTriangle size={48} />
        </div>
        <p className="text-gray-700 mb-6">{error}</p>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => navigate(`/driver/${id}`)}
        >
          Back to Driver
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Register Loan for {driver?.name || 'Driver'}</h1>
        <div className="h-1 w-20 bg-blue-600 mt-2"></div>
      </div>
      
      <form className="bg-white rounded-lg shadow-lg p-6" onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
          <div className="relative">
            <DatePicker
              selected={date}
              onChange={date => setDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <Calendar className="absolute right-3 top-3 text-gray-400" size={20} />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
          <input
            type="number"
            step="10"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter loan amount"
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Method *</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Enter payment method"
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            <Save size={16} />
            <span>{submitting ? 'Submitting...' : 'Register Loan'}</span>
          </button>
        </div>
      </form>
      
      {/* Success Dialog */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <Check size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Loan Registered</h3>
            </div>
            <p className="text-gray-600 mb-6">The loan has been successfully registered.</p>
            <div className="flex justify-end">
              <button 
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-red-100 p-2 mr-3">
                <X size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Error</h3>
            </div>
            <p className="text-gray-600 mb-6">There was an error registering the loan. Please try again.</p>
            <div className="flex justify-end">
              <button 
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setShowError(false);
                }}
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