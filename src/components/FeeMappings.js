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
  const [selectedCompany, setSelectedCompany] = useState('');
  const [accuracyFilter, setAccuracyFilter] = useState('all');
  
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

  // Calculate distance difference and accuracy
  const calculateAccuracy = (distance, osrmDistance) => {
    if (!osrmDistance || osrmDistance === 0) return { diff: 0, accuracy: 'unknown' };
    
    const diff = distance - osrmDistance;
    const percentageDiff = Math.abs(diff / osrmDistance) * 100;
    
    let accuracy;
    if (percentageDiff <= 5) {
      accuracy = 'accurate';
    } else if (diff < 0) {
      accuracy = 'good'; // OSRM distance is larger (conservative estimate)
    } else {
      accuracy = 'bad'; // Distance is larger than OSRM (overestimate)
    }
    
    return { diff: parseFloat(diff.toFixed(2)), accuracy, percentage: parseFloat(percentageDiff.toFixed(1)) };
  };

  // Get accuracy badge
  const getAccuracyBadge = (accuracy, diff, percentage) => {
    const badges = {
      accurate: { color: 'bg-green-100 text-green-800', icon: '✓', label: 'Accurate' },
      good: { color: 'bg-blue-100 text-blue-800', icon: '↓', label: 'Conservative' },
      bad: { color: 'bg-red-100 text-red-800', icon: '↑', label: 'Overestimate' },
      unknown: { color: 'bg-gray-100 text-gray-800', icon: '?', label: 'Unknown' }
    };
    
    const badge = badges[accuracy] || badges.unknown;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
        {accuracy !== 'unknown' && (
          <span className="ml-1 text-xs opacity-75">
            ({diff > 0 ? '+' : ''}{diff}km)
          </span>
        )}
      </span>
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
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
      distance: mapping.distance.toString(),
      fee: mapping.fee.toString()
    });
    setEditingId(mapping.ID);
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const openDeleteModal = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => setItemToDelete(null), 200);
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

  // Get unique companies for filter
  const companies = [...new Set(mappings.map(m => m.company))];

  // Filter mappings
  const filteredMappings = mappings.filter(mapping => {
    const matchesSearch = 
      mapping.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.terminal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.drop_off_point.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = !selectedCompany || mapping.company === selectedCompany;
    
    const { accuracy } = calculateAccuracy(mapping.distance, mapping.osrm_distance);
    const matchesAccuracy = accuracyFilter === 'all' || accuracy === accuracyFilter;
    
    return matchesSearch && matchesCompany && matchesAccuracy;
  });

  // Statistics
  const stats = mappings.reduce((acc, mapping) => {
    const { accuracy } = calculateAccuracy(mapping.distance, mapping.osrm_distance);
    acc[accuracy] = (acc[accuracy] || 0) + 1;
    acc.total = acc.total + 1;
    return acc;
  }, { accurate: 0, good: 0, bad: 0, unknown: 0, total: 0 });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl transform transition-all">
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
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
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Fee Mappings</h2>
                <p className="text-blue-100 text-sm mt-1">Manage route distances and pricing</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="flex items-center space-x-4 text-sm text-blue-100">
                  <span>Total: {stats.total}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Accurate: {stats.accurate}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm font-medium text-green-800">Accurate</div>
                <div className="text-2xl font-bold text-green-900">{stats.accurate}</div>
                <div className="text-xs text-green-600">±5% margin</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-800">Conservative</div>
                <div className="text-2xl font-bold text-blue-900">{stats.good}</div>
                <div className="text-xs text-blue-600">Under OSRM</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-sm font-medium text-red-800">Overestimate</div>
                <div className="text-2xl font-bold text-red-900">{stats.bad}</div>
                <div className="text-xs text-red-600">Over OSRM</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm font-medium text-gray-800">Unknown</div>
                <div className="text-2xl font-bold text-gray-900">{stats.unknown}</div>
                <div className="text-xs text-gray-600">No OSRM data</div>
              </div>
            </div>
            
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Terminal *</label>
                    <input
                      type="text"
                      name="terminal"
                      value={formData.terminal}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Drop-off Point *</label>
                    <input
                      type="text"
                      name="drop_off_point"
                      value={formData.drop_off_point}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km) *</label>
                    <input
                      type="number"
                      name="distance"
                      value={formData.distance}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                      required
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fee *</label>
                    <input
                      type="number"
                      name="fee"
                      value={formData.fee}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                      required
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : editingId ? (
                      <>
                        <svg className="hidden sm:inline-block -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Update Mapping
                      </>
                    ) : (
                      <>
                        <svg className="hidden sm:inline-block -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Mapping
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="search"
                      placeholder="Search mappings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  {/* Company Filter */}
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="">All Companies</option>
                    {companies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                  
                  {/* Accuracy Filter */}
                  <select
                    value={accuracyFilter}
                    onChange={(e) => setAccuracyFilter(e.target.value)}
                    className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="all">All Accuracies</option>
                    <option value="accurate">Accurate</option>
                    <option value="good">Conservative</option>
                    <option value="bad">Overestimate</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-500">
                  {isLoading ? 'Loading...' : `${filteredMappings.length} of ${mappings.length} mappings`}
                </div>
              </div>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Terminal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Drop-off Point
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distance
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OSRM Distance
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading && !mappings.length ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500">
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
                        <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500">
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No mappings found</h3>
                            {searchTerm ? (
                              <p className="mt-1 text-sm text-gray-500">No results match your search. Try different terms.</p>
                            ) : (
                              <p className="mt-1 text-sm text-gray-500">Get started by creating a new mapping.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredMappings.map((mapping) => {
                        const { diff, accuracy } = calculateAccuracy(mapping.distance, mapping.osrm_distance);
                        return (
                          <tr key={mapping.ID} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mapping.company}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mapping.terminal}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mapping.drop_off_point}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {typeof mapping.distance === 'number' ? mapping.distance.toFixed(2) : mapping.distance} km
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {mapping.osrm_distance ? `${mapping.osrm_distance.toFixed(2)} km` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getAccuracyBadge(accuracy, diff)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {typeof mapping.fee === 'number' ? 
                                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mapping.fee) : 
                                mapping.fee}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => handleEdit(mapping)}
                                  className="text-blue-600 hover:text-blue-900 flex items-center transition-colors"
                                >
                                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => openDeleteModal(mapping.ID)}
                                  className="text-red-600 hover:text-red-900 flex items-center transition-colors"
                                >
                                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Mobile/Tablet Cards */}
            <div className="lg:hidden">
              {isLoading && !mappings.length ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="flex justify-center">
                    <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading mappings...</span>
                  </div>
                </div>
              ) : filteredMappings.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No mappings found</h3>
                  {searchTerm ? (
                    <p className="mt-1 text-sm text-gray-500">No results match your search. Try different terms.</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new mapping.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMappings.map((mapping) => {
                    const { diff, accuracy } = calculateAccuracy(mapping.distance, mapping.osrm_distance);
                    return (
                      <div key={mapping.ID} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div 
                          className="px-4 py-3 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleMobileDetails(mapping.ID)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-gray-900 truncate">{mapping.company}</div>
                              {getAccuracyBadge(accuracy, diff)}
                            </div>
                            <div className="text-sm text-gray-500 truncate mt-1">
                              {mapping.terminal} → {mapping.drop_off_point}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {typeof mapping.distance === 'number' ? mapping.distance.toFixed(2) : mapping.distance} km
                                {mapping.osrm_distance && ` / ${mapping.osrm_distance.toFixed(2)} km OSRM`}
                              </span>
                              <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {typeof mapping.fee === 'number' ? 
                                  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mapping.fee) : 
                                  mapping.fee}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <svg className="h-5 w-5 text-gray-400 transform transition-transform duration-200" 
                              style={{ transform: showMobileDetails === mapping.ID ? 'rotate(180deg)' : 'rotate(0)' }}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        
                        {showMobileDetails === mapping.ID && (
                          <div className="px-4 py-4 bg-gray-50 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</div>
                                <div className="font-medium mt-1">{mapping.company}</div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Terminal</div>
                                <div className="mt-1">{mapping.terminal}</div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Drop-off Point</div>
                                <div className="mt-1">{mapping.drop_off_point}</div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fee</div>
                                <div className="font-medium mt-1">
                                  {typeof mapping.fee === 'number' ? 
                                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mapping.fee) : 
                                    mapping.fee}
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Distance Comparison</div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-xs text-gray-500">Estimated Distance</div>
                                  <div className="font-medium">
                                    {typeof mapping.distance === 'number' ? mapping.distance.toFixed(2) : mapping.distance} km
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">OSRM Distance</div>
                                  <div className="font-medium">
                                    {mapping.osrm_distance ? `${mapping.osrm_distance.toFixed(2)} km` : 'N/A'}
                                  </div>
                                </div>
                              </div>
                              {mapping.osrm_distance && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-500">Difference</div>
                                  <div className="font-medium">
                                    {diff > 0 ? '+' : ''}{diff} km
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-end pt-3 border-t border-gray-200 space-x-3">
                              <button
                                onClick={() => handleEdit(mapping)}
                                className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(mapping.ID)}
                                className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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
                    );
                  })}
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