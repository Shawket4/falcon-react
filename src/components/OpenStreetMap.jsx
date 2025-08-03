import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import coordinatesData from './coordinates.json';
import apiClient from '../apiClient';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;

// Streamlined custom marker creation
const createMarker = (color, size = 24) => {
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: ${size * 0.4}px;
          height: ${size * 0.4}px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

// Enhanced Loading Animation Component
const LoadingAnimation = ({ size = 120 }) => (
  <div className="flex flex-col items-center justify-center p-6 sm:p-8">
    <div 
      className="relative flex items-center justify-center mb-6"
      style={{ width: size, height: size }}
    >
      {/* Main gas pump with enhanced animation */}
      <div className="relative animate-bounce" style={{ animationDuration: '2s' }}>
        <svg 
          width={size * 0.7} 
          height={size * 0.7} 
          viewBox="0 0 64 64" 
          className="drop-shadow-lg"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Main pump body */}
          <rect x="16" y="20" width="20" height="32" rx="3" fill="#4F46E5" filter="url(#glow)" />
          
          {/* Screen */}
          <rect x="19" y="24" width="14" height="10" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.5" />
          
          {/* Screen display with animated elements */}
          <rect x="20.5" y="26" width="11" height="2" rx="0.5" fill="#3B82F6" opacity="0.8">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="20.5" y="28.5" width="8" height="1.5" rx="0.3" fill="#6B7280" opacity="0.6">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <rect x="20.5" y="30.5" width="6" height="1.5" rx="0.3" fill="#6B7280" opacity="0.4">
            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.8s" repeatCount="indefinite" />
          </rect>
          
          {/* Fuel indicator */}
          <circle cx="26" cy="40" r="2.5" fill="#10B981" opacity="0.9">
            <animate attributeName="r" values="2;2.8;2" dur="1.5s" repeatCount="indefinite" />
          </circle>
          
          {/* Pump handle and hose */}
          <rect x="36" y="16" width="5" height="22" rx="2.5" fill="#4F46E5" />
          <path d="M41 16 L48 11 L50 13 L43 18 Z" fill="#4F46E5" />
          
          {/* Base */}
          <rect x="14" y="52" width="24" height="6" rx="3" fill="#374151" opacity="0.8" />
          
          {/* Fuel drops animation */}
          <circle cx="44" cy="20" r="1.5" fill="#3B82F6" opacity="0.7">
            <animate attributeName="cy" values="18;26;18" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      
      {/* Enhanced rotating orbital elements */}
      <div className="absolute inset-0" style={{ animation: 'spin 3s linear infinite' }}>
        <div className="relative w-full h-full">
          <div className="absolute top-1 left-1/2 w-3 h-3 bg-blue-600 rounded-full transform -translate-x-1/2 shadow-lg"></div>
          <div className="absolute bottom-1 left-1/2 w-3 h-3 bg-indigo-600 rounded-full transform -translate-x-1/2 shadow-lg"></div>
          <div className="absolute left-1 top-1/2 w-3 h-3 bg-emerald-600 rounded-full transform -translate-y-1/2 shadow-lg"></div>
          <div className="absolute right-1 top-1/2 w-3 h-3 bg-teal-600 rounded-full transform -translate-y-1/2 shadow-lg"></div>
        </div>
      </div>
      
      {/* Pulse rings */}
      <div className="absolute inset-0 rounded-full border-2 border-blue-300 opacity-20 animate-ping"></div>
      <div className="absolute inset-2 rounded-full border-2 border-indigo-300 opacity-30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
    </div>
    
    {/* Enhanced loading text */}
    <div className="text-center space-y-3">
      <div className="text-lg sm:text-xl font-semibold text-gray-800">
        Finding gas stations...
      </div>
      <div className="text-sm text-gray-600">
        Searching nearby locations
      </div>
      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
);

