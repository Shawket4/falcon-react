import React, { useState, useEffect } from 'react';

import './TireSelector.css';
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
        const response = await apiClient.get('/tires');
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

      const response = await apiClient.post('/tires', newTire);
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

  return (
    <div className="tire-selector-modal">
      <div className="tire-selector-content">
        <div className="tire-selector-header">
          <h3>
            {currentTireId ? 'Change Tire' : 'Assign Tire'}: {getPositionDescription()}
          </h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {!showNewTireForm ? (
          <div className="existing-tires-section">
            <div className="search-section">
              <input 
                type="text" 
                placeholder="Search by serial, brand, or model..." 
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            
            {loading ? (
              <div className="text-center p-3">
                <div className="spinner-border" role="status"></div>
              </div>
            ) : (
              <>
                {filteredTires.length === 0 ? (
                  <div className="alert alert-info mt-3">
                    No tires found. Create a new tire or refine your search.
                  </div>
                ) : (
                  <div className="tire-list">
                    {filteredTires.map(tire => (
                      <div 
                        key={tire.ID} 
                        className={`tire-item ${tire.ID === currentTireId ? 'current' : ''}`}
                        onClick={() => onSelect(tire.ID)}
                      >
                        <div className="tire-serial">{tire.serial}</div>
                        <div className="tire-details">
                          {tire.brand} {tire.model} {tire.size && `- ${tire.size}`}
                        </div>
                        <div className="tire-status">{tire.status}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => setShowNewTireForm(true)}
                >
                  Create New Tire
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="new-tire-form">
            <div className="form-group mb-3">
              <label>Serial Number *</label>
              <input 
                type="text" 
                name="serial"
                value={newTire.serial}
                onChange={handleNewTireChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group mb-3">
              <label>Brand</label>
              <input 
                type="text" 
                name="brand"
                value={newTire.brand}
                onChange={handleNewTireChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group mb-3">
              <label>Model</label>
              <input 
                type="text" 
                name="model"
                value={newTire.model}
                onChange={handleNewTireChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group mb-3">
              <label>Size</label>
              <input 
                type="text" 
                name="size"
                value={newTire.size}
                onChange={handleNewTireChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group mb-3">
              <label>Manufacture Date</label>
              <input 
                type="date" 
                name="manufacture_date"
                value={newTire.manufacture_date}
                onChange={handleNewTireChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group mb-3">
              <label>Purchase Date</label>
              <input 
                type="date" 
                name="purchase_date"
                value={newTire.purchase_date}
                onChange={handleNewTireChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group mb-3">
              <label>Status</label>
              <select 
                name="status"
                value={newTire.status}
                onChange={handleNewTireChange}
                className="form-select"
              >
                <option value="in-use">In Use</option>
                <option value="spare">Spare</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNewTireForm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary ms-2"
                onClick={handleCreateNewTire}
              >
                Create Tire
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TireSelector;