import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import coordinatesData from './coordinates.json';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map centering
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const OpenStreetMapApp = () => {
  const [coordinates, setCoordinates] = useState([]);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(10);

  // Load coordinates from JSON file on component mount
  useEffect(() => {
    try {
      // Validate the imported JSON structure
      if (!Array.isArray(coordinatesData)) {
        throw new Error('JSON must be an array');
      }
      
      // Validate each coordinate object
      const validCoordinates = coordinatesData.filter(coord => {
        return coord.lat && coord.lng && 
               typeof coord.lat === 'number' && 
               typeof coord.lng === 'number';
      });

      if (validCoordinates.length === 0) {
        throw new Error('No valid coordinates found in the JSON file');
      }

      setCoordinates(validCoordinates);
      
      // Set initial map center to first coordinate
      if (validCoordinates.length > 0) {
        setMapCenter([validCoordinates[0].lat, validCoordinates[0].lng]);
      }
    } catch (err) {
      setError(`Error loading coordinates: ${err.message}`);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchInput.trim()) return;
    
    // Try to parse lat,lng input
    const coords = searchInput.split(',').map(coord => coord.trim());
    
    if (coords.length === 2) {
      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setMapZoom(15);
        return;
      }
    }
    
    // Search by name
    const foundCoordinate = coordinates.find(coord => 
      coord.name && coord.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    
    if (foundCoordinate) {
      setMapCenter([foundCoordinate.lat, foundCoordinate.lng]);
      setMapZoom(15);
    } else {
      alert('Location not found. Try searching by name or enter coordinates as "lat,lng"');
    }
  };

  // Calculate center point for the map (kept for potential future use)
  const getMapCenter = () => {
    if (coordinates.length === 0) return [30.0444, 31.2357]; // Default to Cairo
    
    const avgLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0) / coordinates.length;
    const avgLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0) / coordinates.length;
    
    return [avgLat, avgLng];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            PetroApp Gas Stations
          </h1>
          <p className="text-gray-600 text-lg">Discover and navigate through your locations</p>
        </div>
        
        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <form onSubmit={handleSearch} className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or enter coordinates (30.123,31.456)"
                  className="w-full pl-12 pr-4 py-3 border-0 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Search
              </button>
            </form>
            
            {error && (
              <div className="mt-4 text-center text-red-600 bg-red-50/80 backdrop-blur-sm p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}
            
            {coordinates.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50/80 backdrop-blur-sm p-3 rounded-xl border border-emerald-200">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{coordinates.length} locations loaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <MapContainer
            center={mapCenter || [30.0444, 31.2357]}
            zoom={mapZoom}
            style={{ height: '600px', width: '100%' }}
            className="rounded-2xl"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapController center={mapCenter} zoom={mapZoom} />
            
            {coordinates.map((coord, index) => (
              <Marker
                key={index}
                position={[coord.lat, coord.lng]}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">
                      {coord.name || `Location #${index + 1}`}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Latitude:</span>
                        <span className="font-mono">{coord.lat.toFixed(6)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Longitude:</span>
                        <span className="font-mono">{coord.lng.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default OpenStreetMapApp;