import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Truck, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Droplet, 
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import apiClient from '../apiClient';
import { useAuth } from './AuthContext';

// Utility function to format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Utility function to format time
const formatTime = (timeStr) => {
  if (!timeStr) return 'N/A';
  const date = new Date(timeStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Initialize trip state from navigation state or null
  const [trip, setTrip] = useState(location.state?.trip || null);
  const [loading, setLoading] = useState(!location.state?.trip);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    terminalInfo: true,
    dropOffPoints: true,
    route: false,
    financial: true
  });

  useEffect(() => {
    // If trip is already available via location state, no need to fetch
    if (trip) {
      setLoading(false);
      return;
    }

    const fetchTripDetails = async () => {
      if (!isAuthenticated) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        // Only fetch if we don't have the trip data
        const response = await apiClient.get(`/api/protected/GetTripDetails/${tripId}`);
        setTrip(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch trip details");
        console.error("Error fetching trip details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId, isAuthenticated, trip]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEditTrip = () => {
    navigate(`/edit-trip/${tripId}`, { state: { trip } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2" /> Back to Trips
        </button>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Trip not found</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2" /> Back to Trips
        </button>
      </div>
    );
  }

  // Parse step complete time from DB JSON if available
  let stepCompleteTime = trip.step_complete_time;
  if (trip.step_complete_time_db && typeof trip.step_complete_time_db === 'string') {
    try {
      stepCompleteTime = JSON.parse(trip.step_complete_time_db);
    } catch (e) {
      console.error("Error parsing step_complete_time_db:", e);
    }
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">Trip Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm ${
            trip.is_closed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {trip.is_closed ? 'Completed' : 'In Progress'}
          </span>
          <button 
            onClick={handleEditTrip}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Edit className="mr-2 w-4 h-4" /> Edit Trip
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Trip Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-gray-800 text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleSection('basicInfo')}
            >
              <h2 className="text-lg font-semibold">Basic Information</h2>
              {expandedSections.basicInfo ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {expandedSections.basicInfo && (
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Truck className="w-5 h-5 mr-2 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Vehicle</p>
                    <p className="font-medium">{trip.car_no_plate || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <User className="w-5 h-5 mr-2 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Driver</p>
                    <p className="font-medium">{trip.driver_name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(trip.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mr-2 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Trip Time</p>
                    <p className="font-medium">
                      {formatTime(trip.start_time)} - {formatTime(trip.end_time)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FileText className="w-5 h-5 mr-2 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Receipt No.</p>
                    <p className="font-medium">{trip.receipt_no || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Droplet className="w-5 h-5 mr-2 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Tank Capacity</p>
                    <p className="font-medium">{trip.tank_capacity || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-gray-800 text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleSection('terminalInfo')}
            >
              <h2 className="text-lg font-semibold">Terminal Information</h2>
              {expandedSections.terminalInfo ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {expandedSections.terminalInfo && (
              <div className="p-4">
                <div className="flex items-start mb-4">
                  <MapPin className="w-5 h-5 mr-2 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Pick-up Point</p>
                    <p className="font-medium">{trip.pick_up_point || 'N/A'}</p>
                  </div>
                </div>
                
                {stepCompleteTime?.terminal && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center mb-2">
                      <div className="mr-2">
                        {stepCompleteTime.terminal.status ? 
                          <CheckCircle className="w-5 h-5 text-green-500" /> : 
                          <XCircle className="w-5 h-5 text-red-500" />
                        }
                      </div>
                      <p className="font-medium">{stepCompleteTime.terminal.terminal_name}</p>
                    </div>
                    
                    {stepCompleteTime.terminal.time_stamp && (
                      <p className="text-sm text-gray-500 ml-7">
                        Completed: {formatDate(stepCompleteTime.terminal.time_stamp)} at {formatTime(stepCompleteTime.terminal.time_stamp)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drop-off Points */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-gray-800 text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleSection('dropOffPoints')}
            >
              <h2 className="text-lg font-semibold">Drop-off Points ({trip.no_of_drop_off_points || 0})</h2>
              {expandedSections.dropOffPoints ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {expandedSections.dropOffPoints && (
              <div className="p-4">
                {stepCompleteTime?.drop_off_points && stepCompleteTime.drop_off_points.length > 0 ? (
                  <div className="space-y-4">
                    {stepCompleteTime.drop_off_points.map((point, index) => (
                      <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-center mb-2">
                          <div className="mr-2">
                            {point.status ? 
                              <CheckCircle className="w-5 h-5 text-green-500" /> : 
                              <XCircle className="w-5 h-5 text-red-500" />
                            }
                          </div>
                          <p className="font-medium">{point.location_name}</p>
                        </div>
                        
                        <div className="ml-7 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Address:</span> {point.location_address || 'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500">Capacity:</span> {point.capacity || 'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500">Gas Type:</span> {point.gas_type || 'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500">Distance:</span> {point.distance ? `${point.distance.toFixed(1)} km` : 'N/A'}
                          </div>
                          {point.time_stamp && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Completed:</span> {formatDate(point.time_stamp)} at {formatTime(point.time_stamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No drop-off points available</p>
                )}
              </div>
            )}
          </div>

          {/* Route Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-gray-800 text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleSection('route')}
            >
              <h2 className="text-lg font-semibold">Route Information</h2>
              {expandedSections.route ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {expandedSections.route && (
              <div className="p-4">
                {trip.route && trip.route.trip_summary ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div>
                        <p className="text-sm text-gray-500">Total Mileage</p>
                        <p className="font-medium">{trip.route.trip_summary.TotalMileage || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div>
                        <p className="text-sm text-gray-500">Active Time</p>
                        <p className="font-medium">{trip.route.trip_summary.TotalActiveTime || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div>
                        <p className="text-sm text-gray-500">Idle Time</p>
                        <p className="font-medium">{trip.route.trip_summary.TotalIdleTime || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div>
                        <p className="text-sm text-gray-500">Number of Stops</p>
                        <p className="font-medium">{trip.route.trip_summary.NumberofStops || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
                    <p className="text-gray-500">Route information not available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Financial Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-gray-800 text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleSection('financial')}
            >
              <h2 className="text-lg font-semibold">Financial Information</h2>
              {expandedSections.financial ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {expandedSections.financial && (
              <div className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start justify-between border-b pb-4">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                      <p className="text-gray-700">Revenue</p>
                    </div>
                    <p className="font-medium text-green-600">{trip.revenue ? `$${trip.revenue.toFixed(2)}` : 'N/A'}</p>
                  </div>
                  
                  <div className="flex items-start justify-between border-b pb-4">
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 mr-2 text-gray-500" />
                      <p className="text-gray-700">Mileage</p>
                    </div>
                    <p className="font-medium">{trip.mileage ? `${trip.mileage.toFixed(1)} km` : 'N/A'}</p>
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                      <p className="text-gray-700">Pricing Type</p>
                    </div>
                    <p className="font-medium">
                      {trip.distance_based_pricing ? 'Distance Based' : 'Flat Rate'}
                    </p>
                  </div>
                  
                  {trip.distance_based_pricing && (
                    <div className="flex items-start justify-between pt-2">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                        <p className="text-gray-700">Fee per km</p>
                      </div>
                      <p className="font-medium">
                        {trip.fee_per_kilometer ? `$${trip.fee_per_kilometer.toFixed(2)}` : 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-800 text-white p-4">
              <h2 className="text-lg font-semibold">Company Information</h2>
            </div>
            <div className="p-4">
              <div className="flex items-start">
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{trip.company || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start mt-4">
                <div>
                  <p className="text-sm text-gray-500">Transporter</p>
                  <p className="font-medium">{trip.transporter || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;