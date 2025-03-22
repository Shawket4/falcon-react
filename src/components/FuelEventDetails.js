import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { Edit, Trash2, AlertTriangle, Droplet, Calendar, Truck, User, DollarSign, Gauge, ArrowRight } from 'lucide-react';

const FuelEventDetails = ({ serverIp }) => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/protected/GetFuelEventById/${id}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 4000
        });
        
        const eventData = response.data;
        if (eventData) {
          setEvent({
            EventId: eventData.ID,
            CarNoPlate: eventData.car_no_plate,
            DriverName: eventData.driver_name,
            Date: eventData.date,
            Liters: parseFloat(parseFloat(eventData.liters).toFixed(2)),
            PricePerLiter: parseFloat(parseFloat(eventData.price_per_liter).toFixed(2)),
            Price: parseFloat(parseFloat(eventData.price).toFixed(2)),
            FuelRate: parseFloat(parseFloat(eventData.fuel_rate).toFixed(2)),
            OdometerBefore: eventData.odometer_before,
            OdometerAfter: eventData.odometer_after
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id, serverIp]);
  
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.post(
        '/api/protected/DeleteFuelEvent',
        { id: parseInt(id) },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );
      
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to delete event');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleEdit = () => {
    navigate(`/edit-fuel/${id}`);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="w-12 h-12 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading event details...</p>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-red-50 rounded-lg">
        <div className="text-red-500 mb-4">
          <AlertTriangle size={48} />
        </div>
        <p className="text-red-700 font-medium mb-4">Error loading event details</p>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Fuel Event for Vehicle {event.CarNoPlate}
        </h1>
        <div className="flex space-x-3">
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={handleEdit}
          >
            <Edit size={18} className="mr-2" />
            <span>Edit</span>
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={18} className="mr-2" />
            <span>Delete</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Highlight cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Droplet size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Consumption Rate</p>
              <p className={`text-xl font-bold ${event.FuelRate < 2 && event.FuelRate !== 0 ? 'text-amber-600' : 'text-gray-800'}`}>
                {event.FuelRate.toFixed(2)} km/L
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Price</p>
              <p className="text-xl font-bold text-gray-800">{event.Price.toFixed(2)} EGP</p>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <Gauge size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Distance Traveled</p>
              <p className="text-xl font-bold text-gray-800">{event.OdometerAfter - event.OdometerBefore} km</p>
            </div>
          </div>
        </div>
        
        {/* Details grid */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start">
              <div className="p-2 bg-gray-200 rounded-md mr-3">
                <Calendar size={20} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Date</p>
                <p className="text-gray-800 font-medium">{event.Date}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-gray-200 rounded-md mr-3">
                <User size={20} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Driver</p>
                <p className="text-gray-800 font-medium">{event.DriverName}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-gray-200 rounded-md mr-3">
                <DollarSign size={20} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Price Per Liter</p>
                <p className="text-gray-800 font-medium">{event.PricePerLiter.toFixed(2)} EGP</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-gray-200 rounded-md mr-3">
                <Droplet size={20} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Liters</p>
                <p className="text-gray-800 font-medium">{event.Liters.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-gray-200 rounded-md mr-3">
                <Gauge size={20} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Previous Odometer</p>
                <p className="text-gray-800 font-medium">{event.OdometerBefore} km</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-gray-200 rounded-md mr-3">
                <Gauge size={20} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Current Odometer</p>
                <p className="text-gray-800 font-medium">{event.OdometerAfter} km</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-full mr-3">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Delete Fuel Event</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this fuel event for {event.CarNoPlate}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-white border-white border-opacity-20 rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelEventDetails;