import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../apiClient';
import TruckDiagram from './TruckDiagram';
import TireSelector from './TireSelector';

import { SERVER_IP } from '../config.js';

function TruckDetail() {
  const { id } = useParams();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showTireSelector, setShowTireSelector] = useState(false);

  useEffect(() => {
    const fetchTruck = async () => {
      try {
        const response = await apiClient.get(`${SERVER_IP}/trucks/${id}`);
        setTruck(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch truck details. Please try again.');
        setLoading(false);
      }
    };

    fetchTruck();
  }, [id]);

  const handlePositionClick = (position) => {
    setSelectedPosition(position);
    setShowTireSelector(true);
  };

  const handleTireAssign = async (tireId) => {
    try {
      await apiClient.post(`${SERVER_IP}/positions/assign`, {
        tire_id: tireId,
        position_id: selectedPosition.ID
      });
      
      // Refresh truck data to show updated tire assignments
      const response = await apiClient.get(`${SERVER_IP}/trucks/${id}`);
      setTruck(response.data);
      setShowTireSelector(false);
    } catch (err) {
      setError('Failed to assign tire. Please try again.');
    }
  };

  const handleRemoveTire = async (positionId) => {
    try {
      await apiClient.put(`${SERVER_IP}/positions/${positionId}/remove-tire`);
      
      // Refresh truck data
      const response = await apiClient.get(`${SERVER_IP}/trucks/${id}`);
      setTruck(response.data);
    } catch (err) {
      setError('Failed to remove tire. Please try again.');
    }
  };

  // Count stats for the truck
  const getTireStats = () => {
    if (!truck || !truck.positions) return { total: 0, assigned: 0, empty: 0 };
    
    const total = truck.positions.length;
    const assigned = truck.positions.filter(p => p.tire_id).length;
    const empty = total - assigned;
    
    return { total, assigned, empty };
  };

  const stats = getTireStats();

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
  
  if (!truck) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-lg flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Truck not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Truck Info */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link 
              to="/trucks" 
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Back to truck list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Truck #{truck.truck_no}
            </h1>
            <span className="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              ID: {truck.ID}
            </span>
          </div>
        </div>
        
        {/* Truck Info Card */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-6 sm:px-8">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Truck Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">Make</span>
                    <span className="mt-1 text-gray-900 font-medium">{truck.make || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">Model</span>
                    <span className="mt-1 text-gray-900 font-medium">{truck.model || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">Year</span>
                    <span className="mt-1 text-gray-900 font-medium">{truck.year || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tire Statistics */}
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="px-6 py-5 text-center">
                <span className="text-2xl font-semibold text-gray-900">{stats.total}</span>
                <p className="mt-1 text-sm font-medium text-gray-500">Total Positions</p>
              </div>
              <div className="px-6 py-5 text-center">
                <span className="text-2xl font-semibold text-green-600">{stats.assigned}</span>
                <p className="mt-1 text-sm font-medium text-gray-500">Assigned Tires</p>
              </div>
              <div className="px-6 py-5 text-center">
                <span className="text-2xl font-semibold text-amber-600">{stats.empty}</span>
                <p className="mt-1 text-sm font-medium text-gray-500">Empty Positions</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tire Diagram Section */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-6 sm:px-8">
            <h2 className="text-lg font-medium text-gray-900 mb-1">Tire Diagram</h2>
            <p className="text-sm text-gray-500 mb-6">
              Click on any tire position to assign or change a tire
            </p>
            
            <TruckDiagram 
              positions={truck.positions} 
              onPositionClick={handlePositionClick}
              onRemoveTire={handleRemoveTire}
            />
          </div>
        </div>
      </div>
      
      {/* Tire selector modal */}
      {showTireSelector && (
        <TireSelector 
          onSelect={handleTireAssign}
          onClose={() => setShowTireSelector(false)}
          currentTireId={selectedPosition?.tire_id}
          positionInfo={selectedPosition}
        />
      )}
    </div>
  );
}

export default TruckDetail;