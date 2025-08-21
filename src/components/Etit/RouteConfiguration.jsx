import { useEffect } from 'react';
import { Calendar, Save, Edit, Route, Loader2, AlertCircle } from 'lucide-react';

const RouteConfiguration = ({ 
    tripDetails, 
    hasStoredRoute, 
    isEditing, 
    setIsEditing, 
    selectedFromDate, 
    setSelectedFromDate,
    selectedToDate,
    setSelectedToDate,
    selectedFromTime,
    setSelectedFromTime,
    selectedToTime,
    setSelectedToTime,
    onFetchData,
    onStoreData,
    loading,
    storageLoading,
    storedRouteData
}) => {
    // Auto-populate dates from trip details
    useEffect(() => {
        if (tripDetails?.date && !selectedFromDate && !selectedToDate) {
            const tripDate = new Date(tripDetails.date);
            const dateStr = tripDate.toISOString().split('T')[0];
            setSelectedFromDate(dateStr);
            setSelectedToDate(dateStr);
        }
    }, [tripDetails?.date, selectedFromDate, selectedToDate, setSelectedFromDate, setSelectedToDate]);

    const handleFetchData = () => {
        if (!selectedFromDate || !selectedToDate || !tripDetails?.car_id) {
            return;
        }
        onFetchData();
    };

    const handleStoreData = () => {
        if (!selectedFromDate || !selectedToDate || !tripDetails?.id) {
            return;
        }
        onStoreData();
    };

    const isValidConfiguration = () => {
        return selectedFromDate && selectedToDate && selectedFromTime && selectedToTime;
    };

    const canFetch = () => {
        return isValidConfiguration() && tripDetails?.car_id && !loading;
    };

    const canStore = () => {
        return isValidConfiguration() && tripDetails?.id && !storageLoading;
    };

    // If we have a stored route and we're not editing, show the stored route summary
    if (hasStoredRoute && !isEditing) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                            <Save className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h5 className="font-medium text-green-900">Stored Route Found</h5>
                            <p className="text-sm text-green-700">This trip has saved route data</p>
                            {storedRouteData && (
                                <div className="text-xs text-green-600 mt-1 space-y-1">
                                    {storedRouteData.from && (
                                        <div><strong>From:</strong> {storedRouteData.from}</div>
                                    )}
                                    {storedRouteData.to && (
                                        <div><strong>To:</strong> {storedRouteData.to}</div>
                                    )}
                                    {storedRouteData.coordinates && (
                                        <div><strong>Data Points:</strong> {storedRouteData.coordinates.length}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Route
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                    <h5 className="font-medium text-gray-900">
                        {isEditing ? 'Edit Route Configuration' : 'Configure Route Data'}
                    </h5>
                    <p className="text-sm text-gray-600">
                        {isEditing ? 'Modify the date/time range for route data' : 'Set date and time range to fetch vehicle tracking data'}
                    </p>
                </div>
            </div>

            {/* Date and Time Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">From Date & Time</label>
                    <div className="flex space-x-2">
                        <input
                            type="date"
                            value={selectedFromDate}
                            onChange={(e) => setSelectedFromDate(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            max={new Date().toISOString().split('T')[0]} // Don't allow future dates
                        />
                        <input
                            type="time"
                            value={selectedFromTime}
                            onChange={(e) => setSelectedFromTime(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">To Date & Time</label>
                    <div className="flex space-x-2">
                        <input
                            type="date"
                            value={selectedToDate}
                            onChange={(e) => setSelectedToDate(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            min={selectedFromDate || undefined}
                            max={new Date().toISOString().split('T')[0]} // Don't allow future dates
                        />
                        <input
                            type="time"
                            value={selectedToTime}
                            onChange={(e) => setSelectedToTime(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Validation Warnings */}
            {!isValidConfiguration() && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center text-yellow-800">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Please fill in all date and time fields</span>
                    </div>
                </div>
            )}

            {(!tripDetails?.car_id || !tripDetails?.id) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-800">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                            {!tripDetails?.car_id && 'Car ID is required for fetching data. '}
                            {!tripDetails?.id && 'Trip ID is required for storing data.'}
                        </span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
                <button
                    onClick={handleFetchData}
                    disabled={!canFetch()}
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
                    title={!canFetch() ? 'Please fill in all fields and ensure Car ID is available' : 'Fetch route data from ETIT system'}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Fetching...
                        </>
                    ) : (
                        <>
                            <Route className="h-4 w-4 mr-2" />
                            Fetch Data
                        </>
                    )}
                </button>

                <button
                    onClick={handleStoreData}
                    disabled={!canStore()}
                    className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
                    title={!canStore() ? 'Please fill in all fields and ensure Trip ID is available' : 'Store route data for future use'}
                >
                    {storageLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Storing...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Store Data
                        </>
                    )}
                </button>

                {isEditing && (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Trip Information Display */}
            {tripDetails && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h6 className="text-sm font-medium text-gray-700 mb-3">Trip Information</h6>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-gray-50 rounded-lg p-2">
                            <span className="text-gray-500 block">Trip ID</span>
                            <span className="font-medium text-gray-900">{tripDetails.id || 'N/A'}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                            <span className="text-gray-500 block">Car ID</span>
                            <span className="font-medium text-gray-900">{tripDetails.car_id || 'N/A'}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                            <span className="text-gray-500 block">Trip Date</span>
                            <span className="font-medium text-gray-900">{tripDetails.date || 'N/A'}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                            <span className="text-gray-500 block">Status</span>
                            <span className="font-medium text-gray-900">{tripDetails.status || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteConfiguration;