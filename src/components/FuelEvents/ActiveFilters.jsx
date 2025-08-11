import React, { memo, useCallback } from 'react';
import { X, Calendar, RefreshCw } from 'lucide-react';
import { format } from './DateUtils';

const ActiveFilters = memo(({ dateRange, resetDateFilter, applyCurrentMonthFilter }) => {
  const formatDate = useCallback((date) => {
    if (!date) return 'Not set';
    return format(date, 'MMM d, yyyy');
  }, []);

  const handleReset = useCallback(() => {
    resetDateFilter();
  }, [resetDateFilter]);

  const handleCurrentMonth = useCallback(() => {
    applyCurrentMonthFilter();
  }, [applyCurrentMonthFilter]);

  // Check if filters are active
  const hasActiveFilters = dateRange.startDate || dateRange.endDate;

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-4 bg-blue-50 rounded-lg border border-blue-100 p-3 hover:bg-blue-100 transition-all duration-300 hover:shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center bg-blue-100 rounded-md px-2 py-1">
            <Calendar size={16} className="text-blue-500 mr-2 flex-shrink-0" />
            <span className="text-sm text-blue-700 font-medium">Date Filter</span>
          </div>
          <div className="text-sm text-gray-700 bg-white rounded-md px-2 py-1 border border-blue-200">
            <span className="hidden sm:inline">
              {formatDate(dateRange.startDate)} — {formatDate(dateRange.endDate)}
            </span>
            <span className="sm:hidden">
              {format(dateRange.startDate, 'MMM d')} — {format(dateRange.endDate, 'MMM d')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCurrentMonth}
            className="flex items-center text-blue-600 hover:text-blue-800 text-xs bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-sm"
          >
            <RefreshCw size={12} className="mr-1" />
            Current Month
          </button>
          <button
            onClick={handleReset}
            className="flex items-center text-red-600 hover:text-red-800 text-xs bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-sm"
          >
            <X size={12} className="mr-1" />
            Clear Filter
          </button>
        </div>
      </div>
    </div>
  );
});

ActiveFilters.displayName = 'ActiveFilters';
export default memo(ActiveFilters);