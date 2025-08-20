    import React, { useState, useEffect, useRef } from 'react';
    import { MapPin, Route, AlertCircle, Loader2, Play, Pause, RotateCcw, Square, Key, Layers, Navigation } from 'lucide-react';
    import apiClient from '../apiClient';

    // Create marker icons
    const createMarker = (color, size = 20, icon = '', label = '') => {
    if (!window.L) return null;
    
    return window.L.divIcon({
        html: `
        <div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${Math.max(10, size * 0.4)}px;
            z-index: 1000;
        ">
            ${icon || label}
        </div>
        `,
        className: 'custom-marker',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2]
    });
    };

    const createVehicleMarker = (size = 28) => {
    if (!window.L) return null;
    
    return window.L.divIcon({
        html: `
        <div style="
            width: ${size}px;
            height: ${size}px;
            background-color: #f59e0b;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: pulse 2s infinite;
        ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
        </div>
        `,
        className: 'vehicle-marker',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2]
    });
    };

const createStopMarker = (size = 24) => {
  if (!window.L) return null;
  
  return window.L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: #dc2626;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1500;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
        </svg>
      </div>
    `,
    className: 'stop-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

    const createTerminalMarker = (size = 30) => {
    if (!window.L) return null;
    
    return window.L.divIcon({
        html: `
        <div style="
            width: ${size}px;
            height: ${size}px;
            background-color: #059669;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2500;
        ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
        </div>
        `,
        className: 'terminal-marker',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2]
    });
    };

   const createDestinationMarker = (size = 40) => {
  if (!window.L) return null;
  
  return window.L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: #7c3aed;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2500;
      ">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="white">
          <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-1.07-.67-1.97-1.61-2.33L21 8.56l-1.23-1.33zM5 4c-1.11 0-2 .89-2 2v8c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2H5zm1 2h4v6H6V6zm8 2c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm2 4v5c0 .55.45 1 1 1s1-.45 1-1v-5h1v5c0 1.66-1.34 3-3 3s-3-1.34-3-3v-5h4z"/>
        </svg>
      </div>
    `,
    className: 'destination-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

    const ETITRouteMap = ({ coordinates, stops, currentIndex, terminalLocation, dropOffLocation, onLocationFocus }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const vehicleMarkerRef = useRef(null);
    const routeLineRef = useRef(null);
    const [satelliteView, setSatelliteView] = useState(false);
    const [baseLayers, setBaseLayers] = useState({});

    // Expose map focusing function
    useEffect(() => {
        if (onLocationFocus && mapInstanceRef.current) {
        onLocationFocus.current = (location, zoom = 16) => {
            if (mapInstanceRef.current && location) {
            mapInstanceRef.current.setView([location.lat, location.lng], zoom, {
                animate: true,
                duration: 1.0
            });
            }
        };
        }
    }, [onLocationFocus]);

    useEffect(() => {
        if (!mapRef.current || !coordinates || coordinates.length === 0) return;

        const loadLeaflet = async () => {
        if (window.L) {
            initializeMap();
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

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
        
        // Convert coordinates to LatLng format with validation
        const latLngs = coordinates.map(coord => {
            const lat = parseFloat(coord.Latitude || coord.lat);
            const lng = parseFloat(coord.Longitude || coord.lng || coord.lon);
            
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.warn('Invalid coordinate:', coord);
            return null;
            }
            
            return [lat, lng];
        }).filter(coord => coord !== null);

        if (latLngs.length === 0) {
            console.error('No valid coordinates found');
            return;
        }

        // Calculate bounds including stops and terminal/destination
        let allPoints = [...latLngs];
        if (stops && stops.length > 0) {
            const stopPoints = stops.map(stop => {
            const lat = parseFloat(stop.Latitude || stop.lat);
            const lng = parseFloat(stop.Longitude || stop.lng || stop.lon);
            
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.warn('Invalid stop coordinate:', stop);
                return null;
            }
            
            return [lat, lng];
            }).filter(coord => coord !== null);
            
            allPoints = [...allPoints, ...stopPoints];
        }

        // Add terminal and destination to bounds if provided
        if (terminalLocation) {
            allPoints.push([terminalLocation.lat, terminalLocation.lng]);
        }
        if (dropOffLocation) {
            allPoints.push([dropOffLocation.lat, dropOffLocation.lng]);
        }
        
        const bounds = L.latLngBounds(allPoints);

        // Initialize map
        const map = L.map(mapRef.current, {
            zoomControl: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            touchZoom: true
        }).fitBounds(bounds, { padding: [30, 30] });
        
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

        // Add route polyline
        if (latLngs.length > 1) {
            routeLineRef.current = L.polyline(latLngs, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1.0
            }).addTo(map);
        }

        // Add terminal marker if provided
        if (terminalLocation) {
            const terminalMarker = createTerminalMarker(32);
            L.marker([terminalLocation.lat, terminalLocation.lng], { icon: terminalMarker })
            .addTo(map)
            .bindPopup(`
                <div class="p-3">
                <h4 class="font-semibold text-green-700 mb-2 flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Terminal Location
                </h4>
                <div class="text-xs space-y-1">
                    <div><strong>Type:</strong> Start Point</div>
                    <div><strong>Coordinates:</strong> ${terminalLocation.lat.toFixed(6)}, ${terminalLocation.lng.toFixed(6)}</div>
                    ${terminalLocation.address ? `<div><strong>Address:</strong> ${terminalLocation.address}</div>` : ''}
                </div>
                <div class="mt-2">
                    <button onclick="window.open('https://www.google.com/maps?q=${terminalLocation.lat},${terminalLocation.lng}', '_blank')" 
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                    Open in Maps
                    </button>
                </div>
                </div>
            `);
        }

        // Add destination marker if provided
        if (dropOffLocation) {
            const destinationMarker = createDestinationMarker(32);
           L.marker([dropOffLocation.lat, dropOffLocation.lng], { icon: destinationMarker })
  .addTo(map)
  .bindPopup(`
    <div class="p-3">
      <h4 class="font-semibold text-purple-700 mb-2 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-1.07-.67-1.97-1.61-2.33L21 8.56l-1.23-1.33zM5 4c-1.11 0-2 .89-2 2v8c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2H5zm1 2h4v6H6V6zm8 2c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm2 4v5c0 .55.45 1 1 1s1-.45 1-1v-5h1v5c0 1.66-1.34 3-3 3s-3-1.34-3-3v-5h4z"/>
        </svg>
        Fuel Station
      </h4>
      <div class="text-xs space-y-1">
        <div><strong>Type:</strong> Drop-off Point</div>
        <div><strong>Coordinates:</strong> ${dropOffLocation.lat.toFixed(6)}, ${dropOffLocation.lng.toFixed(6)}</div>
        ${dropOffLocation.address ? `<div><strong>Address:</strong> ${dropOffLocation.address}</div>` : ''}
      </div>
      <div class="mt-2">
        <button onclick="window.open('https://www.google.com/maps?q=${dropOffLocation.lat},${dropOffLocation.lng}', '_blank')" 
                class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">
          Open in Maps
        </button>
      </div>
    </div>
  `);
        }

        // Add start marker for route data
        if (latLngs.length > 0) {
            const startMarker = createMarker('#16a34a', 26, '', 'S');
            L.marker(latLngs[0], { icon: startMarker })
            .addTo(map)
            .bindPopup(`
                <div class="p-3">
                <h4 class="font-semibold text-green-700 mb-2">Route Start</h4>
                <div class="text-xs space-y-1">
                    <div><strong>Time:</strong> ${coordinates[0].DateTime || coordinates[0].dateTime}</div>
                    <div><strong>Coordinates:</strong> ${latLngs[0][0]}, ${latLngs[0][1]}</div>
                </div>
                </div>
            `);
        }

        // Add end marker for route data
        if (latLngs.length > 1) {
            const endMarker = createMarker('#dc2626', 26, '', 'E');
            L.marker(latLngs[latLngs.length - 1], { icon: endMarker })
            .addTo(map)
            .bindPopup(`
                <div class="p-3">
                <h4 class="font-semibold text-red-700 mb-2">Route End</h4>
                <div class="text-xs space-y-1">
                    <div><strong>Time:</strong> ${coordinates[coordinates.length - 1].DateTime || coordinates[coordinates.length - 1].dateTime}</div>
                    <div><strong>Coordinates:</strong> ${latLngs[latLngs.length - 1][0]}, ${latLngs[latLngs.length - 1][1]}</div>
                </div>
                </div>
            `);
        }

        // Add stop markers with enhanced details
        if (stops && stops.length > 0) {
            stops.forEach((stop, index) => {
            const lat = parseFloat(stop.Latitude || stop.lat);
            const lng = parseFloat(stop.Longitude || stop.lng || stop.lon);
            
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.warn(`Invalid stop ${index + 1} coordinates:`, stop);
                return;
            }
            
            const stopMarker = createStopMarker(26);
            L.marker([lat, lng], { icon: stopMarker })
  .addTo(map)
  .bindPopup(`
    <div class="p-3">
      <h4 class="font-semibold text-red-700 mb-2 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
        </svg>
        Stop ${index + 1}
      </h4>
      <div class="text-xs space-y-1">
        <div><strong>From:</strong> ${stop.From || stop.from}</div>
        <div><strong>To:</strong> ${stop.To || stop.to}</div>
        <div><strong>Duration:</strong> ${stop.Duration || stop.duration}</div>
        <div><strong>Coordinates:</strong> ${lat}, ${lng}</div>
        ${(stop.Address || stop.address) ? `<div><strong>Address:</strong> ${stop.Address || stop.address}</div>` : ''}
      </div>
      <div class="mt-2">
        <button onclick="window.open('https://www.google.com/maps?q=${lat},${lng}', '_blank')" 
                class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
          Open in Maps
        </button>
      </div>
    </div>
  `);
            });
        }

        // Add vehicle marker
        const vehicleMarker = createVehicleMarker(30);
        vehicleMarkerRef.current = L.marker(latLngs[0], { icon: vehicleMarker }).addTo(map);
        };

        loadLeaflet();

        return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
        };
    }, [coordinates, stops, terminalLocation, dropOffLocation]);

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

    // Update vehicle position
    useEffect(() => {
        if (vehicleMarkerRef.current && coordinates && coordinates[currentIndex]) {
        const coord = coordinates[currentIndex];
        const lat = parseFloat(coord.Latitude || coord.lat);
        const lng = parseFloat(coord.Longitude || coord.lng || coord.lon);
        
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            const newLatLng = [lat, lng];
            vehicleMarkerRef.current.setLatLng(newLatLng);
            
            vehicleMarkerRef.current.bindPopup(`
            <div class="p-3">
                <h4 class="font-semibold text-yellow-700 mb-2">Vehicle Position</h4>
                <div class="text-xs space-y-1">
                <div><strong>Time:</strong> ${coord.DateTime || coord.dateTime}</div>
                <div><strong>Point:</strong> ${currentIndex + 1} of ${coordinates.length}</div>
                <div><strong>Coordinates:</strong> ${lat}, ${lng}</div>
                </div>
                <div class="mt-2">
                <button onclick="window.open('https://www.google.com/maps?q=${lat},${lng}', '_blank')" 
                        class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">
                    Open in Maps
                </button>
                </div>
            </div>
            `);
        }
        }
    }, [currentIndex, coordinates]);

    return (
        <div className="relative">
        <div 
            ref={mapRef} 
            style={{ width: '100%', height: '500px' }}
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
        
        <style jsx>{`
            .custom-marker, .vehicle-marker, .stop-marker, .terminal-marker, .destination-marker {
            background: transparent;
            border: none;
            }
            
            .custom-marker:hover, .vehicle-marker:hover, .stop-marker:hover, 
            .terminal-marker:hover, .destination-marker:hover {
            transform: scale(1.1);
            transition: transform 0.2s ease;
            }
            
            @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
            }
            
            .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.05);
            font-family: inherit;
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
            
            .leaflet-control-zoom a:hover {
            background: rgba(59, 130, 246, 0.1);
            color: #2563EB;
            }
            
            .leaflet-container {
            background: #f8fafc;
            font-family: inherit;
            border-radius: 12px;
            }
        `}</style>
        </div>
    );
    };

    const ETITRoute = ({ tripDetails }) => {
    const [routeData, setRouteData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Timeline state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);
    const intervalRef = useRef(null);
    
    // Map focus function ref
    const mapFocusRef = useRef(null);

    // Enhanced location data from tripDetails
    const terminalLocation = tripDetails?.terminal_location ? {
        lat: parseFloat(tripDetails.terminal_location.lat || tripDetails.terminal_location.latitude),
        lng: parseFloat(tripDetails.terminal_location.lng || tripDetails.terminal_location.longitude),
        address: tripDetails.terminal_location.address || tripDetails.terminal
    } : null;

    const dropOffLocation = tripDetails?.drop_off_location ? {
        lat: parseFloat(tripDetails.drop_off_location.lat || tripDetails.drop_off_location.latitude),
        lng: parseFloat(tripDetails.drop_off_location.lng || tripDetails.drop_off_location.longitude),
        address: tripDetails.drop_off_location.address || tripDetails.drop_off_point
    } : null;

    // Function to focus on terminal location
    const focusOnTerminal = () => {
        if (mapFocusRef.current && terminalLocation) {
        mapFocusRef.current(terminalLocation, 16);
        }
    };

    // Function to focus on drop-off location
    const focusOnDropOff = () => {
        if (mapFocusRef.current && dropOffLocation) {
        mapFocusRef.current(dropOffLocation, 16);
        }
    };

    const fetchRouteData = async () => {
        if (!tripDetails?.car_id) {
        setError('Car ID is required');
        return;
        }

        if (!tripDetails?.date) {
        setError('Date is required');
        return;
        }

        setLoading(true);
        setError('');

        try {
        const tripDate = new Date(tripDetails.date);
        
        const fromFormatted = `${(tripDate.getMonth() + 1).toString().padStart(2, '0')}/${tripDate.getDate().toString().padStart(2, '0')}/${tripDate.getFullYear()}%2000:00:00`;
        const toFormatted = `${(tripDate.getMonth() + 1).toString().padStart(2, '0')}/${tripDate.getDate().toString().padStart(2, '0')}/${tripDate.getFullYear()}%2023:59:59`;

        const response = await apiClient.get('/api/protected/GetVehicleRouteByDate', {
            params: {
            car_id: tripDetails.car_id,
            from: fromFormatted,
            to: toFormatted
            }
        });

        if (response.data.success && response.data.coordinates) {
            setRouteData(response.data);
            setCurrentIndex(0);
            if (response.data.coordinates.length === 0) {
            setError('No route data found for the selected date');
            }
        } else {
            setError('No route data available');
        }
        } catch (err) {
        console.error('Error fetching route data:', err);
        setError(err.response?.data?.error || 'Failed to fetch route data');
        } finally {
        setLoading(false);
        }
    };

    // Timeline controls
    const playTimeline = () => {
        if (!routeData?.coordinates || currentIndex >= routeData.coordinates.length - 1) return;
        
        setIsPlaying(true);
        intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
            if (prev >= routeData.coordinates.length - 1) {
            setIsPlaying(false);
            return prev;
            }
            return prev + 1;
        });
        }, playbackSpeed);
    };

    const pauseTimeline = () => {
        setIsPlaying(false);
        if (intervalRef.current) {
        clearInterval(intervalRef.current);
        }
    };

    const resetTimeline = () => {
        setIsPlaying(false);
        setCurrentIndex(0);
        if (intervalRef.current) {
        clearInterval(intervalRef.current);
        }
    };

    // Update interval when speed changes
    useEffect(() => {
        if (isPlaying && intervalRef.current) {
        clearInterval(intervalRef.current);
        playTimeline();
        }
    }, [playbackSpeed]);

    // Cleanup
    useEffect(() => {
        return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        };
    }, []);

    const calculateRouteStats = (coordinates) => {
        if (!coordinates || coordinates.length === 0) return null;

        let totalDistance = 0;
        for (let i = 1; i < coordinates.length; i++) {
        const lat1 = parseFloat(coordinates[i - 1].Latitude || coordinates[i - 1].lat);
        const lon1 = parseFloat(coordinates[i - 1].Longitude || coordinates[i - 1].lng || coordinates[i - 1].lon);
        const lat2 = parseFloat(coordinates[i].Latitude || coordinates[i].lat);
        const lon2 = parseFloat(coordinates[i].Longitude || coordinates[i].lng || coordinates[i].lon);

        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        totalDistance += R * c;
        }

        return {
        totalPoints: coordinates.length,
        distance: totalDistance.toFixed(2)
        };
    };

    const stats = routeData?.coordinates ? calculateRouteStats(routeData.coordinates) : null;
    const currentCoordinate = routeData?.coordinates ? routeData.coordinates[currentIndex] : null;

    return (
        <div className="space-y-6">
        {/* Header */}
        <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Route className="h-8 w-8 text-indigo-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2 text-lg">ETIT Vehicle Route</h4>
            <p className="text-sm text-gray-600">View actual vehicle tracking data from ETIT system</p>
            {tripDetails?.date && (
            <p className="text-sm text-indigo-600 mt-2">Date: {tripDetails.date}</p>
            )}
        </div>

        {/* Enhanced Trip Context */}
        {(terminalLocation || dropOffLocation) && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <Navigation className="h-5 w-5 text-blue-600" />
                </div>
                <h5 className="font-medium text-gray-900">Trip Locations</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {terminalLocation && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <h6 className="font-medium text-green-800">Terminal</h6>
                    </div>
                    <div className="text-sm space-y-1">
                    <div className="text-green-700 font-mono text-xs">
                        {terminalLocation.lat.toFixed(6)}, {terminalLocation.lng.toFixed(6)}
                    </div>
                    {terminalLocation.address && (
                        <div className="text-green-700">{terminalLocation.address}</div>
                    )}
                    </div>
                </div>
                )}
                {dropOffLocation && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                        <MapPin className="w-3 h-3 text-purple-600" />
                    </div>
                    <h6 className="font-medium text-purple-800">Destination</h6>
                    </div>
                    <div className="text-sm space-y-1">
                    <div className="text-purple-700 font-mono text-xs">
                        {dropOffLocation.lat.toFixed(6)}, {dropOffLocation.lng.toFixed(6)}
                    </div>
                    {dropOffLocation.address && (
                        <div className="text-purple-700">{dropOffLocation.address}</div>
                    )}
                    </div>
                </div>
                )}
            </div>
            </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-center">
            <button
                onClick={fetchRouteData}
                disabled={loading || !tripDetails?.car_id}
                className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
                {loading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading Route Data...
                </>
                ) : (
                <>
                    <Route className="h-4 w-4 mr-2" />
                    Fetch Route Data
                </>
                )}
            </button>
            </div>

            {!tripDetails?.car_id && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-800">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">Car ID is required to fetch route data</span>
                </div>
            </div>
            )}

            {!tripDetails?.date && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-800">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">Date is required to fetch route data</span>
                </div>
            </div>
            )}
        </div>

        {/* Error Display */}
        {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center text-red-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Error:</span>
                <span className="ml-1">{error}</span>
            </div>
            </div>
        )}

        {/* Route Statistics */}
        {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-blue-200 rounded-xl p-4 text-center shadow-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-blue-900">{stats.totalPoints}</div>
                <div className="text-xs text-blue-600 uppercase tracking-wide">Data Points</div>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-4 text-center shadow-sm">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Route className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-900">{stats.distance} km</div>
                <div className="text-xs text-green-600 uppercase tracking-wide">Distance</div>
            </div>
            <div className="bg-white border border-yellow-200 rounded-xl p-4 text-center shadow-sm">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Key className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="text-xl font-bold text-yellow-900">{routeData?.total_stops || 0}</div>
                <div className="text-xs text-yellow-600 uppercase tracking-wide">Stops</div>
            </div>
            </div>
        )}

        {/* Timeline Controls */}
        {routeData?.coordinates && routeData.coordinates.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h5 className="font-medium text-gray-900 mb-4">Vehicle Timeline</h5>
            
            {/* Current Position Info */}
            {currentCoordinate && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                    <span className="text-yellow-700 font-medium">Current Time:</span>
                    <p className="text-yellow-900">{currentCoordinate.DateTime || currentCoordinate.dateTime}</p>
                    </div>
                    <div>
                    <span className="text-yellow-700 font-medium">Position:</span>
                    <p className="text-yellow-900">{currentIndex + 1} of {routeData.coordinates.length}</p>
                    </div>
                    <div>
                    <span className="text-yellow-700 font-medium">Coordinates:</span>
                    <p className="text-yellow-900 font-mono text-xs">
                        {parseFloat(currentCoordinate.Latitude || currentCoordinate.lat)}, {parseFloat(currentCoordinate.Longitude || currentCoordinate.lng || currentCoordinate.lon)}
                    </p>
                    </div>
                </div>
                </div>
            )}

            {/* Timeline Slider */}
            <div className="mb-4">
                <input
                type="range"
                min="0"
                max={routeData.coordinates.length - 1}
                value={currentIndex}
                onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer timeline-slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{routeData.coordinates[0]?.DateTime || routeData.coordinates[0]?.dateTime}</span>
                <span>{routeData.coordinates[routeData.coordinates.length - 1]?.DateTime || routeData.coordinates[routeData.coordinates.length - 1]?.dateTime}</span>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-4">
                <button
                onClick={resetTimeline}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
                </button>

                <button
                onClick={isPlaying ? pauseTimeline : playTimeline}
                disabled={currentIndex >= routeData.coordinates.length - 1}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                {isPlaying ? (
                    <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                    </>
                ) : (
                    <>
                    <Play className="h-4 w-4 mr-1" />
                    Play
                    </>
                )}
                </button>

                <button
                onClick={() => {
                    pauseTimeline();
                    setCurrentIndex(routeData.coordinates.length - 1);
                }}
                className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                <Square className="h-4 w-4 mr-1" />
                End
                </button>

                <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                <option value={2000}>0.5x Speed</option>
                <option value={1000}>1x Speed</option>
                <option value={500}>2x Speed</option>
                <option value={250}>4x Speed</option>
                <option value={100}>10x Speed</option>
                </select>
            </div>
            </div>
        )}

        {/* Enhanced Route Map with Terminal and Destination pins */}
        {routeData?.coordinates && routeData.coordinates.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <ETITRouteMap 
                coordinates={routeData.coordinates} 
                stops={routeData.stops}
                currentIndex={currentIndex}
                terminalLocation={terminalLocation}
                dropOffLocation={dropOffLocation}
                onLocationFocus={mapFocusRef}
            />
            </div>
        )}

        {/* Route Details */}
        {routeData && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h5 className="font-medium text-gray-900 mb-4">Route Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block mb-1">Car ID:</span>
                <p className="font-medium text-gray-900">{routeData.car_id}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block mb-1">ETIT Car ID:</span>
                <p className="font-medium text-gray-900">{routeData.etit_car_id || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block mb-1">Date:</span>
                <p className="font-medium text-gray-900">{tripDetails?.date || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block mb-1">Total Points:</span>
                <p className="font-medium text-gray-900">{routeData.total_points}</p>
                </div>
            </div>
            </div>
        )}

        {/* Map Attribution */}
        {routeData?.coordinates && routeData.coordinates.length > 0 && (
            <div className="p-4 bg-white border border-gray-200 rounded-xl text-xs text-gray-500 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
                Route data from ETIT GPS tracking system • Map data © OpenStreetMap contributors
            </div>
            </div>
        )}

        {/* Custom CSS */}
        <style jsx>{`
            .timeline-slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            .timeline-slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
        `}</style>
        </div>
    );
    };

export default ETITRoute;