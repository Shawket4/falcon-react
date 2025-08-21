import { useState, useEffect, useRef } from 'react';
import { Layers } from 'lucide-react';

// Marker creation functions
const createMarker = (color, size = 20, icon = '', label = '') => {
    if (!window.L) return null;
    return window.L.divIcon({
        html: `<div style="width: ${size}px; height: ${size}px; background-color: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${Math.max(10, size * 0.4)}px; z-index: 1000;">${icon || label}</div>`,
        className: 'custom-marker',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2]
    });
};

const createVehicleMarker = (size = 28) => {
    if (!window.L) return null;
    return window.L.divIcon({
        html: `<div style="width: ${size}px; height: ${size}px; background-color: #f59e0b; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2000; animation: pulse 2s infinite;"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>`,
        className: 'vehicle-marker',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2]
    });
};

const createStopMarker = (size = 24) => {
    if (!window.L) return null;
    return window.L.divIcon({
        html: `<div style="width: ${size}px; height: ${size}px; background-color: #dc2626; border: 3px solid white; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1500;"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg></div>`,
        className: 'stop-marker',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2]
    });
};

const createTerminalMarker = (size = 30) => {
    if (!window.L) return null;
    return window.L.divIcon({
        html: `<div style="width: ${size}px; height: ${size}px; background-color: #059669; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2500;"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>`,
        className: 'terminal-marker',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2]
    });
};

const createDestinationMarker = (size = 40) => {
    if (!window.L) return null;
    return window.L.divIcon({
        html: `<div style="width: ${size}px; height: ${size}px; background-color: #7c3aed; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2500;"><svg width="21" height="21" viewBox="0 0 24 24" fill="white"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-1.07-.67-1.97-1.61-2.33L21 8.56l-1.23-1.33zM5 4c-1.11 0-2 .89-2 2v8c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2H5zm1 2h4v6H6V6zm8 2c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm2 4v5c0 .55.45 1 1 1s1-.45 1-1v-5h1v5c0 1.66-1.34 3-3 3s-3-1.34-3-3v-5h4z"/></svg></div>`,
        className: 'destination-marker',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2]
    });
};

