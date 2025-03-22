import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { SERVER_IP } from '../config';

const CompanySettings = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    pricing_model: 'distance_based', // distance_based or flat_rate
    fee_per_kilometer: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `${SERVER_IP}/api/companies/${formData.id}`
        : `${SERVER_IP}/api/companies`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} company`);
      }

      toast.success(`Company ${isEditing ? 'updated' : 'created'} successfully`);
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleEdit = (company) => {
    setFormData({
      id: company.id,
      name: company.name,
      pricing_model: company.pricing_model,
      fee_per_kilometer: company.fee_per_kilometer || '',
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      pricing_model: 'distance_based',
      fee_per_kilometer: '',
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'fee_per_kilometer' ? (parseFloat(value) || '') : value,
    }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Company Settings</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {isEditing ? 'Edit Company' : 'Add New Company'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model</label>
            <select
              name="pricing_model"
              value={formData.pricing_model}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="distance_based">Distance Based</option>
              <option value="flat_rate">Flat Rate</option>
            </select>
          </div>
          {formData.pricing_model === 'distance_based' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Per Kilometer</label>
              <input
                type="number"
                name="fee_per_kilometer"
                value={formData.fee_per_kilometer}
                onChange={handleChange}
                required={formData.pricing_model === 'distance_based'}
                step="0.01"
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter fee per km"
              />
            </div>
          )}
          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isEditing ? 'Update' : 'Add'} Company
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
          </div>
        ) : (
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Per Kilometer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length > 0 ? (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        company.pricing_model === 'distance_based' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {company.pricing_model === 'distance_based' ? 'Distance Based' : 'Flat Rate'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.pricing_model === 'distance_based' 
                        ? `${company.fee_per_kilometer.toFixed(2)}/km` 
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(company)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CompanySettings;