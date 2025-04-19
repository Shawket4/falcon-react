import React from 'react';
import { X, Calendar, RefreshCw } from 'lucide-react';
import { format } from './DateUtils';

const ActiveFilters = ({ dateRange, resetDateFilter, applyCurrentMonthFilter }) => {
  const formatDate = (date) => {
    if (!date) return 'Not set';
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="mb-4 bg-blue-50 rounded-lg border border-blue-100 p-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div className="flex items-center">
        <Calendar size={16} className="text-blue-500 mr-2" />
        <span className="text-sm text-blue-700 font-medium">Date Filter:</span>
        <div className="flex mx-2 text-sm">
          <span className="mx-2 text-gray-700">
            {formatDate(dateRange.startDate)} — {formatDate(dateRange.endDate)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <button
          onClick={applyCurrentMonthFilter}
          className="flex items-center text-blue-600 hover:text-blue-800 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
        >
          <RefreshCw size={12} className="mr-1" />
          Current Month
        </button>
        <button
          onClick={resetDateFilter}
          className="flex items-center text-red-600 hover:text-red-800 text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
        >
          <X size={12} className="mr-1" />
          Clear
        </button>
      </div>
    </div>
  );
};

export default ActiveFilters;