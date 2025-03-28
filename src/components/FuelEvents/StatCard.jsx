// File: components/StatCard.jsx
import React from 'react';

const StatCard = ({ icon, label, value, color, subvalue }) => {
  const Icon = icon;
  
  return (
    <div className={`bg-${color}-50 p-4 rounded-lg border border-${color}-100 transition-all duration-200 hover:shadow-md flex flex-col h-full`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600`}>
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
      </div>
      <div className="mt-1">
        <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
        {subvalue && (
          <div className="text-xs text-gray-500 mt-1">{subvalue}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard;