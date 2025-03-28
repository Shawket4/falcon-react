// File: components/FuelEventCard.jsx
import React, { useState } from 'react';
import { Calendar, Droplet, Gauge, Car, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { parseISO, format, formatOdometer } from '../utils/dateUtils';

const FuelEventCard = ({ carPlate, carData, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-200 hover:shadow-md transition-all duration-200">
      {/* Card Header - Clickable on mobile to expand */}
      <div 
        className="bg-white text-gray-800 p-4 border-b cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-lg text-gray-800">{carPlate}</h3>
              
              {/* Mobile-only expand/collapse button */}
              <button 
                className="md:hidden ml-auto text-gray-500 p-1 hover:bg-gray-100 rounded-full"
                onClick={toggleExpand}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-x-3 gap-y-2 mt-3">
              <div className="flex items-center gap-1">
                <Droplet className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{carData.totalLiters.toFixed(1)}L total</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4 text-green-500" />
                <span className="text-sm">{carData.avgFuelRate.toFixed(1)} km/L avg</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm">{carData.events.length} refuels</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block bg-gray-100 rounded-lg p-2 text-center ml-4">
            <div className="text-xs text-gray-500">Last Update</div>
            <div className="font-medium text-gray-700">
              {format(carData.lastUpdated, 'MMM d')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content section - Always visible on desktop, toggleable on mobile */}
      <div className={`${isExpanded ? 'block' : 'hidden md:block'}`}>
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
        <div className="overflow-y-auto max-h-60">
          {carData.events.length > 0 ? (
            carData.events.map(event => (
              <EventListItem key={event.ID} event={event} />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No fuel events found for this vehicle
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile-only indicator for expandable content */}
      <div className="md:hidden text-center text-xs text-gray-400 py-1 border-t">
        {isExpanded ? "Tap to collapse" : "Tap to view fuel events"}
      </div>
    </div>
  );
};

export default FuelEventCard;