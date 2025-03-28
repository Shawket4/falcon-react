// File: components/DateFilterModal.jsx
import React from 'react';
import { format } from './DateUtils';
import { Calendar, X } from 'lucide-react';

const DateFilterModal = ({ dateRange, setDateRange, resetDateFilter, setShowFilters }) => {
  return (
    <div className="absolute z-10 bg-white shadow-lg rounded-lg p-5 mt-2 right-0 w-72 border border-gray-200 animate-fadeIn">
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <Calendar size={16} className="text-blue-500" />
          Filter by Date
        </h3>
        <button 
          onClick={() => setShowFilters(false)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
        <input 
          type="date" 
          value={dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => setDateRange(prev => ({
            ...prev, 
            startDate: e.target.value ? new Date(e.target.value) : null
          }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
        <input 
          type="date" 
          value={dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => setDateRange(prev => ({
            ...prev, 
            endDate: e.target.value ? new Date(e.target.value) : null
          }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>
      
      <div className="flex justify-between">
        <button 
          onClick={resetDateFilter}
          className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
        >
          <X size={16} />
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