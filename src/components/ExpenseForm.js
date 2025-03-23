import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, DollarSign } from 'lucide-react';
import apiClient from '../apiClient';

const ExpenseForm = () => {
  const { vendorId, expenseId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!expenseId;
  
  const [vendor, setVendor] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    price: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchVendor();
    if (isEditMode) {
      fetchExpense();
    }
  }, [vendorId, expenseId]);
  
  const fetchVendor = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/vendors/${vendorId}`);
      setVendor(response.data);
    } catch (err) {
      console.error('Error fetching vendor:', err);
      setError('Failed to load vendor details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchExpense = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/vendors/${vendorId}/expenses/${expenseId}`);
      setFormData({
        description: response.data.description,
        price: response.data.price.toString(),
      });
    } catch (err) {
      console.error('Error fetching expense:', err);
      setError('Failed to load expense details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setError('Price must be a positive number');
      return;
    }
    
    setSubmitLoading(true);
    setError('');
    
    // Prepare data for API
    const dataToSubmit = {
      ...formData,
      price: parseFloat(formData.price),
      vendorId: parseInt(vendorId, 10)
    };
    
    try {
      if (isEditMode) {
        await apiClient.put(`/api/vendors/${vendorId}/expenses/${expenseId}`, dataToSubmit);
      } else {
        await apiClient.post(`/api/vendors/${vendorId}/expenses`, dataToSubmit);
      }
      navigate(`/vendor/${vendorId}/expenses`);
    } catch (err) {
      console.error('Error saving expense:', err);
      setError(err.response?.data?.message || 'Failed to save expense. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {isEditMode ? 'Edit Expense' : 'Add New Expense'}
              {vendor && ` for ${vendor.name}`}
            </h2>
            <button
              onClick={() => navigate(`/vendor/${vendorId}/expenses`)}
              className="flex items-center text-white bg-blue-700 bg-opacity-30 hover:bg-opacity-50 px-3 py-1 rounded-md text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Expenses
            </button>
          </div>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Enter expense description"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Provide a brief description of what this expense is for.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
                Price *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Enter the amount paid for this expense.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Update Expense' : 'Create Expense'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;