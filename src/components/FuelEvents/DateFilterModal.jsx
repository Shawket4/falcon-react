// File: components/DateFilterModal.jsx
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, X } from 'lucide-react';

const DateFilterModal = ({ dateRange, setDateRange, resetDateFilter, setShowFilters }) => {
  // Custom styles to override react-datepicker default styling
  const customDatePickerStyles = `
    .react-datepicker {
      font-family: inherit;
      font-size: 0.9rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .react-datepicker__header {
      background-color: #f3f4f6;
      border-bottom: 1px solid #e5e7eb;
      padding-top: 0.75rem;
    }
    .react-datepicker__current-month {
      font-weight: 600;
      font-size: 1rem;
    }
    .react-datepicker__day--selected {
      background-color: #3b82f6;
      border-radius: 0.25rem;
    }
    .react-datepicker__day:hover {
      background-color: #dbeafe;
      border-radius: 0.25rem;
    }
    .react-datepicker__day--keyboard-selected {
      background-color: #93c5fd;
      border-radius: 0.25rem;
    }
    .react-datepicker__navigation {
      top: 0.75rem;
    }
    .react-datepicker__day {
      margin: 0.2rem;
      width: 2rem;
      line-height: 2rem;
    }
    .react-datepicker__day-name {
      margin: 0.2rem;
      width: 2rem;
    }
    .react-datepicker__month-container {
      padding: 0.5rem;
    }
  `;

  return (
    <div className="absolute z-10 bg-white shadow-lg rounded-lg p-5 mt-2 right-0 w-80 sm:w-96 border border-gray-200 animate-fadeIn">
      {/* Add custom styles */}
      <style>
        {customDatePickerStyles}
      </style>
      
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <Calendar size={16} className="text-blue-500" />
          Filter by Date Range
        </h3>
        <button 
          onClick={() => setShowFilters(false)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Date
        </label>
        <div className="relative rounded-md">
          <DatePicker
            selected={dateRange.startDate}
            onChange={date => setDateRange(prev => ({ ...prev, startDate: date }))}
            selectsStart
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            dateFormat="MMMM d, yyyy"
            placeholderText="Select start date"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            wrapperClassName="w-full"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            isClearable
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Calendar size={18} className="text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          End Date
        </label>
        <div className="relative rounded-md">
          <DatePicker
            selected={dateRange.endDate}
            onChange={date => setDateRange(prev => ({ ...prev, endDate: date }))}
            selectsEnd
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            minDate={dateRange.startDate}
            dateFormat="MMMM d, yyyy"
            placeholderText="Select end date"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            wrapperClassName="w-full"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            isClearable
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Calendar size={18} className="text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button 
          onClick={resetDateFilter}
          className="flex items-center text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
        >
          <X size={16} className="mr-1" />
          Clear
        </button>
        <button 
          onClick={() => setShowFilters(false)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};

export default DateFilterModal;