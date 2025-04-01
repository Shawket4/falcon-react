// components/VendorManagement.js
import React, { useState, useEffect } from 'react';
import { PlusCircle, RefreshCw, AlertCircle, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import VendorForm from './VendorForm';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  
  // Fetch vendors from API
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/vendors');
      setVendors(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };
  
  // Create new vendor
  const createVendor = async (vendorData) => {
    setLoading(true);
    try {
      await apiClient.post('/api/vendors', vendorData);
      fetchVendors();
      setShowAddForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };
  
  // Update existing vendor
  const updateVendor = async (id, vendorData) => {
    setLoading(true);
    try {
      await apiClient.put(`/api/vendors/${id}`, vendorData);
      fetchVendors();
      setEditingVendor(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update vendor');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete vendor
  const deleteVendor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.delete(`/api/vendors/${id}`);
      fetchVendors();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete vendor');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchVendors();
  }, []);
  
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Vendor Management</h1>
        <div className="flex space-x-4">
          <button 
            className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            onClick={fetchVendors}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddForm(true)}
            disabled={loading}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Vendor
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Add/Edit Vendor Form */}
      {(showAddForm || editingVendor) && (
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">
            {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
          </h2>
          <VendorForm 
            initialData={editingVendor || {}}
            onSubmit={editingVendor ? 
              (data) => updateVendor(editingVendor.id, data) : 
              createVendor
            }
            onCancel={() => {
              setShowAddForm(false);
              setEditingVendor(null);
            }}
            isLoading={loading}
          />
        </div>
      )}
      
      {/* Vendor List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Vendors</h2>
        </div>
        
        {vendors.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {loading ? 'Loading vendors...' : 'No vendors found. Add your first vendor above.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{vendor.contact || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {vendor.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={`/vendors/${vendor.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => setEditingVendor(vendor)}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => deleteVendor(vendor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorManagement;