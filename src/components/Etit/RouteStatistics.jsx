import { MapPin, Route, Key, Gauge, Clock, Fuel } from 'lucide-react';

const RouteStatistics = ({ routeData }) => {
    if (!routeData) return null;

    const calculateDistance = (coordinates) => {
        if (!coordinates || coordinates.length < 2) return 0;
        
        let totalDistance = 0;
        for (let i = 1; i < coordinates.length; i++) {
            const lat1 = parseFloat(coordinates[i - 1].Latitude || coordinates[i - 1].lat);
            const lon1 = parseFloat(coordinates[i - 1].Longitude || coordinates[i - 1].lng || coordinates[i - 1].lon);
            const lat2 = parseFloat(coordinates[i].Latitude || coordinates[i].lat);
            const lon2 = parseFloat(coordinates[i].Longitude || coordinates[i].lng || coordinates[i].lon);
            
            if (!isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2)) {
                // Haversine formula
                const R = 6371; // Earth's radius in kilometers
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                         Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                         Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                totalDistance += R * c;
            }
        }
        return totalDistance;
    };

    const stats = {
        totalPoints: routeData.coordinates?.length || 0,
        calculatedDistance: routeData.coordinates ? calculateDistance(routeData.coordinates) : 0,
        apiDistance: routeData.trip_summary?.TotalMileage,
        totalStops: routeData.total_stops || routeData.stops?.length || 0,
        activeTime: routeData.trip_summary?.TotalActiveTime,
        idleTime: routeData.trip_summary?.TotalIdleTime,
        fuelConsumption: routeData.trip_summary?.TotalFuelConsumption,
        maxSpeed: routeData.trip_summary?.MaxSpeed,
        avgSpeed: routeData.trip_summary?.AvgSpeed
    };

    // Determine which distance to display
    const displayDistance = stats.apiDistance || stats.calculatedDistance.toFixed(2);
    const distanceSource = stats.apiDistance ? 'API Distance' : 'Calculated Distance';

    const StatCard = ({ icon: Icon, value, label, color, bgColor, textColor }) => (
        <div className={`${bgColor} border-2 ${color} rounded-xl p-4 text-center shadow-sm transition-all hover:shadow-md`}>
            <div className={`w-10 h-10 ${color.replace('border-', 'bg-').replace('200', '100')} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`h-5 w-5 ${textColor}`} />
            </div>
            <div className={`text-2xl font-bold ${textColor.replace('600', '900')} mb-1`}>
                {value || 'N/A'}
            </div>
            <div className={`text-xs ${textColor} uppercase tracking-wide font-medium`}>
                {label}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Main Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={MapPin}
                    value={stats.totalPoints}
                    label="Data Points"
                    color="border-blue-200"
                    bgColor="bg-white"
                    textColor="text-blue-600"
                />
                <StatCard
                    icon={Route}
                    value={`${displayDistance} km`}
                    label={distanceSource}
                    color="border-green-200"
                    bgColor="bg-white"
                    textColor="text-green-600"
                />
                <StatCard
                    icon={Key}
                    value={stats.totalStops}
                    label="Total Stops"
                    color="border-yellow-200"
                    bgColor="bg-white"
                    textColor="text-yellow-600"
                />
                <StatCard
                    icon={Clock}
                    value={stats.activeTime || 'N/A'}
                    label="Active Time"
                    color="border-purple-200"
                    bgColor="bg-white"
                    textColor="text-purple-600"
                />
            </div>

            {/* Trip Summary (if available) */}
            {routeData.trip_summary && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Gauge className="h-5 w-5 mr-2 text-indigo-600" />
                        Trip Summary
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <div className="font-semibold text-blue-900 text-lg">
                                {routeData.trip_summary.TotalMileage || 'N/A'}
                            </div>
                            <div className="text-blue-600 text-xs uppercase tracking-wide">Distance (km)</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                            <div className="font-semibold text-green-900 text-lg">
                                {routeData.trip_summary.TotalActiveTime || 'N/A'}
                            </div>
                            <div className="text-green-600 text-xs uppercase tracking-wide">Active Time</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 text-center">
                            <div className="font-semibold text-yellow-900 text-lg">
                                {routeData.trip_summary.TotalIdleTime || 'N/A'}
                            </div>
                            <div className="text-yellow-600 text-xs uppercase tracking-wide">Idle Time</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <div className="font-semibold text-purple-900 text-lg">
                                {routeData.trip_summary.TotalFuelConsumption || 'N/A'}
                            </div>
                            <div className="text-purple-600 text-xs uppercase tracking-wide">Fuel Used</div>
                        </div>
                    </div>

                    {/* Additional metrics if available */}
                    {(stats.maxSpeed || stats.avgSpeed) && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {stats.maxSpeed && (
                                <div className="bg-red-50 rounded-lg p-3 text-center">
                                    <div className="font-semibold text-red-900 text-lg">{stats.maxSpeed}</div>
                                    <div className="text-red-600 text-xs uppercase tracking-wide">Max Speed</div>
                                </div>
                            )}
                            {stats.avgSpeed && (
                                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                                    <div className="font-semibold text-indigo-900 text-lg">{stats.avgSpeed}</div>
                                    <div className="text-indigo-600 text-xs uppercase tracking-wide">Avg Speed</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Route Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-4">Route Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500 block mb-1">Car ID:</span>
                        <p className="font-medium text-gray-900">{routeData.car_id || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500 block mb-1">ETIT Car ID:</span>
                        <p className="font-medium text-gray-900">{routeData.etit_car_id || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500 block mb-1">From:</span>
                        <p className="font-medium text-gray-900">{routeData.from || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500 block mb-1">To:</span>
                        <p className="font-medium text-gray-900">{routeData.to || 'N/A'}</p>
                    </div>
                    {routeData.coordinates && (
                        <>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <span className="text-gray-500 block mb-1">Route Start:</span>
                                <p className="font-medium text-gray-900 text-xs font-mono">
                                    {routeData.coordinates[0]?.DateTime || routeData.coordinates[0]?.dateTime || 'N/A'}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <span className="text-gray-500 block mb-1">Route End:</span>
                                <p className="font-medium text-gray-900 text-xs font-mono">
                                    {routeData.coordinates[routeData.coordinates.length - 1]?.DateTime || 
                                     routeData.coordinates[routeData.coordinates.length - 1]?.dateTime || 'N/A'}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Data Quality Indicators */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-4">Data Quality</h5>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div className={`rounded-lg p-3 ${stats.totalPoints > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className={`font-semibold ${stats.totalPoints > 0 ? 'text-green-900' : 'text-red-900'}`}>
                            {stats.totalPoints > 0 ? 'Good' : 'No Data'}
                        </div>
                        <div className={`text-xs ${stats.totalPoints > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            GPS Points
                        </div>
                    </div>
                    <div className={`rounded-lg p-3 ${routeData.trip_summary ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <div className={`font-semibold ${routeData.trip_summary ? 'text-green-900' : 'text-yellow-900'}`}>
                            {routeData.trip_summary ? 'Available' : 'Limited'}
                        </div>
                        <div className={`text-xs ${routeData.trip_summary ? 'text-green-600' : 'text-yellow-600'}`}>
                            Trip Summary
                        </div>
                    </div>
                    <div className={`rounded-lg p-3 ${stats.totalStops >= 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <div className={`font-semibold ${stats.totalStops >= 0 ? 'text-green-900' : 'text-gray-900'}`}>
                            {stats.totalStops >= 0 ? stats.totalStops : 'Unknown'}
                        </div>
                        <div className={`text-xs ${stats.totalStops >= 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            Stops Detected
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteStatistics;