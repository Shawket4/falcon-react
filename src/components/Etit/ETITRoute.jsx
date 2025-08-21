import { useState, useEffect, useRef } from 'react';
import { Route, AlertCircle } from 'lucide-react';
import apiClient from '../../apiClient';

// Import the separated components
import ETITRouteMap from './ETITRouteMap';
import RouteConfiguration from './RouteConfiguration';
import TimelineControls from './TimelineControls';
import RouteStatistics from './RouteStatistics';

const ETITRoute = ({ tripDetails }) => {
    // Route data state
    const [routeData, setRouteData] = useState(null);
    const [storedRouteData, setStoredRouteData] = useState(null);
    const [routeDataVersion, setRouteDataVersion] = useState(0); // Used to force map re-render
    
    // Loading states
    const [loading, setLoading] = useState(false);
    const [storageLoading, setStorageLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Configuration state
    const [isEditing, setIsEditing] = useState(false);
    const [hasStoredRoute, setHasStoredRoute] = useState(false);
    
    // Timeline state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);
    const intervalRef = useRef(null);
    
    // Date selection state
    const [selectedFromDate, setSelectedFromDate] = useState('');
    const [selectedToDate, setSelectedToDate] = useState('');
    const [selectedFromTime, setSelectedFromTime] = useState('00:00');
    const [selectedToTime, setSelectedToTime] = useState('23:59');
    
    // Map focus reference
    const mapFocusRef = useRef(null);

    // Extract location data from trip details
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

    // Check for stored route on mount and when trip details change
    useEffect(() => {
        if (tripDetails?.id) {
            checkStoredRoute();
        }
    }, [tripDetails?.id]);

    // Reset timeline when route data changes
    useEffect(() => {
        if (routeData?.coordinates) {
            setCurrentIndex(0);
            setIsPlaying(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [routeData?.coordinates?.length]);

    const checkStoredRoute = async () => {
        if (!tripDetails?.id) return;

        try {
            const response = await apiClient.get('/api/protected/GetVehicleRouteByTrip', {
                params: { trip_id: tripDetails.id }
            });

            if (response.data.success && response.data.coordinates?.length > 0) {
                setStoredRouteData(response.data);
                setRouteData(response.data);
                setHasStoredRoute(true);
                setCurrentIndex(0);
                setRouteDataVersion(prev => prev + 1); // Force map re-render
                setError(''); // Clear any previous errors
            } else {
                setHasStoredRoute(false);
                setStoredRouteData(null);
            }
        } catch (err) {
            console.error('Error checking stored route:', err);
            setHasStoredRoute(false);
            setStoredRouteData(null);
        }
    };

    const storeRouteData = async () => {
        if (!tripDetails?.id || !selectedFromDate || !selectedToDate) {
            setError('Trip ID and date range are required');
            return;
        }

        setStorageLoading(true);
        setError('');

        try {
            const fromDateTime = `${selectedFromDate.split('-').join('/')} ${selectedFromTime}:00`;
            const toDateTime = `${selectedToDate.split('-').join('/')} ${selectedToTime}:59`;

            const response = await apiClient.get('/api/protected/StoreVehicleRouteData', {
                params: {
                    trip_id: tripDetails.id,
                    from: encodeURIComponent(fromDateTime),
                    to: encodeURIComponent(toDateTime)
                }
            });

            if (response.data.success && response.data.coordinates?.length > 0) {
                setStoredRouteData(response.data);
                setRouteData(response.data);
                setHasStoredRoute(true);
                setIsEditing(false);
                setCurrentIndex(0);
                setRouteDataVersion(prev => prev + 1); // Force map re-render
                setError('');
            } else {
                setError(response.data.error || 'No route data found for the specified time range');
            }
        } catch (err) {
            console.error('Error storing route data:', err);
            setError(err.response?.data?.error || 'Failed to store route data');
        } finally {
            setStorageLoading(false);
        }
    };

    const fetchRouteDataByDate = async () => {
        if (!tripDetails?.car_id || !selectedFromDate || !selectedToDate) {
            setError('Car ID and date range are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const fromDateTime = `${selectedFromDate.split('-').join('/')} ${selectedFromTime}:00`;
            const toDateTime = `${selectedToDate.split('-').join('/')} ${selectedToTime}:59`;

            const response = await apiClient.get('/api/protected/GetVehicleRouteByDate', {
                params: {
                    car_id: tripDetails.car_id,
                    from: encodeURIComponent(fromDateTime),
                    to: encodeURIComponent(toDateTime)
                }
            });

            if (response.data.success && response.data.coordinates?.length > 0) {
                setRouteData(response.data);
                setCurrentIndex(0);
                setRouteDataVersion(prev => prev + 1); // Force map re-render
                setError('');
            } else {
                setError('No route data found for the selected date range');
                setRouteData(null);
            }
        } catch (err) {
            console.error('Error fetching route data:', err);
            setError(err.response?.data?.error || 'Failed to fetch route data');
            setRouteData(null);
        } finally {
            setLoading(false);
        }
    };

    // Timeline control functions
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
            intervalRef.current = null;
        }
    };

    const resetTimeline = () => {
        setIsPlaying(false);
        setCurrentIndex(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Update playback speed
    useEffect(() => {
        if (isPlaying && intervalRef.current) {
            clearInterval(intervalRef.current);
            playTimeline();
        }
    }, [playbackSpeed]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

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
                    <p className="text-sm text-indigo-600 mt-2">Trip Date: {tripDetails.date}</p>
                )}
                {tripDetails?.id && (
                    <p className="text-sm text-gray-600 mt-1">Trip ID: {tripDetails.id}</p>
                )}
            </div>

            {/* Route Configuration */}
            <RouteConfiguration
                tripDetails={tripDetails}
                hasStoredRoute={hasStoredRoute}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                selectedFromDate={selectedFromDate}
                setSelectedFromDate={setSelectedFromDate}
                selectedToDate={selectedToDate}
                setSelectedToDate={setSelectedToDate}
                selectedFromTime={selectedFromTime}
                setSelectedFromTime={setSelectedFromTime}
                selectedToTime={selectedToTime}
                setSelectedToTime={setSelectedToTime}
                onFetchData={fetchRouteDataByDate}
                onStoreData={storeRouteData}
                loading={loading}
                storageLoading={storageLoading}
                storedRouteData={storedRouteData}
            />

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center text-red-800">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <div>
                            <span className="font-medium">Error:</span>
                            <span className="ml-1">{error}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Route Statistics */}
            {routeData && <RouteStatistics routeData={routeData} />}

            {/* Timeline Controls */}
            {routeData?.coordinates && routeData.coordinates.length > 0 && (
                <TimelineControls
                    routeData={routeData}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    isPlaying={isPlaying}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                    onPlay={playTimeline}
                    onPause={pauseTimeline}
                    onReset={resetTimeline}
                />
            )}

            {/* Map */}
            {routeData?.coordinates && routeData.coordinates.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <ETITRouteMap 
                        coordinates={routeData.coordinates} 
                        stops={routeData.stops}
                        currentIndex={currentIndex}
                        terminalLocation={terminalLocation}
                        dropOffLocation={dropOffLocation}
                        onLocationFocus={mapFocusRef}
                        routeDataVersion={routeDataVersion}
                    />
                </div>
            ) : (
                !loading && !storageLoading && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                        <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <div className="text-gray-600 mb-2">No route data loaded</div>
                        <div className="text-sm text-gray-500">
                            {hasStoredRoute ? 
                                'Click "Edit Route" to modify the configuration or view stored data' :
                                'Configure the date range and fetch route data to view the map'
                            }
                        </div>
                    </div>
                )
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
        </div>
    );
};

export default ETITRoute;