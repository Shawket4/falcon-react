// File: components/trips/ActiveFilters.jsx
import React from 'react';

const ActiveFilters = ({ searchTerm, filters, onClearSearch, onClearCompany, onClearDates }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">Active filters:</span>
      
      {searchTerm && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Search: {searchTerm}
          <button 
            onClick={onClearSearch} 
            className="ml-1.5 text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      )}
      
      {filters.company && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Company: {filters.company}
          <button 
            onClick={onClearCompany} 
            className="ml-1.5 text-green-600 hover:text-green-800 focus:outline-none"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      )}
      
      {filters.startDate && filters.endDate && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Date: {filters.startDate} - {filters.endDate}
          <button 
            onClick={onClearDates} 
            className="ml-1.5 text-purple-600 hover:text-purple-800 focus:outline-none"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      )}
    </div>
  );
};

export default ActiveFilters;