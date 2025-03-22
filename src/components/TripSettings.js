import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { SERVER_IP } from '../config';

const TripSettings = () => {
  const [activeTab, setActiveTab] = useState('distances');
  const [companies, setCompanies] = useState([]);
  
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${SERVER_IP}/api/companies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error(error);
      toast.error('Error loading companies');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'distances':
        return <DistanceMappingsTab />;
      case 'fees':
        return <FeeMappingsTab />;
      case 'companies':
        return <CompanySettingsTab />;
      default:
        return <DistanceMappingsTab />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Trip System Settings</h1>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('distances')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'distances'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:border-blue-600'
            }`}
          >
            Distance Mappings
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'fees'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:border-blue-600'
            }`}
          >
            Fee Mappings
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'companies'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:border-blue-600'
            }`}
          >
            Company Settings
          </button>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Pricing System Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Distance-Based Pricing</h3>
            <p className="text-gray-600 mb-3">
              Companies using distance-based pricing calculate trip costs based on:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Distance between terminal and drop-off point</li>
              <li>Fee per kilometer rate</li>
              <li>Tank capacity/volume being transported</li>
            </ul>
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Companies using this model:</h4>
              <div className="flex flex-wrap gap-2">
                {companies
                  .filter(company => company.pricing_model === 'distance_based')
                  .map(company => (
                    <span key={company.id} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {company.name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Flat-Rate Pricing</h3>
            <p className="text-gray-600 mb-3">
              Companies using flat-rate pricing have predefined fees for each route:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Set fee for each terminal-location pair</li>
              <li>Total cost based on fee × capacity</li>
              <li>No distance calculations required</li>
            </ul>
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Companies using this model:</h4>
              <div className="flex flex-wrap gap-2">
                {companies
                  .filter(company => company.pricing_model === 'flat_rate')
                  .map(company => (
                    <span key={company.id} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {company.name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components
const DistanceMappingsTab = () => (
  <div className="min-h-[400px]">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-gray-800">Distance Mappings</h2>
      <p className="text-sm text-gray-600">
        Configure distances between terminals and locations
      </p>
    </div>
    
    <p className="text-gray-600 mb-6">
      These distances are used for calculating trip costs for companies using distance-based pricing.
      Accurate distance measurements ensure proper revenue calculations.
    </p>
    
    {/* Import your DistanceMappings component here */}
    <div className="text-center text-gray-500">
      Loading distance mappings...
    </div>
  </div>
);

const FeeMappingsTab = () => (
  <div className="min-h-[400px]">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-gray-800">Fee Mappings</h2>
      <p className="text-sm text-gray-600">
        Configure predefined fees for routes
      </p>
    </div>
    
    <p className="text-gray-600 mb-6">
      These fees are used for calculating trip costs for companies using flat-rate pricing.
      Each company can have different fee structures for the same route.
    </p>
    
    {/* Import your FeeMappings component here */}
    <div className="text-center text-gray-500">
      Loading fee mappings...
    </div>
  </div>
);

const CompanySettingsTab = () => (
  <div className="min-h-[400px]">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-gray-800">Company Settings</h2>
      <p className="text-sm text-gray-600">
        Configure company pricing models
      </p>
    </div>
    
    <p className="text-gray-600 mb-6">
      Define which pricing model each company uses and set their fee per kilometer rates if applicable.
    </p>
    
    {/* Import your CompanySettings component here */}
    <div className="text-center text-gray-500">
      Loading company settings...
    </div>
  </div>
);

export default TripSettings;