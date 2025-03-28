// File: components/LoadingState.jsx
import React from 'react';

const LoadingState = () => {
  return (
    <div className="flex flex-col justify-center items-center h-64">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
      </div>
      <p className="mt-4 text-gray-600">Loading fuel data...</p>
    </div>
  );
};

export default LoadingState;