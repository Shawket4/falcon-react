import React from 'react';
import { Droplet, DollarSign, Gauge, Calendar, TrendingUp, Clock } from 'lucide-react';
import { format, formatNumber, formatCurrency } from './DateUtils';
import StatCard from './StatCard';

const GlobalStatistics = ({ stats }) => {
  const {
    totalEvents,
    totalLiters,
    totalCost,
    avgFuelRate,
    avgCostPerDay,
    avgLitersPerDay,
    totalDays,
    earliestDate,
    latestDate
  } = stats;
  
  // Format date range text for different screen sizes
  const dateRangeFull = earliestDate && latestDate 
    ? `${format(earliestDate, 'MMM dd, yyyy')} — ${format(latestDate, 'MMM dd, yyyy')}`
    : 'No date range';
    
  // Shorter date format for small screens
  const dateRangeCompact = earliestDate && latestDate 
    ? `${format(earliestDate, 'MMM d')} — ${format(latestDate, 'MMM d')}`
    : 'No range';
    
  // Format period duration (based on actual data range, not filter range)
  const periodText = totalDays === 1 
    ? "1-day period" 
    : `${totalDays}-day period`;

  return (
    <div className="mb-6 bg-white shadow-sm rounded-lg p-4 sm:p-5 border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Fuel Statistics</h2>
        <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
          <Calendar size={14} className="flex-shrink-0" />
          <span className="hidden sm:inline">{dateRangeFull}</span>
          <span className="sm:hidden">{dateRangeCompact}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <StatCard 
          icon={Droplet} 
          label="Total Fuel"
          value={`${formatNumber(totalLiters, 1)}L`}
          color="blue"
          subvalue={`${totalEvents} fuel events`}
        />
        
        <StatCard 
          icon={Gauge} 
          label="Avg Efficiency"
          value={`${formatNumber(avgFuelRate, 1)} km/L`}
          color="green" 
        />
        
        <StatCard 
          icon={DollarSign} 
          label="Total Cost"
          value={formatCurrency(totalCost)}
          color="indigo"
        />
        
        <StatCard 
          icon={TrendingUp} 
          label="Cost Per Day"
          value={formatCurrency(avgCostPerDay)}
          color="purple"
          subvalue={periodText}
        />
        
        <StatCard 
          icon={Droplet} 
          label="Fuel Per Day"
          value={`${formatNumber(avgLitersPerDay, 2)}L`}
          color="cyan"
          subvalue={periodText}
        />
        
        <StatCard 
          icon={Clock} 
          label="Average"
          value={`${formatNumber(totalLiters / totalEvents, 1)}L`}
          color="amber"
          subvalue="Per fuel up"
        />
      </div>
    </div>
  );
};

export default GlobalStatistics;