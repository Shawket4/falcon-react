// File: components/trips/FilterPanel.jsx
import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const FilterPanel = ({ companies, filters, onChange, onReset }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <Filter className="h-5 w-5 mr-2 text-blue-600" />
        Advanced Filters
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <div className="relative">
            <select
              name="company"
              value={filters.company}
              onChange={onChange}
              className="block w-full appearance-none px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[38px]"
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <div className="relative">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={onChange}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[38px]"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <div className="relative">
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={onChange}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[38px]"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <button
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;