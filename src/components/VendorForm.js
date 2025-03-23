import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import apiClient from '../apiClient';

const VendorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isEditMode) {
      fetchVendor();
    }
  }, [id]);
  
  const fetchVendor = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/vendors/${id}`);
      setFormData({
        name: response.data.name,
      });
      setError('');
    } catch (err) {
      console.error('Error fetching vendor:', err);
      setError('Failed to load vendor details. Please try again.');
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
    
    if (!formData.name.trim()) {
      setError('Vendor name is required');
      return;
    }
    
    setSubmitLoading(true);
    setError('');
    
    try {
      if (isEditMode) {
        await apiClient.put(`/api/vendors/${id}`, formData);
      } else {
        await apiClient.post('/api/vendors', formData);
      }
      navigate('/vendors');
    } catch (err) {
      console.error('Error saving vendor:', err);
      setError(err.response?.data?.message || 'Failed to save vendor. Please try again.');
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
            <h2 className="text-xl font-bold text-white">{isEditMode ? 'Edit Vendor' : 'Add New Vendor'}</h2>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white bg-blue-700 bg-opacity-30 hover:bg-opacity-50 px-3 py-1 rounded-md text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
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
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                Vendor Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter vendor name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the name of the vendor you want to track expenses for.
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
                    {isEditMode ? 'Update Vendor' : 'Create Vendor'}
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

export default VendorForm;