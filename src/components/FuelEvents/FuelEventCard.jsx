// File: components/FuelEventCard.jsx
import React from 'react';
import { Calendar, Droplet, Gauge, Car, TrendingUp } from 'lucide-react';
import { parseISO, format, formatOdometer } from './DateUtils';

const FuelEventCard = ({ carPlate, carData, navigate }) => {
  // Fixed card dimensions
  const CARD_HEADER_HEIGHT = 120;
  
  // Format efficiency value with color coding
  const formatEfficiency = (value) => {
    const rate = parseFloat(value);
    
    let colorClass = 'text-gray-400';
    if (rate >= 1.0 && rate <= 2.7) {
      if (rate < 1.8) {
        colorClass = 'text-red-500';
      } else if (rate < 1.9) {
        colorClass = 'text-orange-500';
      } else {
        colorClass = 'text-green-500';
      }
    }
    
    return {
      value: rate.toFixed(1),
      colorClass
    };
  };
  
  // Event list item component
  const EventListItem = ({ event }) => {
    const efficiency = formatEfficiency(event.fuel_rate);
    
    return (
      <div 
        className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
        onClick={() => navigate(`/details/${event.ID}`)}
      >
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            {format(parseISO(event.date), 'MMM dd, yyyy')}
          </div>
          <div className="text-sm font-medium">
            {formatOdometer(event.odometer_after)}
          </div>
        </div>
        <div className="flex justify-between items-center mt-1 text-sm">
          <span className="flex items-center gap-1">
            <Droplet className="w-3 h-3 text-blue-500" />
            {parseFloat(event.liters).toFixed(2)}L
          </span>
          <span className={`flex items-center ${efficiency.colorClass}`}>
            <Gauge className="w-4 h-4 mr-1 flex-shrink-0" />
            {efficiency.value} km/L
            {(parseFloat(event.fuel_rate) < 1.0 || parseFloat(event.fuel_rate) > 2.7) && 
              <span className="ml-1 text-xs italic">(excluded)</span>
            }
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-all duration-200">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-4" style={{ height: `${CARD_HEADER_HEIGHT}px` }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-5 h-5" />
              <h3 className="font-semibold text-lg">{carPlate}</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
              <div className="flex items-center gap-1">
                <Droplet className="w-4 h-4 opacity-70" />
                <span className="text-sm">{carData.totalLiters.toFixed(1)}L total</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4 opacity-70" />
                <span className="text-sm">{carData.avgFuelRate.toFixed(1)} km/L avg</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 opacity-70" />
                <span className="text-sm">{carData.events.length} refuels</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-lg p-2 text-center">
            <div className="text-xs opacity-80">Last Update</div>
            <div className="font-medium">
              {format(carData.lastUpdated, 'MMM d')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Event List Header */}
      <div className="flex justify-between items-center bg-gray-50 px-3 py-2 border-b text-xs font-medium text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Date
        </div>
        <div className="flex items-center gap-1">
          <Gauge className="w-3 h-3" />
          Odometer
        </div>
      </div>
      
      {/* Event List */}
      <div className="overflow-y-auto flex-1 max-h-64">
        {carData.events.map(event => (
          <EventListItem key={event.ID} event={event} />
        ))}
      </div>
      
      {/* Card Footer */}
      <div className="bg-gray-50 p-3 text-center border-t">
        <button 
          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          onClick={() => navigate(`/vehicle/${encodeURIComponent(carPlate)}`)}
        >
          View Complete History
        </button>
      </div>
    </div>
  );
};

export default FuelEventCard;