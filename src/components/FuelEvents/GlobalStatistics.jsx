import React, { memo, useMemo } from 'react';
import { Droplet, DollarSign, Gauge, Calendar, TrendingUp, Clock } from 'lucide-react';
import { format, formatNumber, formatCurrency } from './DateUtils';
import StatCard from './StatCard';

const GlobalStatistics = memo(({ stats }) => {
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
  
  // Memoized calculations for better performance
  const formattedData = useMemo(() => {
    const dateRangeFull = earliestDate && latestDate 
      ? `${format(earliestDate, 'MMM dd, yyyy')} — ${format(latestDate, 'MMM dd, yyyy')}`
      : 'No date range';
      
    const dateRangeCompact = earliestDate && latestDate 
      ? `${format(earliestDate, 'MMM d')} — ${format(latestDate, 'MMM d')}`
      : 'No range';
      
    const periodText = totalDays === 1 
      ? "1-day period" 
      : `${totalDays}-day period`;

    const avgPerFuelup = totalEvents > 0 ? totalLiters / totalEvents : 0;

    return {
      dateRangeFull,
      dateRangeCompact,
      periodText,
      avgPerFuelup
    };
  }, [earliestDate, latestDate, totalDays, totalLiters, totalEvents]);

  return (
    <div className="mb-6 bg-white shadow-sm rounded-lg p-4 sm:p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Fuel Statistics
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({totalEvents} events)
          </span>
        </h2>
        <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
          <Calendar size={14} className="flex-shrink-0" />
          <span className="hidden sm:inline">{formattedData.dateRangeFull}</span>
          <span className="sm:hidden">{formattedData.dateRangeCompact}</span>
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
          subvalue={formattedData.periodText}
        />
        
        <StatCard 
          icon={Droplet} 
          label="Fuel Per Day"
          value={`${formatNumber(avgLitersPerDay, 2)}L`}
          color="cyan"
          subvalue={formattedData.periodText}
        />
        
        <StatCard 
          icon={Clock} 
          label="Average"
          value={`${formatNumber(formattedData.avgPerFuelup, 1)}L`}
          color="amber"
          subvalue="Per fuel up"
        />
      </div>
    </div>
  );
});

GlobalStatistics.displayName = 'GlobalStatistics';
export default memo(GlobalStatistics);