// File: components/EmptyState.jsx
import React from 'react';
import { Droplet, PlusCircle } from 'lucide-react';

const EmptyState = ({ navigate }) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 rounded-full bg-blue-50 mb-4">
        <Droplet className="w-12 h-12 text-blue-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">No fuel events found</h2>
      <p className="text-gray-500 mb-6 max-w-md">
        Start tracking your vehicle's fuel consumption by adding your first fuel event.
      </p>
      <button 
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 
                  shadow-sm flex items-center gap-2 transition-all duration-200 font-medium"
        onClick={() => navigate('/add-fuel')}
      >
        <PlusCircle size={20} />
        Add First Fuel Event
      </button>
    </div>
  );
};

export default EmptyState;