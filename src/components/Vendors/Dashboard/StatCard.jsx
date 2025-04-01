import React from 'react';

// Stat card component for dashboard metrics
const StatCard = ({ title, value, subtitle, icon: Icon, iconColor, change, changeType }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${iconColor} text-white mr-4`}>
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {change && (
            <div className={`text-xs font-medium rounded-full px-2 py-1 ${
              changeType === 'positive' ? 'bg-green-100 text-green-800' : 
              changeType === 'negative' ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {changeType === 'positive' ? '+' : changeType === 'negative' ? '-' : ''}
              {change}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;