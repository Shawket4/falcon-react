import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';

function TireSelector({ onSelect, onClose, currentTireId, positionInfo }) {
  const [tires, setTires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTireForm, setShowNewTireForm] = useState(false);
  const [newTire, setNewTire] = useState({
    serial: '',
    brand: '',
    model: '',
    size: '',
    manufacture_date: '',
    purchase_date: '',
    status: 'in-use'
  });

  useEffect(() => {
    const fetchTires = async () => {
      try {
        const response = await apiClient.get('/api/tires');
        setTires(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tires. Please try again.');
        setLoading(false);
      }
    };

    fetchTires();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNewTireChange = (e) => {
    const { name, value } = e.target;
    setNewTire(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateNewTire = async () => {
    try {
      if (!newTire.serial.trim()) {
        setError('Serial number is required');
        return;
      }

      const response = await apiClient.post('/api/tires', newTire);
      setTires([...tires, response.data]);
      setShowNewTireForm(false);
      onSelect(response.data.ID);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tire');
    }
  };

  // Filter tires based on search term
  const filteredTires = tires.filter(tire => 
    tire.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tire.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tire.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to format position info
  const getPositionDescription = () => {
    if (!positionInfo) return '';
    
    const { position_type, side } = positionInfo;
    let typeLabel = '';
    
    if (position_type.includes('steering')) {
      typeLabel = 'Steering';
    } else if (position_type.includes('head_axle')) {
      const axleNum = position_type.split('_')[2];
      typeLabel = `Head Axle ${axleNum}`;
    } else if (position_type.includes('trailer_axle')) {
      const axleNum = position_type.split('_')[2];
      typeLabel = `Trailer Axle ${axleNum}`;
    } else if (position_type === 'spare') {
      return 'Spare Tire';
    }
    
    let sideLabel = '';
    switch(side) {
      case 'left': sideLabel = 'Left'; break;
      case 'right': sideLabel = 'Right'; break;
      case 'inner_left': sideLabel = 'Inner Left'; break;
      case 'inner_right': sideLabel = 'Inner Right'; break;
      default: sideLabel = side;
    }
    
    return `${typeLabel} - ${sideLabel}`;
  };

  // Helper to get status badge styling
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'in-use':
        return 'bg-green-100 text-green-800';
      case 'spare':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-11/12 max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-lg overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center pb-3 mb-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              {currentTireId ? 'Change Tire' : 'Assign Tire'}: {getPositionDescription()}
            </h3>
            <button 
              className="text-2xl text-gray-500 hover:text-gray-700 focus:outline-none" 
              onClick={onClose}
            >
              ×
            </button>
          </div>
          
          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {!showNewTireForm ? (
            <div>
              <div className="mb-5">
                <input 
                  type="text" 
                  placeholder="Search by serial, brand, or model..." 
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full p-2.5 border border-gray-300 rounded text-base focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {loading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {filteredTires.length === 0 ? (
                    <div className="p-4 mb-5 bg-blue-50 border border-blue-200 text-blue-700 rounded">
                      No tires found. Create a new tire or refine your search.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto mb-5 border border-gray-200 rounded">
                      {filteredTires.map(tire => (
                        <div 
                          key={tire.ID} 
                          className={`p-3.5 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${tire.ID === currentTireId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                          onClick={() => onSelect(tire.ID)}
                        >
                          <div className="font-bold text-base mb-1">{tire.serial}</div>
                          <div className="text-gray-500 text-sm mb-1">
                            {tire.brand} {tire.model} {tire.size && `- ${tire.size}`}
                          </div>
                          <div className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(tire.status)}`}>
                            {tire.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    onClick={() => setShowNewTireForm(true)}
                  >
                    Create New Tire
                  </button>
                </>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Serial Number *</label>
                <input 
                  type="text" 
                  name="serial"
                  value={newTire.serial}
                  onChange={handleNewTireChange}
                  className="w-full p-2.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Brand</label>
                <input 
                  type="text" 
                  name="brand"
                  value={newTire.brand}
                  onChange={handleNewTireChange}
                  className="w-full p-2.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Model</label>
                <input 
                  type="text" 
                  name="model"
                  value={newTire.model}
                  onChange={handleNewTireChange}
                  className="w-full p-2.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Size</label>
                <input 
                  type="text" 
                  name="size"
                  value={newTire.size}
                  onChange={handleNewTireChange}
                  className="w-full p-2.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Manufacture Date</label>
                <input 
                  type="date" 
                  name="manufacture_date"
                  value={newTire.manufacture_date}
                  onChange={handleNewTireChange}
                  className="w-full p-2.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Purchase Date</label>
                <input 
                  type="date" 
                  name="purchase_date"
                  value={newTire.purchase_date}
                  onChange={handleNewTireChange}
                  className="w-full p-2.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Status</label>
                <select 
                  name="status"
                  value={newTire.status}
                  onChange={handleNewTireChange}
                  className="w-full p-2.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="in-use">In Use</option>
                  <option value="spare">Spare</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              
              <div className="flex justify-end mt-5">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                  onClick={() => setShowNewTireForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ml-2"
                  onClick={handleCreateNewTire}
                >
                  Create Tire
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TireSelector;