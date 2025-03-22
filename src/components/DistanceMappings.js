// src/components/DistanceMappings.jsx
import React, { useState, useEffect } from 'react';
import { distanceService } from '../services/mappingService';

const DistanceMappings = () => {
  const [distanceMappings, setDistanceMappings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    terminal_name: '',
    location_name: '',
    distance: 0,
  });
  const [filterCompany, setFilterCompany] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch all distance mappings
  const fetchDistanceMappings = async () => {
    setLoading(true);
    try {
      // Use company filter if selected
      const params = filterCompany ? { company: filterCompany } : {};
      const data = await distanceService.getAllDistanceMappings(params);
      setDistanceMappings(data);
      
      // Extract unique companies for the filter dropdown
      const uniqueCompanies = [...new Set(data.map(item => item.company))].filter(Boolean);
      setCompanies(uniqueCompanies);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch distance mappings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filter changes
  useEffect(() => {
    fetchDistanceMappings();
  }, [filterCompany]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'distance' ? parseFloat(value) || 0 : value,
    });
  };

  // Handle company filter change
  const handleFilterChange = (e) => {
    setFilterCompany(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!formData.company || !formData.terminal_name || !formData.location_name) {
      setFormError('Company, Terminal, and Location names are required');
      return;
    }

    try {
      if (editMode) {
        await distanceService.updateDistanceMapping(formData);
      } else {
        await distanceService.createDistanceMapping(formData);
      }
      
      // Reset form and refresh data
      setFormData({ company: '', terminal_name: '', location_name: '', distance: 0 });
      setShowForm(false);
      setEditMode(false);
      fetchDistanceMappings();
    } catch (err) {
      setFormError(err.response?.data?.error || 'An error occurred');
    }
  };

  // Set up form for editing
  const handleEdit = (mapping) => {
    setFormData({
      company: mapping.company,
      terminal_name: mapping.terminal_name,
      location_name: mapping.location_name,
      distance: mapping.distance
    });
    setEditMode(true);
    setShowForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ company: '', terminal_name: '', location_name: '', distance: 0 });
    setShowForm(false);
    setEditMode(false);
    setFormError('');
  };

  if (loading && distanceMappings.length === 0) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Distance Mappings</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New Distance Mapping
          </button>
        )}
      </div>

      {/* Company filter */}
      {companies.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Company
          </label>
          <div className="flex">
            <select
              value={filterCompany}
              onChange={handleFilterChange}
              className="p-2 border rounded mr-2 w-64"
            >
              <option value="">All Companies</option>
              {companies.map((company, idx) => (
                <option key={idx} value={company}>
                  {company}
                </option>
              ))}
            </select>
            
            {filterCompany && (
              <button
                onClick={() => setFilterCompany('')}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Form for adding/editing distance mappings */}
      {showForm && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">
            {editMode ? 'Edit Distance Mapping' : 'Add New Distance Mapping'}
          </h2>
          
          {formError && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terminal Name
                </label>
                <input
                  type="text"
                  name="terminal_name"
                  value={formData.terminal_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (km)
                </label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 mr-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editMode ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Distance mappings list */}
      {error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      ) : (
        <>
          {loading ? (
            <div className="p-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : distanceMappings.length === 0 ? (
            <div className="p-4 bg-gray-100 text-center rounded">
              No distance mappings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border text-left">Company</th>
                    <th className="px-4 py-2 border text-left">Terminal</th>
                    <th className="px-4 py-2 border text-left">Location</th>
                    <th className="px-4 py-2 border text-right">Distance (km)</th>
                    <th className="px-4 py-2 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {distanceMappings.map((mapping, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{mapping.company}</td>
                      <td className="px-4 py-2 border">{mapping.terminal_name}</td>
                      <td className="px-4 py-2 border">{mapping.location_name}</td>
                      <td className="px-4 py-2 border text-right">{mapping.distance.toFixed(1)}</td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          onClick={() => handleEdit(mapping)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DistanceMappings;