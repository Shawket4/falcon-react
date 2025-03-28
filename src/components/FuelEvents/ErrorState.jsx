// File: components/ErrorState.jsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ error, retry }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg shadow-sm flex flex-col items-center">
      <AlertTriangle className="w-12 h-12 mb-4 text-red-500" />
      <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
      <p className="text-center mb-6">{error}</p>
      <button 
        onClick={retry}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 
                 transition-colors duration-200 flex items-center gap-2"
      >
        <RefreshCw size={18} />
        Retry
      </button>
    </div>
  );
};

export default ErrorState;