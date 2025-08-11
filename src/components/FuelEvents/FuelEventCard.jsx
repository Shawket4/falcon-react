// File: components/FuelEventCard.jsx
import React, { useState, memo, useMemo, useCallback } from 'react';
import { Calendar, Droplet, Gauge, Car, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { parseISO, format, formatOdometer } from './DateUtils';

// Memoized EventListItem for better performance
const EventListItem = memo(({ event, onClick }) => {
  const efficiency = useMemo(() => {
    const rate = parseFloat(event.fuel_rate);
    let colorClass = 'text-gray-400';
    
    if (rate >= 1.0 && rate <= 3.2) {
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
  }, [event.fuel_rate]);
  
  const isExcluded = useMemo(() => {
    const rate = parseFloat(event.fuel_rate);
    return rate < 1.0 || rate > 3.2;
  }, [event.fuel_rate]);

  return (
    <div 
      className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-blue-200"
      onClick={() => onClick(event.ID)}
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
          {isExcluded && 
            <span className="ml-1 text-xs italic">(excluded)</span>
          }
        </span>
      </div>
    </div>
  );
});

EventListItem.displayName = 'EventListItem';

const FuelEventCard = ({ carPlate, carData, navigate, isMobile }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoized calculations for better performance and more info
  const stats = useMemo(() => {
    const recentEvents = carData.events.slice(0, 3);
    const recentTrend = carData.events.length > 1 ? (
      carData.events[0].fuel_rate > carData.events[1].fuel_rate ? 'up' : 'down'
    ) : 'neutral';
    
    return {
      lastUpdated: carData.lastUpdated,
      totalLiters: carData.totalLiters.toFixed(1),
      avgFuelRate: carData.avgFuelRate.toFixed(1),
      eventCount: carData.events.length,
      recentTrend,
      recentEvents
    };
  }, [carData]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleEventClick = useCallback((eventId) => {
    navigate(`/details/${eventId}`);
  }, [navigate]);

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-all duration-300">
        {/* Card Header */}
        <div 
          className="bg-white text-gray-800 p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={toggleExpand}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-lg">{carPlate}</h3>
              {/* Trend indicator */}
              {stats.recentTrend !== 'neutral' && (
                <TrendingUp className={`w-4 h-4 transition-transform duration-200 ${
                  stats.recentTrend === 'up' ? 'text-green-500' : 'text-red-500 rotate-180'
                }`} />
              )}
            </div>
            <div className="flex items-center">
              <div className="flex items-center transition-transform duration-200">
                {isExpanded ? 
                  <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                }
              </div>
            </div>
          </div>
          
          {/* Enhanced Stats Summary - Always visible with more density */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="bg-gray-50 p-2 rounded-lg text-center hover:bg-gray-100 transition-colors duration-150">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-gray-500">Last</span>
              </div>
              <div className="font-medium text-sm">{format(stats.lastUpdated, 'MMM d')}</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg text-center hover:bg-gray-100 transition-colors duration-150">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplet className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="font-medium text-sm">{stats.totalLiters}L</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg text-center hover:bg-gray-100 transition-colors duration-150">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Gauge className="w-3 h-3 text-green-500" />
                <span className="text-xs text-gray-500">Avg</span>
              </div>
              <div className="font-medium text-sm">{stats.avgFuelRate} km/L</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg text-center hover:bg-gray-100 transition-colors duration-150">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-gray-500">Events</span>
              </div>
              <div className="font-medium text-sm">{stats.eventCount}</div>
            </div>
          </div>
        </div>
        
        {/* Collapsible Content with smooth animation */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
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
          <div className="overflow-y-auto flex-1 max-h-64 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {carData.events.map(event => (
              <EventListItem key={event.ID} event={event} onClick={handleEventClick} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop/Tablet View - Enhanced but keeping original style
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      {/* Card Header - Enhanced with more info */}
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{carPlate}</span>
          {/* Trend indicator */}
          {stats.recentTrend !== 'neutral' && (
            <TrendingUp className={`w-4 h-4 transition-transform duration-200 ${
              stats.recentTrend === 'up' ? 'text-green-400' : 'text-red-400 rotate-180'
            }`} />
          )}
        </div>
        <div className="flex space-x-3 items-center">
          <span className="flex items-center text-sm">
            <Droplet className="w-4 h-4 mr-1" />
            {stats.totalLiters}L
          </span>
          <span className="flex items-center text-sm">
            <Gauge className="w-4 h-4 mr-1" />
            {stats.avgFuelRate} km/L
          </span>
          <span className="text-xs text-gray-300">
            ({stats.eventCount} events)
          </span>
        </div>
      </div>
      
      {/* Column labels header */}
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
      
      {/* Events list with enhanced scrollbar */}
      <div className="overflow-y-auto flex-1 max-h-64 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {carData.events.length > 0 ? (
          carData.events.map(event => (
            <EventListItem key={event.ID} event={event} onClick={handleEventClick} />
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Droplet className="w-6 h-6 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No refueling events recorded</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(FuelEventCard);