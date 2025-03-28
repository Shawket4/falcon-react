// File: components/DateFilterModal.jsx
import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { Calendar, X, Check } from 'lucide-react';

const DateFilterModal = ({ dateRange, setDateRange, resetDateFilter, setShowFilters }) => {
  const [selectedRange, setSelectedRange] = useState({
    from: dateRange.startDate,
    to: dateRange.endDate
  });

  // Apply the selected range when clicking the Apply button
  const handleApplyFilter = () => {
    setDateRange({
      startDate: selectedRange.from,
      endDate: selectedRange.to
    });
    setShowFilters(false);
  };

  // Clear filter values
  const handleClearFilter = () => {
    setSelectedRange({ from: undefined, to: undefined });
    resetDateFilter();
  };

  // Format the date for display
  const formatDate = (date) => {
    if (!date) return '';
    return format(date, 'MMM d, yyyy');
  };

  // Update the selected range when the external dateRange prop changes
  useEffect(() => {
    setSelectedRange({
      from: dateRange.startDate,
      to: dateRange.endDate
    });
  }, [dateRange]);

  return (
    <div className="absolute z-10 bg-white shadow-xl rounded-xl p-5 mt-2 right-0 w-80 sm:w-96 border border-gray-200 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <Calendar size={16} className="text-blue-600" />
          Filter by Date Range
        </h3>
        <button 
          onClick={() => setShowFilters(false)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Date Range Display */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-sm">
            {formatDate(selectedRange.from) || 'Not set'}
          </div>
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-sm">
            {formatDate(selectedRange.to) || 'Not set'}
          </div>
        </div>
      </div>
      
      {/* Date Picker */}
      <div className="p-2 border border-gray-100 rounded-lg mb-4 flex justify-center bg-gray-50">
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={setSelectedRange}
          modifiersClassNames={{
            selected: 'bg-blue-600 text-white rounded-md',
            today: 'text-red-600 font-bold',
            range_start: 'bg-blue-600 text-white rounded-l-md',
            range_end: 'bg-blue-600 text-white rounded-r-md',
            range_middle: 'bg-blue-100'
          }}
          styles={{
            caption: { color: '#4b5563' },
            day: { margin: '0.15rem' }
          }}
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <button 
          onClick={handleClearFilter}
          className="flex items-center text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
        >
          <X size={16} className="mr-1" />
          Clear
        </button>
        <button 
          onClick={handleApplyFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center"
        >
          <Check size={16} className="mr-1" />
          Apply Filter
        </button>
      </div>
    </div>
  );
};

export default DateFilterModal;