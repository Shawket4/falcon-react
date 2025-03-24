import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

function CreateTire() {
  const navigate = useNavigate();
  const [tireData, setTireData] = useState({
    serial: '',
    brand: '',
    model: '',
    size: '',
    manufacture_date: '',
    purchase_date: '',
    status: 'in-use'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTireData({ ...tireData, [name]: value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!tireData.serial.trim()) {
        throw new Error('Serial number is required');
      }
      
      if (!tireData.brand.trim()) {
        throw new Error('Brand is required');
      }

      await apiClient.post('/tires', tireData);
      setLoading(false);
      navigate('/tires'); // Redirect to tire list
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to create tire');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <button 
        onClick={() => navigate('/tires')}
        className="group mb-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
      >
        <svg 
          className="mr-2 h-4 w-4 transform transition-transform duration-200 group-hover:-translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tire Inventory
      </button>
      
      {/* Main card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header section */}
        <div className="relative h-16">
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-white"></div>
        </div>
        
        {/* Form content */}
        <div className="px-6 py-8 sm:px-10 -mt-8 relative">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Add New Tire
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the details for the new tire to add to your inventory
            </p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Serial Number */}
            <div className="relative">
              <input
                id="serial"
                name="serial"
                type="text"
                required
                value={tireData.serial}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200
                  ${touched.serial && !tireData.serial ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Serial Number"
              />
              <label
                htmlFor="serial"
                className={`absolute left-2 -top-2.5 px-1 text-sm transition-all duration-200 
                  peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4
                  peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-sm peer-focus:text-indigo-600 
                  bg-white
                  ${touched.serial && !tireData.serial ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-600'}`}
              >
                Serial Number *
              </label>
              {touched.serial && !tireData.serial && (
                <p className="mt-1 text-xs text-red-500">Serial number is required</p>
              )}
            </div>
            
            {/* Brand */}
            <div className="relative">
              <input
                id="brand"
                name="brand"
                type="text"
                required
                value={tireData.brand}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200
                  ${touched.brand && !tireData.brand ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Brand"
              />
              <label
                htmlFor="brand"
                className={`absolute left-2 -top-2.5 px-1 text-sm transition-all duration-200 
                  peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4
                  peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-sm peer-focus:text-indigo-600 
                  bg-white
                  ${touched.brand && !tireData.brand ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-600'}`}
              >
                Brand *
              </label>
              {touched.brand && !tireData.brand && (
                <p className="mt-1 text-xs text-red-500">Brand is required</p>
              )}
            </div>
            
            {/* Model */}
            <div className="relative">
              <input
                id="model"
                name="model"
                type="text"
                value={tireData.model}
                onChange={handleChange}
                className="peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Model"
              />
              <label
                htmlFor="model"
                className="absolute left-2 -top-2.5 px-1 text-sm text-gray-600 transition-all duration-200 
                  peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4
                  peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-sm peer-focus:text-indigo-600 
                  bg-white"
              >
                Model
              </label>
            </div>
            
            {/* Size */}
            <div className="relative">
              <input
                id="size"
                name="size"
                type="text"
                value={tireData.size}
                onChange={handleChange}
                className="peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Size"
              />
              <label
                htmlFor="size"
                className="absolute left-2 -top-2.5 px-1 text-sm text-gray-600 transition-all duration-200 
                  peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4
                  peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-sm peer-focus:text-indigo-600 
                  bg-white"
              >
                Size
              </label>
            </div>
            
            {/* Date Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Manufacture Date */}
              <div className="relative">
                <input
                  id="manufacture_date"
                  name="manufacture_date"
                  type="date"
                  value={tireData.manufacture_date}
                  onChange={handleChange}
                  className="peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <label
                  htmlFor="manufacture_date"
                  className="absolute left-2 -top-2.5 px-1 text-sm text-gray-600 bg-white"
                >
                  Manufacture Date
                </label>
              </div>
              
              {/* Purchase Date */}
              <div className="relative">
                <input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  value={tireData.purchase_date}
                  onChange={handleChange}
                  className="peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <label
                  htmlFor="purchase_date"
                  className="absolute left-2 -top-2.5 px-1 text-sm text-gray-600 bg-white"
                >
                  Purchase Date
                </label>
              </div>
            </div>
            
            {/* Status */}
            <div className="relative">
              <select
                id="status"
                name="status"
                value={tireData.status}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="in-use">In Use</option>
                <option value="spare">Spare</option>
                <option value="retired">Retired</option>
              </select>
              <label
                htmlFor="status"
                className="absolute left-2 -top-2.5 px-1 text-sm text-gray-600 bg-white"
              >
                Status
              </label>
            </div>
            
            {/* Submit button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Tire...
                  </>
                ) : (
                  'Create Tire'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer note */}
      <p className="mt-6 text-center text-xs text-gray-500">
        Fields marked with * are required
      </p>
    </div>
  );
}

export default CreateTire;