import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../apiClient';

function TireList() {
  const [tires, setTires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const fetchTires = async () => {
      try {
        const response = await apiClient.get('/tires');
        setTires(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tires. Please try again later.');
        setLoading(false);
      }
    };

    fetchTires();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id, e) => {
    e && e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this tire?')) {
      try {
        await apiClient.delete(`/tires/${id}`);
        setTires(tires.filter(tire => tire.ID !== id));
      } catch (err) {
        setError('Failed to delete the tire. Please try again.');
      }
    }
  };

  // Filter tires based on search term
  const filteredTires = tires.filter(tire => 
    tire.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tire.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tire.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch(status) {
      case 'in-use':
        return { 
          bg: 'bg-green-100', 
          text: 'text-green-800',
          label: 'In Use'
        };
      case 'spare':
        return { 
          bg: 'bg-yellow-100', 
          text: 'text-yellow-800',
          label: 'Spare'
        };
      case 'damaged':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-800',
          label: 'Damaged'
        };
      default:
        return { 
          bg: 'bg-gray-100', 
          text: 'text-gray-800',
          label: status
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-indigo-200 animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTires.map(tire => {
        const statusBadge = getStatusBadge(tire.status);
        
        return (
          <div key={tire.ID} className="group relative">
            <div className="bg-white overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              {/* Top section with serial and status */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {tire.serial}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                    {statusBadge.label}
                  </span>
                </div>
                
                {/* Tire details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Brand</p>
                    <p className="mt-1 text-gray-900">{tire.brand || 'N/A'}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Model</p>
                    <p className="mt-1 text-gray-900">{tire.model || 'N/A'}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Size</p>
                    <p className="mt-1 text-gray-900">{tire.size || 'N/A'}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">ID</p>
                    <p className="mt-1 text-gray-900">#{tire.ID}</p>
                  </div>
                </div>
              </div>
              
              {/* Actions footer */}
              <div className="flex border-t border-gray-100">
                <Link 
                  to={`/tires/${tire.ID}`} 
                  className="flex-1 flex justify-center items-center py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-600 group-hover:text-indigo-600">Details</span>
                </Link>
                <button 
                  className="flex-1 flex justify-center items-center py-3 bg-gray-50 hover:bg-red-50 transition-colors"
                  onClick={(e) => handleDelete(tire.ID, e)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-600 group-hover:text-red-600">Delete</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white overflow-hidden shadow-md rounded-xl">
      <ul className="divide-y divide-gray-200">
        {filteredTires.map(tire => {
          const statusBadge = getStatusBadge(tire.status);
          
          return (
            <li key={tire.ID} className="group">
              <div className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                <div className="flex items-center px-6 py-4">
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 px-4">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                          {tire.serial}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="mt-1 flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <span className="truncate">Brand: {tire.brand || 'N/A'} • Model: {tire.model || 'N/A'} • Size: {tire.size || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link 
                      to={`/tires/${tire.ID}`}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    <button 
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => handleDelete(tire.ID)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="bg-white shadow-sm rounded-xl mb-8 overflow-hidden">
          <div className="px-6 py-6 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">Tire Inventory</h1>
              <p className="text-sm text-gray-500 mt-1">{filteredTires.length} tires available</p>
            </div>
            <div className="flex items-center">
              <div className="flex p-0.5 rounded-lg bg-gray-100 mr-4">
                <button
                  onClick={() => setActiveView('grid')}
                  className={`p-1.5 rounded-md ${activeView === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveView('list')}
                  className={`p-1.5 rounded-md ${activeView === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <Link 
                to="/tires/create" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Tire
              </Link>
            </div>
          </div>
          
          {/* Search section */}
          <div className="px-6 pb-6 sm:px-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="Search by serial, brand, or model..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        
        {/* Empty state */}
        {filteredTires.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tires found</h3>
            {searchTerm ? (
              <div>
                <p className="mt-1 text-sm text-gray-500">Try a different search term or add a new tire.</p>
                <div className="flex items-center justify-center mt-4 space-x-4">
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear Search
                  </button>
                  <Link
                    to="/tires/create"
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add New Tire
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="mt-1 text-sm text-gray-500">Get started by adding tires to your inventory.</p>
                <div className="mt-6">
                  <Link
                    to="/tires/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add New Tire
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="transition-opacity duration-300 ease-in-out">
            {activeView === 'grid' ? renderGridView() : renderListView()}
          </div>
        )}
      </div>
    </div>
  );
}

export default TireList;