import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Copy, ExternalLink, X, Navigation, CheckCircle, Clock, Route, Layers } from 'lucide-react';
import ETITRoute from './ETITRoute';

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

// Enhanced marker creation with styling
const createMarker = (color, size = 24, label = '') => {
  return window.L.divIcon({
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
        color: white;
        font-weight: bold;
        font-size: ${size * 0.5}px;
        transition: transform 0.2s ease;
      ">
        ${label}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

const RouteMap = ({ terminalLocation, dropOffLocation, routeData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [satelliteView, setSatelliteView] = useState(false);
  const [baseLayers, setBaseLayers] = useState({});
  const [locationNames, setLocationNames] = useState({});

  // Reverse geocoding function
  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.display_name) {
        const address = data.address || {};
        const street = address.road || address.pedestrian || address.footway || '';
        const houseNumber = address.house_number || '';
        const suburb = address.suburb || address.neighbourhood || address.quarter || '';
        const city = address.city || address.town || address.village || '';
        
        let formattedAddress = '';
        if (houseNumber && street) {
          formattedAddress = `${houseNumber} ${street}`;
        } else if (street) {
          formattedAddress = street;
        }
        
        if (suburb && formattedAddress) {
          formattedAddress += `, ${suburb}`;
        } else if (suburb) {
          formattedAddress = suburb;
        }
        
        if (city) {
          formattedAddress += formattedAddress ? `, ${city}` : city;
        }
        
        return {
          fullAddress: data.display_name,
          shortAddress: formattedAddress || data.display_name,
          street: street,
          city: city,
          suburb: suburb
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  useEffect(() => {
    if (!mapRef.current || !terminalLocation || !dropOffLocation) return;

    // Load location names
    const loadLocationNames = async () => {
      const terminalName = await getLocationName(terminalLocation.lat, terminalLocation.lng);
      const dropOffName = await getLocationName(dropOffLocation.lat, dropOffLocation.lng);
      
      setLocationNames({
        terminal: terminalName,
        dropOff: dropOffName
      });
    };

    loadLocationNames();

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

      // Initialize map with enhanced styling
      const map = L.map(mapRef.current, {
        zoomControl: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        touchZoom: true
      }).fitBounds(bounds, { padding: [20, 20] });
      
      mapInstanceRef.current = map;

      // Define base layers
      const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      });

      const hybridLayer = L.layerGroup([
        satelliteLayer,
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
          opacity: 0.8
        })
      ]);

      // Set initial layer
      const currentLayer = satelliteView ? satelliteLayer : streetLayer;
      currentLayer.addTo(map);

      setBaseLayers({
        street: streetLayer,
        satellite: satelliteLayer,
        hybrid: hybridLayer
      });

      // Add terminal marker with enhanced styling and location info
      const terminalMarker = createMarker('#16a34a', 28, 'T');
      L.marker([terminalLocation.lat, terminalLocation.lng], { icon: terminalMarker })
        .addTo(map)
        .bindPopup(`
          <div class="p-4">
            <h3 class="font-semibold text-green-700 text-base mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Terminal Location
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Coordinates:</span>
                <span class="font-mono text-xs">${terminalLocation.lat.toFixed(6)}, ${terminalLocation.lng.toFixed(6)}</span>
              </div>
              ${locationNames.terminal ? `
                <div>
                  <span class="text-gray-600">Address:</span>
                  <p class="text-gray-900 mt-1">${locationNames.terminal.shortAddress}</p>
                </div>
                ${locationNames.terminal.street ? `
                  <div>
                    <span class="text-gray-600">Street:</span>
                    <p class="text-gray-900">${locationNames.terminal.street}</p>
                  </div>
                ` : ''}
              ` : '<div class="text-gray-500 text-xs">Loading address...</div>'}
              <div class="text-green-600 text-xs">Starting point for your journey</div>
            </div>
            <div class="mt-3 flex gap-2">
              <button onclick="window.open('https://www.google.com/maps?q=${terminalLocation.lat},${terminalLocation.lng}', '_blank')" 
                      class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                </svg>
                Open in Maps
              </button>
              <button onclick="navigator.clipboard.writeText('${terminalLocation.lat}, ${terminalLocation.lng}')" 
                      class="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                </svg>
                Copy
              </button>
            </div>
          </div>
        `);

      // Add drop-off marker with enhanced styling and location info
      const dropOffMarker = createMarker('#dc2626', 28, 'D');
      L.marker([dropOffLocation.lat, dropOffLocation.lng], { icon: dropOffMarker })
        .addTo(map)
        .bindPopup(`
          <div class="p-4">
            <h3 class="font-semibold text-red-700 text-base mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
              Drop-off Location
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Coordinates:</span>
                <span class="font-mono text-xs">${dropOffLocation.lat.toFixed(6)}, ${dropOffLocation.lng.toFixed(6)}</span>
              </div>
              ${locationNames.dropOff ? `
                <div>
                  <span class="text-gray-600">Address:</span>
                  <p class="text-gray-900 mt-1">${locationNames.dropOff.shortAddress}</p>
                </div>
                ${locationNames.dropOff.street ? `
                  <div>
                    <span class="text-gray-600">Street:</span>
                    <p class="text-gray-900">${locationNames.dropOff.street}</p>
                  </div>
                ` : ''}
              ` : '<div class="text-gray-500 text-xs">Loading address...</div>'}
              <div class="text-red-600 text-xs">Destination point</div>
            </div>
            <div class="mt-3 flex gap-2">
              <button onclick="window.open('https://www.google.com/maps?q=${dropOffLocation.lat},${dropOffLocation.lng}', '_blank')" 
                      class="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                </svg>
                Open in Maps
              </button>
              <button onclick="navigator.clipboard.writeText('${dropOffLocation.lat}, ${dropOffLocation.lng}')" 
                      class="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                </svg>
                Copy
              </button>
            </div>
          </div>
        `);

      // Add route line with enhanced styling if available
      if (routeData && routeData.geometry) {
        try {
          const routeCoordinates = decodePolyline(routeData.geometry);
          if (routeCoordinates.length > 0) {
            L.polyline(routeCoordinates, {
              color: '#2563eb',
              weight: 4,
              opacity: 0.8,
              smoothFactor: 1.0,
              dashArray: null
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

  // Handle satellite view toggle
  useEffect(() => {
    if (mapInstanceRef.current && baseLayers.street && baseLayers.satellite) {
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer === baseLayers.street || layer === baseLayers.satellite) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      const newLayer = satelliteView ? baseLayers.satellite : baseLayers.street;
      newLayer.addTo(mapInstanceRef.current);
    }
  }, [satelliteView, baseLayers]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '400px' }}
        className="border rounded-xl overflow-hidden shadow-sm bg-gray-50"
      />
      
      {/* Satellite View Toggle */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => setSatelliteView(!satelliteView)}
          className={`flex items-center px-3 py-2 rounded-lg shadow-lg border backdrop-blur-sm transition-all ${
            satelliteView 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
          title={satelliteView ? 'Switch to Street View' : 'Switch to Satellite View'}
        >
          <Layers className="h-4 w-4 mr-2" />
          {satelliteView ? 'Street' : 'Satellite'}
        </button>
      </div>
      
      {/* Enhanced styling for the map */}
      <style jsx>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        
        .custom-marker:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
          z-index: 1000;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
          font-family: inherit;
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
          width: 40px;
          height: 40px;
          line-height: 40px;
          font-size: 18px;
        }
        
        .leaflet-control-zoom a:last-child {
          border-bottom: none;
        }
        
        .leaflet-control-zoom a:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #2563EB;
        }
        
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 6px;
          font-size: 10px;
          padding: 2px 6px;
        }
        
        .leaflet-container {
          background: #f8fafc;
          font-family: inherit;
          border-radius: 12px;
        }
        
        .leaflet-popup-close-button {
          color: #6b7280;
          font-size: 18px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .leaflet-popup-close-button:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }
        
        @media (max-width: 640px) {
          .leaflet-popup-content-wrapper {
            font-size: 12px;
            border-radius: 12px;
          }
          
          .leaflet-popup-content {
            margin: 8px 12px;
          }
          
          .leaflet-container {
            font-size: 12px;
          }
          
          .leaflet-control-zoom a {
            width: 36px;
            height: 36px;
            line-height: 36px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
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

  // Enhanced trip details with terminal and destination location data
  const enhancedTripDetails = {
    ...tripDetails,
    terminal_location: terminalLocation,
    drop_off_location: dropOffLocation
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Trip {isEdit ? 'Updated' : 'Created'} Successfully!
              </h3>
              <p className="text-blue-100 text-sm">View locations and route details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'locations'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </div>
          </button>
          {(routeUrl || tripDetails.car_id) && (
            <button
              onClick={() => setActiveTab('route')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'route'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Navigation className="h-4 w-4" />
                Route
              </div>
            </button>
          )}
          <button
            onClick={() => setActiveTab('etit-route')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'etit-route'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Route className="h-4 w-4" />
              ETIT Route
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-gray-50">
          {activeTab === 'locations' && (
            <div className="space-y-6">
              {/* Enhanced Trip Summary */}
              {tripDetails.drop_off_point && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z"/>
                      </svg>
                    </div>
                    Trip Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {tripDetails.company && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500 block mb-1">Company:</span>
                        <p className="font-medium text-gray-900">{tripDetails.company}</p>
                      </div>
                    )}
                    {tripDetails.terminal && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500 block mb-1">Terminal:</span>
                        <p className="font-medium text-gray-900">{tripDetails.terminal}</p>
                      </div>
                    )}
                    {tripDetails.drop_off_point && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500 block mb-1">Drop-off:</span>
                        <p className="font-medium text-gray-900">{tripDetails.drop_off_point}</p>
                      </div>
                    )}
                    {tripDetails.receipt_no && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500 block mb-1">Receipt:</span>
                        <p className="font-medium text-gray-900">{tripDetails.receipt_no}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enhanced Terminal Location */}
                {terminalLocation && (
                  <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Terminal Location</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Coordinates</div>
                        <div className="font-mono text-sm text-gray-900">{formatCoordinates(terminalLocation)}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Google Maps URL</div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={terminalUrl}
                            readOnly
                            className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono text-gray-700"
                          />
                          <button
                            onClick={() => copyToClipboard(terminalUrl, 'terminal')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200 transition-colors font-medium"
                          >
                            <Copy className="h-3 w-3 mr-1 inline" />
                            {copied === 'terminal' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => window.open(terminalUrl, '_blank')}
                        className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                )}

                {/* Enhanced Drop-off Location */}
                {dropOffLocation && (
                  <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                        <MapPin className="h-5 w-5 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Drop-off Location</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Coordinates</div>
                        <div className="font-mono text-sm text-gray-900">{formatCoordinates(dropOffLocation)}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Google Maps URL</div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={dropOffUrl}
                            readOnly
                            className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono text-gray-700"
                          />
                          <button
                            onClick={() => copyToClipboard(dropOffUrl, 'dropoff')}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition-colors font-medium"
                          >
                            <Copy className="h-3 w-3 mr-1 inline" />
                            {copied === 'dropoff' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => window.open(dropOffUrl, '_blank')}
                        className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
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
              <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Navigation className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">Complete Route</h4>
                <p className="text-sm text-gray-600">From terminal to drop-off location with satellite view toggle</p>
              </div>

              {/* Enhanced Route Details Cards */}
              {routeData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-blue-200 rounded-xl p-6 text-center shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Navigation className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mb-1">
                      {typeof routeData.distance === 'number' 
                        ? routeData.distance.toFixed(1) 
                        : routeData.distance} km
                    </div>
                    <div className="text-xs text-blue-600 uppercase tracking-wide">Total Distance</div>
                  </div>
                  <div className="bg-white border border-green-200 rounded-xl p-6 text-center shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900 mb-1">
                      {formatDuration(routeData.duration)}
                    </div>
                    <div className="text-xs text-green-600 uppercase tracking-wide">Estimated Time</div>
                  </div>
                  <div className="bg-white border border-purple-200 rounded-xl p-6 text-center shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900 mb-1">OSRM</div>
                    <div className="text-xs text-purple-600 uppercase tracking-wide">Route Engine</div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 border border-gray-200 text-center text-gray-600 shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Navigation className="h-6 w-6 text-gray-500" />
                  </div>
                  Route data will be calculated by your OSRM server
                </div>
              )}

              {/* Enhanced Interactive Map with Route and Satellite Toggle */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <RouteMap 
                  terminalLocation={terminalLocation}
                  dropOffLocation={dropOffLocation}
                  routeData={routeData}
                />
              </div>
              
              <div className="p-4 bg-white border border-gray-200 rounded-xl text-xs text-gray-500 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  </svg>
                  Map data © OpenStreetMap contributors • Satellite imagery © Esri
                </div>
                {routeData && (
                  <span className="text-blue-600">
                    Route: {typeof routeData.distance === 'number' 
                      ? routeData.distance.toFixed(1) 
                      : routeData.distance} km, ~{formatDuration(routeData.duration)}
                  </span>
                )}
              </div>

              {/* Enhanced Route URL */}
              <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="text-sm font-medium text-blue-900 mb-4 flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Google Maps Route URL
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={routeUrl}
                    readOnly
                    className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-gray-700"
                  />
                  <button
                    onClick={() => copyToClipboard(routeUrl, 'route')}
                    className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  >
                    <Copy className="h-4 w-4 mr-2 inline" />
                    {copied === 'route' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => window.open(routeUrl, '_blank')}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Open Full Route in Google Maps
              </button>

              {/* Enhanced Comparison with database values */}
              {tripDetails.mileage && routeData && (
                <div className="bg-white border border-yellow-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h5 className="font-medium text-yellow-800">Distance Comparison</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-yellow-600 text-xs uppercase tracking-wide mb-1">Database</div>
                      <div className="font-bold text-yellow-900">{tripDetails.mileage} km</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-yellow-600 text-xs uppercase tracking-wide mb-1">OSRM</div>
                      <div className="font-bold text-yellow-900">
                        {typeof routeData.distance === 'number' 
                          ? routeData.distance.toFixed(1) 
                          : routeData.distance} km
                      </div>
                    </div>
                  </div>
                  {Math.abs(parseFloat(tripDetails.mileage) - parseFloat(routeData.distance)) > 1 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="text-yellow-700 text-sm">
                        <strong>Difference:</strong> {Math.abs(parseFloat(tripDetails.mileage) - parseFloat(routeData.distance)).toFixed(1)} km
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'etit-route' && (
            <ETITRoute 
              tripDetails={enhancedTripDetails}
            />
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-white">
          <div className="text-sm">
            {copied && (
              <span className="text-green-600 flex items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 mr-2" />
                {copied === 'terminal' ? 'Terminal' : copied === 'dropoff' ? 'Drop-off' : 'Route'} URL copied!
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            {routeUrl && (
              <button
                onClick={() => window.open(routeUrl, '_blank')}
                className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
              >
                View Route
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
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