import React from 'react';

const StatCard = ({ icon: Icon, label, value, color, subvalue }) => {
  // Define color mappings for different UI elements
  const colorMappings = {
    blue: {
      light: 'bg-blue-50',
      dark: 'bg-blue-500',
      text: 'text-blue-600',
      border: 'border-blue-100'
    },
    green: {
      light: 'bg-green-50',
      dark: 'bg-green-500',
      text: 'text-green-600',
      border: 'border-green-100'
    },
    indigo: {
      light: 'bg-indigo-50',
      dark: 'bg-indigo-500',
      text: 'text-indigo-600',
      border: 'border-indigo-100'
    },
    purple: {
      light: 'bg-purple-50',
      dark: 'bg-purple-500',
      text: 'text-purple-600', 
      border: 'border-purple-100'
    },
    cyan: {
      light: 'bg-cyan-50',
      dark: 'bg-cyan-500',
      text: 'text-cyan-600',
      border: 'border-cyan-100'
    },
    amber: {
      light: 'bg-amber-50',
      dark: 'bg-amber-500',
      text: 'text-amber-600',
      border: 'border-amber-100'
    },
    // Default color if no match
    default: {
      light: 'bg-gray-50',
      dark: 'bg-gray-500',
      text: 'text-gray-600',
      border: 'border-gray-100'
    }
  };

  // Get color classes or fallback to default
  const colors = colorMappings[color] || colorMappings.default;

  return (
    <div className={`p-3 rounded-lg border ${colors.border} ${colors.light}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-full ${colors.dark} text-white`}>
          <Icon size={14} strokeWidth={2.5} />
        </div>
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      
      <div className={`text-lg font-semibold ${colors.text}`}>
        {value}
      </div>
      
      {subvalue && (
        <div className="text-xs text-gray-500 mt-1">
          {subvalue}
        </div>
      )}
    </div>
  );
};

export default StatCard;