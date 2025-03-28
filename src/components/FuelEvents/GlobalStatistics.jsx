// File: components/GlobalStatistics.jsx
import React from 'react';
import { Droplet, DollarSign, Gauge, Calendar, TrendingUp, Clock } from 'lucide-react';
import { format, formatNumber, formatCurrency } from '../utils/dateUtils';

const StatCard = ({ icon, label, value, color, subvalue }) => {
  const Icon = icon;
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow flex flex-col h-full">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-full bg-gray-100">
          <Icon size={18} className={`text-${color}-500`} />
        </div>
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
      </div>
      <div className="mt-1">
        <div className={`text-xl sm:text-2xl font-bold text-gray-800`}>{value}</div>
        {subvalue && (
          <div className="text-xs text-gray-500 mt-1">{subvalue}</div>
        )}
      </div>
    </div>
  );
};

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
  
  const dateRangeText = earliestDate && latestDate 
    ? `${format(earliestDate, 'MMM dd, yyyy')} — ${format(latestDate, 'MMM dd, yyyy')}`
    : 'No date range';

  return (
    <div className="mb-6 bg-white shadow-sm rounded-lg p-4 sm:p-5 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Fuel Statistics</h2>
        <div className="text-sm text-gray-500 flex items-center gap-1 bg-gray-50 rounded-md px-2 py-1">
          <Calendar size={14} />
          <span className="text-xs sm:text-sm truncate">{dateRangeText}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
          subvalue={`Over ${totalDays} days`}
        />
        
        <StatCard 
          icon={Droplet} 
          label="Fuel Per Day"
          value={`${formatNumber(avgLitersPerDay, 2)}L`}
          color="cyan"
          subvalue={`Over ${totalDays} days`}
        />
        
        <StatCard 
          icon={Clock} 
          label="Average"
          value={`${formatNumber(totalLiters / totalEvents, 1)}L`}
          color="amber"
          subvalue="Per refueling"
        />
      </div>
    </div>
  );
};

export default GlobalStatistics;