import { Play, Pause, RotateCcw, Square, Clock } from 'lucide-react';

const TimelineControls = ({ 
    routeData, 
    currentIndex, 
    setCurrentIndex, 
    isPlaying, 
    playbackSpeed, 
    setPlaybackSpeed,
    onPlay,
    onPause,
    onReset 
}) => {
    if (!routeData?.coordinates || routeData.coordinates.length === 0) {
        return null;
    }

    const currentCoordinate = routeData.coordinates[currentIndex];
    const totalCoordinates = routeData.coordinates.length;
    const progressPercentage = ((currentIndex + 1) / totalCoordinates) * 100;

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        
        try {
            let date;
            
            // If it's already a Date object
            if (dateTime instanceof Date) {
                date = dateTime;
            }
            // If it's a string that might need parsing
            else if (typeof dateTime === 'string') {
                // Handle DD/MM/YYYY HH:mm:ss format specifically
                const ddmmyyyyMatch = dateTime.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
                if (ddmmyyyyMatch) {
                    const day = parseInt(ddmmyyyyMatch[1], 10);
                    const month = parseInt(ddmmyyyyMatch[2], 10);
                    const year = parseInt(ddmmyyyyMatch[3], 10);
                    const hour = parseInt(ddmmyyyyMatch[4], 10);
                    const minute = parseInt(ddmmyyyyMatch[5], 10);
                    const second = parseInt(ddmmyyyyMatch[6], 10);
                    
                    // Create date using DD/MM/YYYY format (month is 0-indexed in JavaScript)
                    date = new Date(year, month - 1, day, hour, minute, second);
                } else {
                    // Try parsing as-is for other formats
                    date = new Date(dateTime);
                }
            }
            // If it's a number (timestamp)
            else if (typeof dateTime === 'number') {
                date = new Date(dateTime);
            }
            else {
                return String(dateTime);
            }
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.warn('Failed to parse date:', dateTime);
                return String(dateTime); // Return original if can't parse
            }
            
            // Format the date in DD/MM/YYYY format
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
            console.warn('Error formatting date:', dateTime, error);
            return String(dateTime);
        }
    };

    const getCoordinateString = (coord) => {
        const lat = parseFloat(coord.Latitude || coord.lat);
        const lng = parseFloat(coord.Longitude || coord.lng || coord.lon);
        if (isNaN(lat) || isNaN(lng)) return 'Invalid coordinates';
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    };

    const handleSliderChange = (e) => {
        const newIndex = parseInt(e.target.value);
        setCurrentIndex(newIndex);
    };

    const jumpToStart = () => {
        setCurrentIndex(0);
    };

    const jumpToEnd = () => {
        setCurrentIndex(totalCoordinates - 1);
    };

    const stepBackward = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const stepForward = () => {
        if (currentIndex < totalCoordinates - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const speedOptions = [
        { value: 3000, label: '0.33x' },
        { value: 2000, label: '0.5x' },
        { value: 1000, label: '1x' },
        { value: 500, label: '2x' },
        { value: 250, label: '4x' },
        { value: 100, label: '10x' },
        { value: 50, label: '20x' }
    ];

    const isAtStart = currentIndex === 0;
    const isAtEnd = currentIndex >= totalCoordinates - 1;
    const canPlay = !isAtEnd && !isPlaying;
    const canPause = isPlaying;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <h5 className="font-medium text-gray-900">Vehicle Timeline</h5>
                    <p className="text-sm text-gray-600">Control playback and track vehicle movement</p>
                </div>
            </div>
            
            {/* Current Position Info */}
            {currentCoordinate && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-yellow-700 font-medium block mb-1">Current Time:</span>
                            <p className="text-yellow-900">{formatDateTime(currentCoordinate.DateTime || currentCoordinate.dateTime)}</p>
                        </div>
                        <div>
                            <span className="text-yellow-700 font-medium block mb-1">Position:</span>
                            <p className="text-yellow-900">{currentIndex + 1} of {totalCoordinates}</p>
                            <div className="w-full bg-yellow-200 rounded-full h-2 mt-1">
                                <div 
                                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <span className="text-yellow-700 font-medium block mb-1">Coordinates:</span>
                            <p className="text-yellow-900 font-mono text-xs">
                                {getCoordinateString(currentCoordinate)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline Slider */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max={totalCoordinates - 1}
                        value={currentIndex}
                        onChange={handleSliderChange}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercentage}%, #e5e7eb ${progressPercentage}%, #e5e7eb 100%)`
                        }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span className="bg-white px-2 py-1 rounded border">
                        {formatDateTime(routeData.coordinates[0]?.DateTime || routeData.coordinates[0]?.dateTime)}
                    </span>
                    <span className="bg-white px-2 py-1 rounded border">
                        {formatDateTime(routeData.coordinates[totalCoordinates - 1]?.DateTime || routeData.coordinates[totalCoordinates - 1]?.dateTime)}
                    </span>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Main Controls */}
                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={jumpToStart}
                        disabled={isAtStart}
                        className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Jump to start"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>

                    <button
                        onClick={stepBackward}
                        disabled={isAtStart}
                        className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Step backward"
                    >
                        ‹
                    </button>

                    <button
                        onClick={canPlay ? onPlay : onPause}
                        disabled={isAtEnd && !isPlaying}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors min-w-[100px] justify-center"
                        title={canPlay ? 'Play timeline' : 'Pause timeline'}
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
                        onClick={stepForward}
                        disabled={isAtEnd}
                        className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Step forward"
                    >
                        ›
                    </button>

                    <button
                        onClick={jumpToEnd}
                        disabled={isAtEnd}
                        className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:bg-red-50 disabled:text-red-400 disabled:cursor-not-allowed transition-colors"
                        title="Jump to end"
                    >
                        <Square className="h-4 w-4" />
                    </button>
                </div>

                {/* Speed Control */}
                <div className="flex items-center justify-center space-x-3">
                    <label className="text-sm font-medium text-gray-700">Speed:</label>
                    <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    >
                        {speedOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-4 border-t border-gray-200">
                <button
                    onClick={onReset}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    title="Reset timeline to beginning and stop playback"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Timeline
                </button>
            </div>

            {/* Timeline Statistics */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div className="bg-blue-50 rounded-lg p-2">
                        <div className="font-semibold text-blue-900">{totalCoordinates}</div>
                        <div className="text-blue-600">Total Points</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                        <div className="font-semibold text-green-900">{currentIndex + 1}</div>
                        <div className="text-green-600">Current Point</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2">
                        <div className="font-semibold text-purple-900">{Math.round(progressPercentage)}%</div>
                        <div className="text-purple-600">Progress</div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};

export default TimelineControls;