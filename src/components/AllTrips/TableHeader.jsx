// File: components/trips/TableHeader.jsx
import React from 'react';

const TableHeader = ({ label, field, sortConfig, onSort, className, icon }) => {
  const isSorted = sortConfig.key === field;
  const sortDirection = isSorted ? sortConfig.direction : null;

  return (
    <th 
      scope="col" 
      className={`text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center">
        {icon}
        {label}
        {isSorted && (
          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={sortDirection === 'ascending' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
            />
          </svg>
        )}
      </div>
    </th>
  );
};

export default TableHeader;