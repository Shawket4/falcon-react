import React from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

// Recent activity item component
const ActivityItem = ({ date, vendorName, description, amount, type }) => {
  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <div className={`
        p-2 rounded-full mr-4 flex-shrink-0
        ${type === 'credit' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
      `}>
        {type === 'credit' ? 
          <ArrowDownCircle size={16} /> : 
          <ArrowUpCircle size={16} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{description}</p>
        <p className="text-xs text-gray-500 mt-0.5 flex items-center">
          <span>{vendorName}</span>
          <span className="inline-block mx-1.5 h-1 w-1 rounded-full bg-gray-300"></span>
          <span>{new Date(date).toLocaleDateString()}</span>
        </p>
      </div>
      <div className={`text-sm font-medium ${type === 'credit' ? 'text-red-600' : 'text-green-600'}`}>
        {type === 'credit' ? '+' : '-'}{amount}
      </div>
    </div>
  );
};

export default ActivityItem;