const ETITRouteMap = ({ 
    coordinates, 
    stops, 
    currentIndex, 
    terminalLocation, 
    dropOffLocation, 
    onLocationFocus,
    routeDataVersion // Add this to force re-render when route data changes
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const vehicleMarkerRef = useRef(null);
    const routeLayerRef = useRef(null);
    const markersRef = useRef([]);
    const [satelliteView, setSatelliteView] = useState(false);
    const [baseLayers, setBaseLayers] = useState({});
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    // Create a key that changes when route data changes
    const routeKey = `${coordinates?.length || 0}-${stops?.length || 0}-${routeDataVersion || 0}`;

    // Load Leaflet library
    useEffect(() => {
        const loadLeaflet = async () => {
            if (window.L) {
                setLeafletLoaded(true);
                return;
            }

            try {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);

                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => setLeafletLoaded(true);
                script.onerror = () => console.error('Failed to load Leaflet');
                document.head.appendChild(script);
            } catch (error) {
                console.error('Error loading Leaflet:', error);
            }
        };

        loadLeaflet();
    }, []);

    // Initialize/reinitialize map when route data changes
    useEffect(() => {
        if (!mapRef.current || !coordinates || coordinates.length === 0 || !leafletLoaded) {
            return;
        }

        // Clean up existing map
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
            vehicleMarkerRef.current = null;
            routeLayerRef.current = null;
            markersRef.current = [];
        }

        initializeMap();
    }, [routeKey, leafletLoaded]);

    // Set up location focus callback
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
    }, [onLocationFocus, mapInstanceRef.current]);

    const initializeMap = () => {
        if (!window.L || !coordinates || coordinates.length === 0) return;

        const L = window.L;

        // Process coordinates
        const latLngs = coordinates.map(coord => {
            const lat = parseFloat(coord.Latitude || coord.lat);
            const lng = parseFloat(coord.Longitude || coord.lng || coord.lon);
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return null;
            }
            return [lat, lng];
        }).filter(coord => coord !== null);

        if (latLngs.length === 0) return;

        // Calculate bounds
        let allPoints = [...latLngs];
        if (stops?.length > 0) {
            const stopPoints = stops.map(stop => {
                const lat = parseFloat(stop.Latitude || stop.lat);
                const lng = parseFloat(stop.Longitude || stop.lng || stop.lon);
                if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
                return null;
            }).filter(coord => coord !== null);
            allPoints = [...allPoints, ...stopPoints];
        }

        if (terminalLocation) allPoints.push([terminalLocation.lat, terminalLocation.lng]);
        if (dropOffLocation) allPoints.push([dropOffLocation.lat, dropOffLocation.lng]);

        // Create map
        const bounds = L.latLngBounds(allPoints);
        const map = L.map(mapRef.current, {
            zoomControl: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            touchZoom: true
        }).fitBounds(bounds, { padding: [30, 30] });
        
        mapInstanceRef.current = map;

        // Set up base layers
        const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            subdomains: "abcd",
            maxZoom: 20
        });

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 19
        });

        const currentLayer = satelliteView ? satelliteLayer : streetLayer;
        currentLayer.addTo(map);
        setBaseLayers({ street: streetLayer, satellite: satelliteLayer });

        // Add route polyline
        if (latLngs.length > 1) {
            routeLayerRef.current = L.polyline(latLngs, {
                color: '#3b82f6',
                weight: 4,
                opacity: 0.7,
                smoothFactor: 1.0
            }).addTo(map);
        }

        // Add markers
        addAllMarkers(map, L, latLngs);
    };

    const addAllMarkers = (map, L, latLngs) => {
        const markers = [];

        // Terminal marker
        if (terminalLocation) {
            const marker = L.marker([terminalLocation.lat, terminalLocation.lng], { 
                icon: createTerminalMarker(32) 
            }).addTo(map).bindPopup(`
                <div class="p-3">
                    <h4 class="font-semibold text-green-700">Terminal Location</h4>
                    <div class="text-xs">${terminalLocation.lat.toFixed(6)}, ${terminalLocation.lng.toFixed(6)}</div>
                    ${terminalLocation.address ? `<div class="text-xs mt-1">${terminalLocation.address}</div>` : ''}
                </div>
            `);
            markers.push(marker);
        }

        // Drop-off marker
        if (dropOffLocation) {
            const marker = L.marker([dropOffLocation.lat, dropOffLocation.lng], { 
                icon: createDestinationMarker(40) 
            }).addTo(map).bindPopup(`
                <div class="p-3">
                    <h4 class="font-semibold text-purple-700">Fuel Station</h4>
                    <div class="text-xs">${dropOffLocation.lat.toFixed(6)}, ${dropOffLocation.lng.toFixed(6)}</div>
                    ${dropOffLocation.address ? `<div class="text-xs mt-1">${dropOffLocation.address}</div>` : ''}
                </div>
            `);
            markers.push(marker);
        }

        // Route start/end markers
        if (latLngs.length > 0) {
            const startMarker = L.marker(latLngs[0], { 
                icon: createMarker('#16a34a', 26, '', 'S') 
            }).addTo(map).bindPopup('<div class="p-3"><h4 class="font-semibold text-green-700">Route Start</h4></div>');
            markers.push(startMarker);
            
            if (latLngs.length > 1) {
                const endMarker = L.marker(latLngs[latLngs.length - 1], { 
                    icon: createMarker('#dc2626', 26, '', 'E') 
                }).addTo(map).bindPopup('<div class="p-3"><h4 class="font-semibold text-red-700">Route End</h4></div>');
                markers.push(endMarker);
            }
        }

        // Stop markers
        if (stops?.length > 0) {
            stops.forEach((stop, index) => {
                const lat = parseFloat(stop.Latitude || stop.lat);
                const lng = parseFloat(stop.Longitude || stop.lng || stop.lon);
                if (!isNaN(lat) && !isNaN(lng)) {
                    const stopMarker = L.marker([lat, lng], { 
                        icon: createStopMarker(26) 
                    }).addTo(map).bindPopup(`
                        <div class="p-3">
                            <h4 class="font-semibold text-red-700 mb-2 flex items-center">
                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                                </svg>
                                Stop ${index + 1}
                            </h4>
                            <div class="text-xs space-y-1">
                                <div><strong>From:</strong> ${stop.From || stop.from || 'N/A'}</div>
                                <div><strong>To:</strong> ${stop.To || stop.to || 'N/A'}</div>
                                <div><strong>Duration:</strong> ${stop.Duration || stop.duration || 'N/A'}</div>
                                <div><strong>Coordinates:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
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
                    markers.push(stopMarker);
                }
            });
        }

        // Vehicle marker (always add last so it's on top)
        if (latLngs.length > 0) {
            vehicleMarkerRef.current = L.marker(latLngs[0], { 
                icon: createVehicleMarker(30) 
            }).addTo(map);
            markers.push(vehicleMarkerRef.current);
        }

        markersRef.current = markers;
    };

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
            
            if (!isNaN(lat) && !isNaN(lng)) {
                vehicleMarkerRef.current.setLatLng([lat, lng]);
                vehicleMarkerRef.current.bindPopup(`
                    <div class="p-3">
                        <h4 class="font-semibold text-yellow-700">Vehicle Position</h4>
                        <div class="text-xs">${coord.DateTime || coord.dateTime || 'N/A'}</div>
                        <div class="text-xs mt-1">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
                    </div>
                `);
            }
        }
    }, [currentIndex, coordinates]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                vehicleMarkerRef.current = null;
                routeLayerRef.current = null;
                markersRef.current = [];
            }
        };
    }, []);

    if (!coordinates || coordinates.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <div className="text-gray-400 mb-2">No route data available</div>
                <div className="text-sm text-gray-500">Configure and fetch route data to view the map</div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div 
                ref={mapRef} 
                style={{ width: '100%', height: '500px' }} 
                className="border rounded-xl overflow-hidden shadow-sm bg-gray-50" 
            />
            <div className="absolute top-4 right-4 z-[1000]">
                <button
                    onClick={() => setSatelliteView(!satelliteView)}
                    className={`flex items-center px-3 py-2 rounded-lg shadow-lg border backdrop-blur-sm transition-all ${
                        satelliteView ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    <Layers className="h-4 w-4 mr-2" />
                    {satelliteView ? 'Street' : 'Satellite'}
                </button>
            </div>
            <style jsx>{`
                @keyframes pulse { 
                    0% { transform: scale(1); } 
                    50% { transform: scale(1.05); } 
                    100% { transform: scale(1); } 
                }
                .leaflet-popup-content-wrapper { border-radius: 12px; }
                .leaflet-control-zoom { border-radius: 8px; }
            `}</style>
        </div>
    );
};

export default ETITRouteMap;