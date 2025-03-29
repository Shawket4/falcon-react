import React from 'react';
import { Calendar, X, RefreshCw } from 'lucide-react';
import { format } from './DateUtils';

const ActiveFilters = ({ dateRange, resetDateFilter, applyCurrentMonthFilter }) => {
  return (
    <div className="mb-6 flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100 animate-fadeIn">
      <Calendar size={18} className="text-blue-500" />
      <span className="text-blue-700 font-medium">
        Date Range:
      </span>
      <span className="text-blue-600">
        {dateRange.startDate ? format(dateRange.startDate, 'MMM dd, yyyy') : 'Any start date'}
        {' — '}
        {dateRange.endDate ? format(dateRange.endDate, 'MMM dd, yyyy') : 'Any end date'}
      </span>
      
      <div className="ml-auto flex gap-2">
        <button 
          onClick={applyCurrentMonthFilter}
          className="text-blue-600 hover:bg-blue-100 p-1 rounded-md flex items-center gap-1 transition-colors"
          title="Set to current month"
        >
          <RefreshCw size={16} />
          <span className="text-sm">Current Month</span>
        </button>
        
        <button 
          onClick={resetDateFilter}
          className="text-blue-600 hover:bg-blue-100 p-1 rounded-md flex items-center gap-1 transition-colors"
          title="Clear date filter"
        >
          <X size={16} />
          <span className="text-sm">Clear</span>
        </button>
      </div>
    </div>
  );
};

export default ActiveFilters;