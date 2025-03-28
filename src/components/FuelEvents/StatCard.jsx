// File: components/StatCard.jsx
import React from 'react';

const StatCard = ({ icon, label, value, color, subvalue }) => {
  const Icon = icon;
  
  return (
    <div className={`bg-${color}-50 p-3 sm:p-4 rounded-lg border border-${color}-100 transition-all duration-200 hover:shadow-md flex flex-col h-full`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
        <div className={`p-1.5 sm:p-2 rounded-full bg-${color}-100 text-${color}-600 flex-shrink-0`}>
          <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
        </div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-600 truncate">{label}</h3>
      </div>
      <div className="mt-1">
        <div className={`text-lg sm:text-xl md:text-2xl font-bold text-${color}-700 break-words`}>{value}</div>
        {subvalue && (
          <div className="text-xs text-gray-500 mt-1 break-words">{subvalue}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard;