import React, { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, startOfToday, endOfToday, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Calendar, X, Check, Zap, Filter, CreditCard } from 'lucide-react';

// --- Helper for Quick Filters (with updated "This Month" logic) ---
const quickFilters = [
  {
    label: 'Today',
    getRange: () => ({ from: startOfToday(), to: endOfToday() }),
  },
  {
    label: 'Last 7 Days',
    getRange: () => ({ from: subDays(startOfToday(), 6), to: endOfToday() }),
  },
  {
    label: 'This Month',
    // FIX: Selects from the start of the month to TODAY
    getRange: () => ({ from: startOfMonth(new Date()), to: endOfToday() }),
  },
  {
    label: 'Last Month',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    },
  },
];

const DateFilterModal = ({ 
  dateRange, 
  applyDateFilter, 
  resetDateFilter,
  setShowFilters,
  methodFilter = 'all', // New prop for method filter
  onMethodFilterChange // New prop for handling method filter changes
}) => {
  const [selectedRange, setSelectedRange] = useState({
    from: dateRange.startDate,
    to: dateRange.endDate
  });
  
  // State for method filter (PetroApp checkbox)
  const [isPetroAppOnly, setIsPetroAppOnly] = useState(methodFilter === 'PetroApp');

  const isChanged = useMemo(() => {
    const initialFrom = dateRange.startDate?.getTime();
    const initialTo = dateRange.endDate?.getTime();
    const selectedFrom = selectedRange.from?.getTime();
    const selectedTo = selectedRange.to?.getTime();
    
    const dateChanged = (initialFrom || null) !== (selectedFrom || null) || 
                       (initialTo || null) !== (selectedTo || null);
    const methodChanged = (methodFilter === 'PetroApp') !== isPetroAppOnly;
    
    return dateChanged || methodChanged;
  }, [selectedRange, dateRange, isPetroAppOnly, methodFilter]);
  
  useEffect(() => {
    setSelectedRange({
      from: dateRange.startDate,
      to: dateRange.endDate
    });
    setIsPetroAppOnly(methodFilter === 'PetroApp');
  }, [dateRange, methodFilter]);

  const handleApplyFilter = () => {
    if (!isChanged) return;
    
    // Handle date range
    let adjustedEndDate = selectedRange.to ? new Date(selectedRange.to) : undefined;
    if (adjustedEndDate) {
      adjustedEndDate.setHours(23, 59, 59, 999);
    }
    
    const newRange = {
      startDate: selectedRange.from,
      endDate: adjustedEndDate
    };
    
    applyDateFilter(newRange);
    
    // Handle method filter
    if (onMethodFilterChange) {
      onMethodFilterChange(isPetroAppOnly ? 'PetroApp' : 'all');
    }
    
    setShowFilters(false);
  };
  
  const handleClearFilter = () => {
    resetDateFilter();
    if (onMethodFilterChange) {
      onMethodFilterChange('all');
    }
    setShowFilters(false);
  };
  
  const handleQuickFilterClick = (getRange) => {
    setSelectedRange(getRange());
  };

  const formatDate = (date) => {
    return date ? format(date, 'MMM d, yyyy') : <span className="text-gray-400">Not set</span>;
  };
  
  const handleMethodToggle = () => {
    setIsPetroAppOnly(!isPetroAppOnly);
  };
  
  return (
    <div className="absolute z-20 bg-white shadow-2xl rounded-xl p-4 mt-2 right-0 w-[94vw] max-w-lg border border-gray-200 animate-fadeIn">
      <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Filter size={18} className="text-blue-600" />
          Filters
        </h3>
        <button
          onClick={() => setShowFilters(false)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          aria-label="Close filters"
        >
          <X size={18} />
        </button>
      </div>

      {/* Payment Method Filter Section */}
      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Payment Method</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPetroAppOnly}
              onChange={handleMethodToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700 min-w-[80px]">
              {isPetroAppOnly ? 'PetroApp' : 'All Methods'}
            </span>
          </label>
        </div>
        {isPetroAppOnly && (
          <p className="text-xs text-purple-600 mt-2 flex items-center">
            <Info size={12} className="mr-1" />
            Showing only PetroApp transactions
          </p>
        )}
      </div>

      {/* Date Filter Section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-shrink-0 w-full md:w-40 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1.5">
              <Zap size={14} /> Quick Select
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              {quickFilters.map(({ label, getRange }) => (
                <button
                  key={label}
                  onClick={() => handleQuickFilterClick(getRange)}
                  className="w-full text-blue-600 bg-blue-50 hover:bg-blue-100 py-1.5 px-3 rounded-md transition-colors text-xs font-medium"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <Calendar size={12} className="inline mr-1" />
                Start Date
              </label>
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-sm font-mono text-gray-800">
                {formatDate(selectedRange.from)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <Calendar size={12} className="inline mr-1" />
                End Date
              </label>
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-sm font-mono text-gray-800">
                {formatDate(selectedRange.to)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow p-2 border border-gray-200 rounded-lg flex justify-center bg-white">
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={setSelectedRange}
            numberOfMonths={1}
            classNames={{
              root: 'w-full',
              caption: 'flex justify-center items-center relative text-sm',
              nav_button: 'h-6 w-6 absolute top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700',
              nav_button_previous: 'left-1',
              nav_button_next: 'right-1',
              table: 'w-full border-collapse mt-2',
              head_cell: 'p-0 pb-2 text-xs font-medium text-gray-500 dark:text-gray-400',
              cell: 'p-0',
              day: 'h-8 w-8 text-sm rounded-md transition-colors',
              day_today: 'font-bold text-red-500 bg-red-50 dark:bg-red-900/50',
              day_selected: 'bg-blue-600 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-500',
              day_range_middle: 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200',
              day_range_start: 'rounded-r-none',
              day_range_end: 'rounded-l-none',
              day_disabled: 'opacity-40 cursor-not-allowed',
            }}
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedRange.from || selectedRange.to || isPetroAppOnly) && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-medium text-blue-700 mb-1">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {(selectedRange.from || selectedRange.to) && (
              <span className="inline-flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                <Calendar size={10} className="mr-1" />
                {selectedRange.from && selectedRange.to 
                  ? `${format(selectedRange.from, 'MMM d')} - ${format(selectedRange.to, 'MMM d, yyyy')}`
                  : selectedRange.from 
                    ? `From ${format(selectedRange.from, 'MMM d, yyyy')}`
                    : `Until ${format(selectedRange.to, 'MMM d, yyyy')}`
                }
              </span>
            )}
            {isPetroAppOnly && (
              <span className="inline-flex items-center text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                <CreditCard size={10} className="mr-1" />
                PetroApp Only
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={handleClearFilter}
          className="flex items-center text-sm text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg transition-colors font-medium"
        >
          <X size={16} className="mr-1" />
          Clear All
        </button>
        <button
          onClick={handleApplyFilter}
          disabled={!isChanged}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm flex items-center font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600"
        >
          <Check size={16} className="mr-1.5" />
          Apply Filters
        </button>
      </div>
    </div>
  );
};

// Info icon component (since it wasn't imported from lucide-react)
const Info = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default DateFilterModal;