// Optimized Map Controller
const MapController = React.memo(({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
});

// Enhanced Map Click Handler with double-click prevention
const MapClickHandler = React.memo(({ onMapClick }) => {
  const clickTimeoutRef = useRef(null);
  
  useMapEvents({
    click: (e) => {
      // Clear any existing timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      
      // Set a small delay to distinguish between single click and double click
      clickTimeoutRef.current = setTimeout(() => {
        onMapClick(e.latlng);
      }, 200);
    },
    dblclick: (e) => {
      // Clear the single click timeout on double click
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      // Double click will naturally zoom the map
    }
  });
  
  return null;
});

// Generate Google Maps link
const generateGoogleMapsLink = (lat, lng) => {
  return `https://www.google.com/maps?q=${lat},${lng}&z=15`;
};

// Optimized Station Card Component
const StationCard = React.memo(({ stationData, onViewOnMap }) => {
  const station = stationData.station;
  
  const handleCoordinatesClick = () => {
    window.open(generateGoogleMapsLink(station.lat, station.lng), '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 touch-manipulation">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base line-clamp-2">
        {station.name}
      </h3>
      <div className="space-y-2 text-xs sm:text-sm text-gray-700">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>Distance:</span>
          </span>
          <span className="font-medium text-gray-900">{stationData.distance.toFixed(1)} km</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Road:</span>
          </span>
          <span className="font-medium text-gray-900">{stationData.road_distance.toFixed(1)} km</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
            </svg>
            <span>Duration:</span>
          </span>
          <span className="font-medium text-gray-900">{Math.round(stationData.duration)} min</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-gray-600">Coordinates:</span>
          <button
            onClick={handleCoordinatesClick}
            className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 cursor-pointer"
            title="Click to open in Google Maps"
          >
            {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
          </button>
        </div>
        <button
          onClick={() => onViewOnMap(station.lat, station.lng)}
          className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 text-xs sm:text-sm font-medium touch-manipulation"
        >
          View on Map
        </button>
      </div>
    </div>
  );
});

const OpenStreetMapApp = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [coordinates, setCoordinates] = useState([]);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(10);
  
  // Location search specific states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Load coordinates from JSON file on component mount
  useEffect(() => {
    try {
      if (!Array.isArray(coordinatesData)) {
        throw new Error('JSON must be an array');
      }
      
      const validCoordinates = coordinatesData.filter(coord => {
        return coord.lat && coord.lng && 
               typeof coord.lat === 'number' && 
               typeof coord.lng === 'number';
      });

      if (validCoordinates.length === 0) {
        throw new Error('No valid coordinates found in the JSON file');
      }

      setCoordinates(validCoordinates);
      
      if (validCoordinates.length > 0) {
        setMapCenter([validCoordinates[0].lat, validCoordinates[0].lng]);
      }
    } catch (err) {
      setError(`Error loading coordinates: ${err.message}`);
    }
  }, []);

  // Memoized marker icons for performance
  const markerIcons = useMemo(() => ({
    station: createMarker('#3B82F6', 24), // Blue for gas stations
    selected: createMarker('#EF4444', 28), // Red for selected location (larger)
    current: createMarker('#10B981', 26), // Green for current location
    nearby: createMarker('#8B5CF6', 24) // Purple for nearby stations
  }), []);

  // Optimized get current location function
  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        setCurrentLocation(location);
        setSelectedLocation(location);
        setLocationInput(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
        fetchNearbyStations(latitude, longitude);
      },
      (error) => {
        let errorMessage = 'Error getting location: ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += error.message;
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      options
    );
  }, []);

  // Optimized fetch nearby stations function
  const fetchNearbyStations = useCallback(async (lat, lng) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.post('/get-closest-stations', {
        lat: lat,
        lng: lng
      });
      
      const stations = response.data.stations || [];
      setNearbyStations(stations);
      
      if (stations.length === 0) {
        setError('No nearby stations found in this area.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch nearby stations';
      setError('Error fetching nearby stations: ' + errorMessage);
      setNearbyStations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized location search handler
  const handleLocationSearch = useCallback((e) => {
    e.preventDefault();
    
    if (!locationInput.trim()) {
      setError('Please enter coordinates');
      return;
    }
    
    const coords = locationInput.split(',').map(coord => coord.trim());
    
    if (coords.length === 2) {
      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setSelectedLocation({ lat, lng });
        setMapCenter([lat, lng]);
        setMapZoom(15);
        fetchNearbyStations(lat, lng);
        setError('');
        return;
      }
    }
    
    setError('Please enter valid coordinates in format: lat,lng (e.g., 29.942, 30.940)');
  }, [locationInput, fetchNearbyStations]);

  // Optimized map click handler
  const handleMapClick = useCallback((latlng) => {
    if (activeTab === 'location') {
      const location = { lat: latlng.lat, lng: latlng.lng };
      setSelectedLocation(location);
      setLocationInput(`${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
      fetchNearbyStations(latlng.lat, latlng.lng);
      setError('');
    }
  }, [activeTab, fetchNearbyStations]);

  // Optimized search handler for all stations
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    
    if (!searchInput.trim()) return;
    
    const coords = searchInput.split(',').map(coord => coord.trim());
    
    if (coords.length === 2) {
      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setMapZoom(15);
        setError('');
        return;
      }
    }
    
    const foundCoordinate = coordinates.find(coord => 
      coord.name && coord.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    
    if (foundCoordinate) {
      setMapCenter([foundCoordinate.lat, foundCoordinate.lng]);
      setMapZoom(15);
      setError('');
    } else {
      setError('Location not found. Try searching by name or enter coordinates as "lat,lng"');
    }
  }, [searchInput, coordinates]);

  // Optimized view on map handler
  const handleViewOnMap = useCallback((lat, lng) => {
    setMapCenter([lat, lng]);
    setMapZoom(17);
  }, []);

  // Optimized tab change handler
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setError('');
  }, []);

  // Handle coordinates click for Google Maps
  const handleCoordinatesClick = useCallback((lat, lng) => {
    window.open(generateGoogleMapsLink(lat, lng), '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            PetroApp Gas Stations
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Discover and navigate through your locations</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 sm:p-2">
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <button
                onClick={() => handleTabChange('map')}
                className={`py-2.5 sm:py-3 px-3 sm:px-6 rounded-md font-medium transition-all duration-200 touch-manipulation ${
                  activeTab === 'map'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-xs sm:text-sm lg:text-base font-medium">All Stations</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('location')}
                className={`py-2.5 sm:py-3 px-3 sm:px-6 rounded-md font-medium transition-all duration-200 touch-manipulation ${
                  activeTab === 'location'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs sm:text-sm lg:text-base font-medium">Find Nearby</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'map' && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by name or coordinates (30.123,31.456)"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm text-sm sm:text-base font-medium touch-manipulation"
                >
                  Search
                </button>
              </form>
              
              {coordinates.length > 0 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium text-sm sm:text-base">{coordinates.length} locations loaded</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                {/* Current Location Button */}
                <button
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium touch-manipulation"
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    {loading ? 'Getting Location...' : 'Use Current Location'}
                  </div>
                </button>

                {/* Manual Location Input */}
                <form onSubmit={handleLocationSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="Enter coordinates (29.942, 30.940) or click on map"
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm disabled:opacity-50 text-sm sm:text-base font-medium touch-manipulation"
                  >
                    Search
                  </button>
                </form>

                {/* Results Summary */}
                {nearbyStations.length > 0 && !loading && (
                  <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-sm sm:text-base">{nearbyStations.length} nearby stations found</span>
                  </div>
                )}

                <div className="text-xs sm:text-sm text-gray-500 text-center bg-gray-50 rounded-lg p-2">
                  💡 Tip: Click anywhere on the map to set your location
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 text-center text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 text-sm sm:text-base">
            <div className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Enhanced Loading Animation */}
        {loading && activeTab === 'location' && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <LoadingAnimation size={typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : 140} />
          </div>
        )}

        {/* Map Container with custom styling */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <MapContainer
            center={mapCenter || [30.0444, 31.2357]}
            zoom={mapZoom}
            style={{ 
              height: typeof window !== 'undefined' && window.innerWidth < 640 ? '50vh' : window.innerWidth < 1024 ? '60vh' : '70vh',
              width: '100%',
              minHeight: '400px'
            }}
            className="rounded-lg"
            zoomControl={typeof window !== 'undefined' && window.innerWidth >= 640}
            doubleClickZoom={true}
          >
            {/* Custom map tiles with better styling */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={20}
            />
            
            <MapController center={mapCenter} zoom={mapZoom} />
            <MapClickHandler onMapClick={handleMapClick} />
            
            {/* All stations markers */}
            {activeTab === 'map' && coordinates.map((coord, index) => (
              <Marker
                key={`station-${index}`}
                position={[coord.lat, coord.lng]}
                icon={markerIcons.station}
              >
                <Popup className="custom-popup" maxWidth={300}>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13H6V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                      </svg>
                      {coord.name || `Station #${index + 1}`}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                          </svg>
                          Coordinates:
                        </span>
                        <button
                          onClick={() => handleCoordinatesClick(coord.lat, coord.lng)}
                          className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-all duration-200 cursor-pointer"
                          title="Click to open in Google Maps"
                        >
                          {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Selected location marker */}
            {activeTab === 'location' && selectedLocation && (
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={markerIcons.selected}
              >
                <Popup maxWidth={280}>
                  <div className="p-4">
                    <h3 className="font-semibold text-red-700 text-base mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      </svg>
                      Selected Location
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                          </svg>
                          Coordinates:
                        </span>
                        <button
                          onClick={() => handleCoordinatesClick(selectedLocation.lat, selectedLocation.lng)}
                          className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-all duration-200 cursor-pointer"
                          title="Click to open in Google Maps"
                        >
                          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Nearby stations markers */}
            {activeTab === 'location' && nearbyStations.map((stationData, index) => {
              const station = stationData.station;
              return (
                <Marker
                  key={`nearby-${station.ID}`}
                  position={[station.lat, station.lng]}
                  icon={markerIcons.nearby}
                >
                  <Popup className="custom-popup" maxWidth={320}>
                    <div className="p-4">
                      <h3 className="font-semibold text-purple-700 text-base mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13H6V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                        </svg>
                        {station.name}
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            Distance:
                          </span>
                          <span className="font-medium text-gray-900">{stationData.distance.toFixed(1)} km</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Duration:
                          </span>
                          <span className="font-medium text-gray-900">{Math.round(stationData.duration)} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21 16V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 4h14v12H5V4z"/>
                            </svg>
                            Road Distance:
                          </span>
                          <span className="font-medium text-gray-900">{stationData.road_distance.toFixed(1)} km</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                            </svg>
                            Coordinates:
                          </span>
                          <button
                            onClick={() => handleCoordinatesClick(station.lat, station.lng)}
                            className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-all duration-200 cursor-pointer"
                            title="Click to open in Google Maps"
                          >
                            {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Enhanced Nearby Stations List */}
        {activeTab === 'location' && nearbyStations.length > 0 && !loading && (
          <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                </svg>
              </div>
              Nearby Gas Stations
              <span className="text-sm font-normal text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {nearbyStations.length} found
              </span>
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {nearbyStations.map((stationData) => (
                <StationCard
                  key={stationData.station.ID}
                  stationData={stationData}
                  onViewOnMap={handleViewOnMap}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Custom styles */}
      <style jsx>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        
        @media (max-width: 640px) {
          .leaflet-popup-content-wrapper {
            font-size: 12px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
          
          .leaflet-popup-content {
            margin: 8px 12px;
          }
          
          .leaflet-container {
            font-size: 12px;
          }
          
          .leaflet-control-zoom a {
            width: 40px;
            height: 40px;
            line-height: 40px;
            font-size: 18px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 0, 0, 0.1);
            color: #374151;
            font-weight: 600;
          }
          
          .leaflet-control-zoom a:hover {
            background: rgba(255, 255, 255, 1);
            color: #1F2937;
          }
          
          .touch-manipulation {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .leaflet-popup-tip {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-control-zoom {
          border: none;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-control-zoom a {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          color: #374151;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .leaflet-control-zoom a:last-child {
          border-bottom: none;
        }
        
        .leaflet-control-zoom a:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #2563EB;
        }
        
        /* Custom map controls styling */
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 6px;
          font-size: 10px;
          padding: 2px 6px;
        }
        
        /* Improved touch targets */
        @media (hover: none) and (pointer: coarse) {
          button, input, a {
            min-height: 44px;
          }
        }
        
        /* Smooth animations */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Custom scrollbar */
        @media (max-width: 640px) {
          ::-webkit-scrollbar {
            width: 4px;
          }
          
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.3);
            border-radius: 2px;
          }
        }
        
        /* Loading animation keyframes */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Enhanced marker hover effects */
        .custom-marker:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
          z-index: 1000;
        }
        
        /* Map container styling */
        .leaflet-container {
          background: #f8fafc;
          font-family: inherit;
        }
        
        /* Popup close button styling */
        .leaflet-popup-close-button {
          color: #6b7280;
          font-size: 18px;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .leaflet-popup-close-button:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default OpenStreetMapApp;