import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Copy, ExternalLink, X, Navigation, CheckCircle, Clock } from 'lucide-react';

// Polyline decoder function
const decodePolyline = (encoded, precision = 5) => {
  if (!encoded || typeof encoded !== 'string') return [];
  
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates = [];
  const factor = Math.pow(10, precision);

  while (index < encoded.length) {
    let byte, shift = 0, result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    
    const deltaLat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    
    const deltaLng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += deltaLng;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
};

const RouteMap = ({ terminalLocation, dropOffLocation, routeData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !terminalLocation || !dropOffLocation) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (window.L) {
        initializeMap();
        return;
      }

      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const L = window.L;
      
      // Calculate bounds
      const bounds = L.latLngBounds([
        [terminalLocation.lat, terminalLocation.lng],
        [dropOffLocation.lat, dropOffLocation.lng]
      ]);

      // Initialize map
      const map = L.map(mapRef.current).fitBounds(bounds, { padding: [20, 20] });
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add terminal marker (green)
      const terminalIcon = L.divIcon({
        html: '<div style="background-color: #16a34a; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">T</div>',
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([terminalLocation.lat, terminalLocation.lng], { icon: terminalIcon })
        .addTo(map)
        .bindPopup('<strong>Terminal Location</strong><br/>Starting point');

      // Add drop-off marker (red)
      const dropOffIcon = L.divIcon({
        html: '<div style="background-color: #dc2626; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">D</div>',
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([dropOffLocation.lat, dropOffLocation.lng], { icon: dropOffIcon })
        .addTo(map)
        .bindPopup('<strong>Drop-off Location</strong><br/>Destination');

      // Add route line if available
      if (routeData && routeData.geometry) {
        try {
          const routeCoordinates = decodePolyline(routeData.geometry);
          if (routeCoordinates.length > 0) {
            L.polyline(routeCoordinates, {
              color: '#2563eb',
              weight: 4,
              opacity: 0.8
            }).addTo(map);
          }
        } catch (error) {
          console.error('Error decoding route geometry:', error);
        }
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [terminalLocation, dropOffLocation, routeData]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height: '400px' }}
      className="border rounded-lg overflow-hidden"
    />
  );
};

const LocationDialog = ({ 
  isOpen, 
  onClose, 
  dropOffLocation, 
  terminalLocation, 
  isEdit = false,
  tripDetails = {},
  routeData = null
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('locations');

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setActiveTab('locations');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const dropOffUrl = dropOffLocation 
    ? `https://www.google.com/maps?q=${dropOffLocation.lat},${dropOffLocation.lng}`
    : '';

  const terminalUrl = terminalLocation
    ? `https://www.google.com/maps?q=${terminalLocation.lat},${terminalLocation.lng}`
    : '';

  const routeUrl = (terminalLocation && dropOffLocation)
    ? `https://www.google.com/maps/dir/${terminalLocation.lat},${terminalLocation.lng}/${dropOffLocation.lat},${dropOffLocation.lng}`
    : '';

  const copyToClipboard = async (url, type) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(type);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(type);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCoordinates = (location) => {
    return `${parseFloat(location.lat).toFixed(6)}, ${parseFloat(location.lng).toFixed(6)}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-white mr-3" />
            <div>
              <h3 className="text-lg font-bold text-white">
                Trip {isEdit ? 'Updated' : 'Created'} Successfully!
              </h3>
              <p className="text-blue-100 text-sm">View locations and route details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'locations'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="h-4 w-4 inline mr-2" />
            Locations
          </button>
          {routeUrl && (
            <button
              onClick={() => setActiveTab('route')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'route'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Navigation className="h-4 w-4 inline mr-2" />
              Route
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {activeTab === 'locations' && (
            <div className="space-y-6">
              {/* Trip Summary */}
              {tripDetails.drop_off_point && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-medium text-gray-900 mb-3">Trip Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {tripDetails.company && (
                      <div>
                        <span className="text-gray-500">Company:</span>
                        <p className="font-medium">{tripDetails.company}</p>
                      </div>
                    )}
                    {tripDetails.terminal && (
                      <div>
                        <span className="text-gray-500">Terminal:</span>
                        <p className="font-medium">{tripDetails.terminal}</p>
                      </div>
                    )}
                    {tripDetails.drop_off_point && (
                      <div>
                        <span className="text-gray-500">Drop-off:</span>
                        <p className="font-medium">{tripDetails.drop_off_point}</p>
                      </div>
                    )}
                    {tripDetails.receipt_no && (
                      <div>
                        <span className="text-gray-500">Receipt:</span>
                        <p className="font-medium">{tripDetails.receipt_no}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Terminal Location */}
                {terminalLocation && (
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex items-center mb-3">
                      <MapPin className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Terminal Location</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white rounded p-3 border">
                        <div className="text-xs text-gray-500 mb-1">Coordinates</div>
                        <div className="font-mono text-sm">{formatCoordinates(terminalLocation)}</div>
                      </div>
                      
                      <div className="bg-white rounded p-3 border">
                        <div className="text-xs text-gray-500 mb-2">Google Maps URL</div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={terminalUrl}
                            readOnly
                            className="flex-1 text-xs bg-gray-50 border rounded px-2 py-1 font-mono"
                          />
                          <button
                            onClick={() => copyToClipboard(terminalUrl, 'terminal')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                          >
                            <Copy className="h-3 w-3 mr-1 inline" />
                            {copied === 'terminal' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => window.open(terminalUrl, '_blank')}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                )}

                {/* Drop-off Location */}
                {dropOffLocation && (
                  <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                    <div className="flex items-center mb-3">
                      <MapPin className="h-5 w-5 text-red-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Drop-off Location</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white rounded p-3 border">
                        <div className="text-xs text-gray-500 mb-1">Coordinates</div>
                        <div className="font-mono text-sm">{formatCoordinates(dropOffLocation)}</div>
                      </div>
                      
                      <div className="bg-white rounded p-3 border">
                        <div className="text-xs text-gray-500 mb-2">Google Maps URL</div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={dropOffUrl}
                            readOnly
                            className="flex-1 text-xs bg-gray-50 border rounded px-2 py-1 font-mono"
                          />
                          <button
                            onClick={() => copyToClipboard(dropOffUrl, 'dropoff')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                          >
                            <Copy className="h-3 w-3 mr-1 inline" />
                            {copied === 'dropoff' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => window.open(dropOffUrl, '_blank')}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'route' && routeUrl && (
            <div className="space-y-6">
              <div className="text-center">
                <Navigation className="h-12 w-12 mx-auto text-blue-500 mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Complete Route</h4>
                <p className="text-sm text-gray-600">From terminal to drop-off location</p>
              </div>

              {/* Route Details Cards */}
              {routeData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                    <Navigation className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-blue-900">
                      {typeof routeData.distance === 'number' 
                        ? routeData.distance.toFixed(1) 
                        : routeData.distance} km
                    </div>
                    <div className="text-xs text-blue-600">Total Distance</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                    <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-green-900">
                      {formatDuration(routeData.duration)}
                    </div>
                    <div className="text-xs text-green-600">Estimated Time</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 text-center">
                    <MapPin className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-purple-900">OSRM</div>
                    <div className="text-xs text-purple-600">Route Engine</div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border text-center text-gray-600">
                  Route data will be calculated by your OSRM server
                </div>
              )}

              {/* Interactive Map with Route */}
              <RouteMap 
                terminalLocation={terminalLocation}
                dropOffLocation={dropOffLocation}
                routeData={routeData}
              />
              
              <div className="p-3 bg-gray-50 border rounded text-xs text-gray-500 text-center">
                Map data © OpenStreetMap contributors
                {routeData && (
                  <span className="ml-2">
                    • Route: {typeof routeData.distance === 'number' 
                      ? routeData.distance.toFixed(1) 
                      : routeData.distance} km, ~{formatDuration(routeData.duration)}
                  </span>
                )}
              </div>

              {/* Route URL */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-900 mb-2">Google Maps Route URL</div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={routeUrl}
                    readOnly
                    className="flex-1 text-sm bg-white border rounded px-3 py-2 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(routeUrl, 'route')}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-1 inline" />
                    {copied === 'route' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => window.open(routeUrl, '_blank')}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Open Full Route in Google Maps
              </button>

              {/* Comparison with database values */}
              {tripDetails.mileage && routeData && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="text-sm text-yellow-800">
                    <strong>Database vs OSRM:</strong> 
                    <span className="ml-2">
                      Database: {tripDetails.mileage} km | 
                      OSRM: {typeof routeData.distance === 'number' 
                        ? routeData.distance.toFixed(1) 
                        : routeData.distance} km
                    </span>
                    {Math.abs(parseFloat(tripDetails.mileage) - parseFloat(routeData.distance)) > 1 && (
                      <span className="ml-2 text-yellow-700">
                        (Difference: {Math.abs(parseFloat(tripDetails.mileage) - parseFloat(routeData.distance)).toFixed(1)} km)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm">
            {copied && (
              <span className="text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {copied === 'terminal' ? 'Terminal' : copied === 'dropoff' ? 'Drop-off' : 'Route'} URL copied!
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            {routeUrl && (
              <button
                onClick={() => window.open(routeUrl, '_blank')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                View Route
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDialog;