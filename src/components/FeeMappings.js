import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';

const FeeMappings = () => {
  const [mappings, setMappings] = useState([]);
  const [formData, setFormData] = useState({
    company: '',
    terminal: '',
    drop_off_point: '',
    distance: '',
    fee: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileDetails, setShowMobileDetails] = useState(null);
  
  // Delete Dialog State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/api/mappings`);
      setMappings(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch mappings: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Convert distance and fee from string to float
      const formattedData = {
        ...formData,
        distance: parseFloat(formData.distance),
        fee: parseFloat(formData.fee)
      };
      
      if (editingId) {
        await apiClient.put(`/api/mappings/${editingId}`, formattedData);
      } else {
        await apiClient.post(`/api/mappings`, formattedData);
      }
      
      resetForm();
      fetchMappings();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (mapping) => {
    setFormData({
      company: mapping.company,
      terminal: mapping.terminal,
      drop_off_point: mapping.drop_off_point,
      distance: mapping.distance.toString(), // Convert to string for input field
      fee: mapping.fee.toString() // Convert to string for input field
    });
    setEditingId(mapping.ID);
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Delete handlers
  const openDeleteModal = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => setItemToDelete(null), 200); // Clear after animation
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/mappings/${itemToDelete}`);
      fetchMappings();
      closeDeleteModal();
    } catch (err) {
      setError('Failed to delete mapping: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      terminal: '',
      drop_off_point: '',
      distance: '',
      fee: ''
    });
    setEditingId(null);
  };

  const toggleMobileDetails = (id) => {
    setShowMobileDetails(showMobileDetails === id ? null : id);
  };

  // Filter mappings based on search term
  const filteredMappings = mappings.filter(mapping => 
    mapping.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.terminal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.drop_off_point.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden shadow-xl transform transition-all">
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {/* Warning Icon */}
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Delete Fee Mapping</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Are you sure you want to delete this fee mapping? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 sm:px-6 py-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">Fee Mappings</h2>
        </div>
        
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded" role="alert">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Form */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
              {editingId ? (
                <>
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Mapping
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Mapping
                </>
              )}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="block w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Terminal *</label>
                  <input
                    type="text"
                    name="terminal"
                    value={formData.terminal}
                    onChange={handleChange}
                    className="block w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Drop-off Point *</label>
                  <input
                    type="text"
                    name="drop_off_point"
                    value={formData.drop_off_point}
                    onChange={handleChange}
                    className="block w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Distance (km) *</label>
                  <input
                    type="number"
                    name="distance"
                    value={formData.distance}
                    onChange={handleChange}
                    className="block w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Fee *</label>
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee}
                    onChange={handleChange}
                    className="block w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4 sm:mt-6 space-x-2 sm:space-x-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="hidden sm:inline-block -ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="sm:hidden">Saving</span>
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : editingId ? (
                    <>
                      <svg className="hidden sm:inline-block -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="sm:hidden">Update</span>
                      <span className="hidden sm:inline">Update Mapping</span>
                    </>
                  ) : (
                    <>
                      <svg className="hidden sm:inline-block -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="sm:hidden">Add</span>
                      <span className="hidden sm:inline">Add Mapping</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Search and table */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <div className="text-xs sm:text-sm text-gray-500">
                {isLoading ? 'Loading mappings...' : (
                  mappings.length > 0 ? `${mappings.length} mappings found` : 'No mappings found'
                )}
              </div>
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder="Search mappings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            
            {/* Desktop version of table */}
            <div className="hidden sm:block bg-white overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Terminal
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Drop-off Point
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          Distance
                        </div>
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Fee
                        </div>
                      </th>
                      <th scope="col" className="relative px-4 sm:px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading && !mappings.length ? (
                      <tr>
                        <td colSpan="6" className="px-4 sm:px-6 py-10 text-center text-sm text-gray-500">
                          <div className="flex justify-center">
                            <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading mappings...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredMappings.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 sm:px-6 py-10 text-center text-sm text-gray-500">
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No mappings found</h3>
                            {searchTerm ? (
                              <p className="mt-1 text-sm text-gray-500">No results match your search. Try with different terms.</p>
                            ) : (
                              <p className="mt-1 text-sm text-gray-500">Get started by creating a new mapping.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredMappings.map((mapping) => (
                        <tr key={mapping.ID} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mapping.company}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mapping.terminal}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mapping.drop_off_point}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {typeof mapping.distance === 'number' ? mapping.distance.toFixed(2) : mapping.distance}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {typeof mapping.fee === 'number' ? 
                              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mapping.fee) : 
                              mapping.fee}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => handleEdit(mapping)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(mapping.ID)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Mobile version of table */}
            <div className="sm:hidden">
              {isLoading && !mappings.length ? (
                <div className="bg-white rounded-lg shadow overflow-hidden p-4 text-center">
                  <div className="flex justify-center">
                    <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading mappings...</span>
                  </div>
                </div>
              ) : filteredMappings.length === 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No mappings found</h3>
                  {searchTerm ? (
                    <p className="mt-1 text-sm text-gray-500">No results match your search. Try with different terms.</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new mapping.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                 {filteredMappings.map((mapping) => (
                   <div key={mapping.ID} className="bg-white rounded-md shadow overflow-hidden">
                     <div 
                       className="px-4 py-3 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50"
                       onClick={() => toggleMobileDetails(mapping.ID)}
                     >
                       <div>
                         <div className="font-medium text-gray-900">{mapping.company}</div>
                         <div className="text-sm text-gray-500 truncate">{mapping.terminal} → {mapping.drop_off_point}</div>
                       </div>
                       <div className="flex items-center">
                         <span className="px-2 mr-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                           {typeof mapping.fee === 'number' ? 
                             new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mapping.fee) : 
                             mapping.fee}
                         </span>
                         <svg className="h-5 w-5 text-gray-400 transform transition-transform duration-200" 
                           style={{ transform: showMobileDetails === mapping.ID ? 'rotate(180deg)' : 'rotate(0)' }}
                           fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                         </svg>
                       </div>
                     </div>
                     
                     {showMobileDetails === mapping.ID && (
                       <div className="px-4 py-3 bg-gray-50 space-y-3">
                         <div className="grid grid-cols-2 gap-3 text-sm">
                           <div>
                             <div className="text-xs font-medium text-gray-500">Company</div>
                             <div className="font-medium">{mapping.company}</div>
                           </div>
                           <div>
                             <div className="text-xs font-medium text-gray-500">Terminal</div>
                             <div>{mapping.terminal}</div>
                           </div>
                           <div>
                             <div className="text-xs font-medium text-gray-500">Drop-off Point</div>
                             <div>{mapping.drop_off_point}</div>
                           </div>
                           <div>
                             <div className="text-xs font-medium text-gray-500">Distance (km)</div>
                             <div className="font-medium">
                               {typeof mapping.distance === 'number' ? mapping.distance.toFixed(2) : mapping.distance}
                             </div>
                           </div>
                           <div>
                             <div className="text-xs font-medium text-gray-500">Fee</div>
                             <div className="font-medium">
                               {typeof mapping.fee === 'number' ? 
                                 new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mapping.fee) : 
                                 mapping.fee}
                             </div>
                           </div>
                         </div>
                         
                         <div className="flex justify-end pt-2 border-t border-gray-200 space-x-3">
                           <button
                             onClick={() => handleEdit(mapping)}
                             className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                           >
                             <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                             </svg>
                             Edit
                           </button>
                           <button
                             onClick={() => openDeleteModal(mapping.ID)}
                             className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                           >
                             <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                             Delete
                           </button>
                         </div>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

export default FeeMappings;