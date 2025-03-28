// File: components/FuelEventCard.jsx
import React, { useState } from 'react';
import { Calendar, Droplet, Gauge, Car, ChevronDown, ChevronUp } from 'lucide-react';
import { parseISO, format, formatOdometer } from './DateUtils';

const FuelEventCard = ({ carPlate, carData, navigate, isMobile }) => {
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-all duration-200">
        {/* Card Header */}
        <div 
          className="bg-white text-gray-800 p-4 border-b cursor-pointer"
          onClick={toggleExpand}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-lg">{carPlate}</h3>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                {isExpanded ? 
                  <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                }
              </div>
            </div>
          </div>
          
          {/* Stats Summary - Always visible */}
          <div className="grid grid-cols-4 gap-3 mt-3">
            <div className="bg-gray-50 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-gray-500">Last</span>
              </div>
              <div className="font-medium">{format(carData.lastUpdated, 'MMM d')}</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplet className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="font-medium">{carData.totalLiters.toFixed(1)}L</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Gauge className="w-3 h-3 text-green-500" />
                <span className="text-xs text-gray-500">Efficiency</span>
              </div>
              <div className="font-medium">{carData.avgFuelRate.toFixed(1)} km/L</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-gray-500">Refuels</span>
              </div>
              <div className="font-medium">{carData.events.length}</div>
            </div>
          </div>
        </div>
        
        {/* Collapsible Content */}
        {isExpanded && (
          <>
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
          </>
        )}
      </div>
    );
  }
  
  // Desktop/Tablet View - Original card-style layout
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-all duration-200">
      {/* Card Header */}
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <span className="font-medium truncate">{carPlate}</span>
        <div className="flex space-x-2">
          <span className="flex items-center">
            <Droplet className="w-4 h-4 mr-1" />
            {carData.totalLiters.toFixed(1)}L
          </span>
          <span className="flex items-center">
            <Gauge className="w-4 h-4 mr-1" />
            {carData.avgFuelRate.toFixed(1)} km/L
          </span>
         
        </div>
      </div>
      
      {/* Simple column labels header */}
      <div className="flex justify-between items-center bg-gray-100 px-3 py-2 border-b text-xs font-medium text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          Date
        </div>
        <div className="flex items-center">
          <Gauge className="w-3 h-3 mr-1" />
          Odometer
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 max-h-64">
        {carData.events.map(event => (
          <EventListItem key={event.ID} event={event} />
        ))}
      </div>
    </div>
  );
};

export default FuelEventCard;