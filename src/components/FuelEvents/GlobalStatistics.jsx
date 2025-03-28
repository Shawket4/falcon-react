// File: components/GlobalStatistics.jsx
import React from 'react';
import { Droplet, DollarSign, Gauge, Calendar, TrendingUp, Clock } from 'lucide-react';
import { format, formatNumber, formatCurrency } from './DateUtils';

const StatCard = ({ icon, label, value, color, subvalue }) => {
  const Icon = icon;
  
  return (
    <div className={`bg-${color}-50 p-4 rounded-lg border border-${color}-100 transition-all duration-200 hover:shadow-md flex flex-col h-full`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600`}>
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
      </div>
      <div className="mt-1">
        <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
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
    <div className="mb-6 bg-white shadow-sm rounded-lg p-5 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Fuel Statistics</h2>
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar size={14} />
          <span>{dateRangeText}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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