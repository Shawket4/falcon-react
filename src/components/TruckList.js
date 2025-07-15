import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../apiClient';

import { SERVER_IP } from '../config.js';

function TruckList() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const response = await apiClient.get(`/api/trucks`);
        setTrucks(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch trucks. Please try again later.');
        setLoading(false);
      }
    };

    fetchTrucks();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this truck?')) {
      try {
        await apiClient.delete(`/api/trucks/${id}`);
        setTrucks(trucks.filter(truck => truck.ID !== id));
      } catch (err) {
        setError('Failed to delete the truck. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-blue-200 animate-pulse"></div>
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
      {trucks.map(truck => (
        <Link to={`/trucks/${truck.ID}`} key={truck.ID} className="group">
          <div className="bg-white overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {truck.truck_no}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  #{truck.ID}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="col-span-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Make</p>
                  <p className="mt-1 text-gray-900">{truck.make || 'N/A'}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Model</p>
                  <p className="mt-1 text-gray-900">{truck.model || 'N/A'}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Year</p>
                  <p className="mt-1 text-gray-900">{truck.year || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex border-t border-gray-100">
              <div className="flex-1 flex justify-center items-center py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-sm font-medium text-gray-600 group-hover:text-blue-600">View Tires</span>
              </div>
              <div 
                className="flex-1 flex justify-center items-center py-3 bg-gray-50 hover:bg-red-50 transition-colors"
                onClick={(e) => handleDelete(truck.ID, e)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-sm font-medium text-gray-600 group-hover:text-red-600">Delete</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white overflow-hidden shadow-md rounded-xl">
      <ul className="divide-y divide-gray-200">
        {trucks.map(truck => (
          <li key={truck.ID} className="group">
            <Link to={`/trucks/${truck.ID}`} className="block hover:bg-gray-50 transition duration-150 ease-in-out">
              <div className="flex items-center px-6 py-4">
                <div className="min-w-0 flex-1 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-1h2a1 1 0 001-1v-4a1 1 0 00-.29-.71l-3-3A1 1 0 0011 5H9.05a2.5 2.5 0 01-4.9 0H3a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-1h2a1 1 0 001-1v-4a1 1 0 00-.29-.71l-3-3A1 1 0 0011 5H9.05a2.5 2.5 0 01-4.9 0H3a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-1h2a1 1 0 001-1v-4a1 1 0 00-.29-.71l-3-3A1 1 0 0011 5H9.05a2.5 2.5 0 01-4.9 0H4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 px-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {truck.truck_no}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        #{truck.ID}
                      </span>
                    </div>
                    <div className="mt-1 flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <span className="truncate">{truck.make || 'N/A'} {truck.model || 'N/A'} • {truck.year || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/trucks/${truck.ID}`;
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button 
                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(truck.ID, e);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          </li>
        ))}
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
              <h1 className="text-2xl font-bold text-gray-900">Apex Fleet</h1>
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
                to="/trucks/create" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Truck
              </Link>
            </div>
          </div>
          
          {/* Stats section */}
          
        </div>
        
        {/* Empty state */}
        {trucks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No trucks found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first truck to the fleet.</p>
            <div className="mt-6">
              <Link
                to="/trucks/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Truck
              </Link>
            </div>
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

export default TruckList;