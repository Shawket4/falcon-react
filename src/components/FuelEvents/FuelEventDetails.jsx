import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import { 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Droplet, 
  Calendar, 
  User, 
  DollarSign, 
  Gauge, 
  ArrowLeft,
  CheckCircle,
  X,
  Clock,
} from 'lucide-react';
import { useAuth } from '../AuthContext';

// Permission level required for edit/delete operations
const REQUIRED_PERMISSION_LEVEL = 3;

const FuelEventDetails = ({ serverIp }) => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Get auth context to check permissions
  const { hasMinPermissionLevel } = useAuth();
  
  // Check if user has required permission level
  const canEditDelete = hasMinPermissionLevel(REQUIRED_PERMISSION_LEVEL);
  
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
      
      setDeleteSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Failed to delete event');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleEdit = () => {
    navigate(`/edit-fuel/${id}`);
  };

  const goBack = () => {
    navigate('/');
  };
  
  // Format date in a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get fuel efficiency color based on value (same as FuelEventList)
  const getEfficiencyColorClass = (rate) => {
    if (rate < 1.0 || rate > 3.2) return 'text-gray-400';
    if (rate < 1.8) return 'text-red-500';
    if (rate < 1.9) return 'text-orange-500';
    return 'text-green-500';
  };
  
  const efficiencyColorClass = event ? getEfficiencyColorClass(event.FuelRate) : 'text-gray-400';
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-4">Loading event details...</p>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <p className="text-red-700 font-medium mb-2 text-xl">Error Loading Event Details</p>
          <p className="text-red-600 mb-6">{error || "Could not find the requested fuel event"}</p>
          <div className="flex gap-4">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
              onClick={goBack}
            >
              <ArrowLeft size={18} className="mr-2" />
              Return to Dashboard
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={goBack} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Back to Dashboard</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header - Removed gradient background */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center text-gray-800">
                {event.CarNoPlate}
                <span className="ml-3 bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                  ID: {event.EventId}
                </span>
              </h1>
              <p className="text-gray-500 flex items-center">
                <Calendar size={16} className="mr-2" />
                {formatDate(event.Date)}
                {event.DriverName && (
                  <>
                    <span className="mx-2">•</span>
                    <User size={16} className="mr-2" />
                    {event.DriverName}
                  </>
                )}
              </p>
            </div>
            
            {/* Only show edit/delete buttons if user has required permission */}
            {canEditDelete ? (
              <div className="flex space-x-3 mt-4 md:mt-0">
                <button 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleEdit}
                >
                  <Edit size={18} className="mr-2" />
                  <span>Edit</span>
                </button>
                <button 
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={18} className="mr-2" />
                  <span>Delete</span>
                </button>
              </div>
            ) : (
              <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-md flex items-center mt-4 md:mt-0">
                <AlertTriangle size={16} className="mr-2" />
                <span className="text-sm">View Only Mode</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-8">
            {/* Highlight cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg border border-blue-100 overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-2 font-medium">Consumption Rate</div>
                <div className="p-4 flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <Droplet size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${efficiencyColorClass}`}>
                      {event.FuelRate.toFixed(1)} km/L
                    </p>
                    <p className="text-sm text-gray-500">
                      {parseFloat(event.FuelRate) < 1.0 || parseFloat(event.FuelRate) > 2.7 ? 
                        "(excluded from avg)" : ""}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg border border-green-100 overflow-hidden">
                <div className="bg-green-600 text-white px-4 py-2 font-medium">Total Cost</div>
                <div className="p-4 flex items-center">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{event.Price.toFixed(2)} EGP</p>
                    <p className="text-sm text-gray-500">{event.Liters.toFixed(2)} liters @ {event.PricePerLiter.toFixed(2)} EGP/L</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg border border-purple-100 overflow-hidden">
                <div className="bg-purple-600 text-white px-4 py-2 font-medium">Distance</div>
                <div className="p-4 flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <Gauge size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{event.OdometerAfter - event.OdometerBefore} km</p>
                    <p className="text-sm text-gray-500">Trip Distance</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Details grid */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem 
                  icon={<Calendar size={20} />}
                  label="Date"
                  value={formatDate(event.Date)}
                />
                
                <DetailItem 
                  icon={<Clock size={20} />}
                  label="Time"
                  value={new Date(event.Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                
                <DetailItem 
                  icon={<User size={20} />}
                  label="Driver"
                  value={event.DriverName}
                />
                
                <DetailItem 
                  icon={<DollarSign size={20} />}
                  label="Price Per Liter"
                  value={`${event.PricePerLiter.toFixed(2)} EGP`}
                />
                
                <DetailItem 
                  icon={<Droplet size={20} />}
                  label="Liters"
                  value={event.Liters.toFixed(2)}
                />
                
                <DetailItem 
                  icon={<DollarSign size={20} />}
                  label="Total Cost"
                  value={`${event.Price.toFixed(2)} EGP`}
                />
                
                <div className="col-span-1 md:col-span-3 my-2 border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-4">Odometer Readings</h3>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200 mb-4 md:mb-0">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-md mr-3">
                          <Gauge size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Previous Reading</p>
                          <p className="text-gray-800 font-medium">{event.OdometerBefore.toLocaleString()} km</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:block">
                      <ArrowLeft size={24} className="text-gray-400 rotate-180" />
                    </div>
                    
                    <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-md mr-3">
                          <Gauge size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Current Reading</p>
                          <p className="text-gray-800 font-medium">{event.OdometerAfter.toLocaleString()} km</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog - Only shown if user has permission */}
      {showDeleteConfirm && canEditDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            {deleteSuccess ? (
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Successfully Deleted</h3>
                <p className="text-gray-600 mb-6">The fuel event has been deleted. Redirecting to dashboard...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-red-100 rounded-full mr-3">
                    <Trash2 size={24} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Delete Fuel Event</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this fuel event for <span className="font-semibold">{event.CarNoPlate}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    <X size={18} className="mr-2" />
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
                    ) : (
                      <>
                        <Trash2 size={18} className="mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for detail items
const DetailItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-start">
      <div className="p-2 bg-white rounded-md shadow-sm mr-3">
        {React.cloneElement(icon, { className: "text-gray-600" })}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-gray-800 font-medium">{value || "N/A"}</p>
      </div>
    </div>
  );
};

export default FuelEventDetails;