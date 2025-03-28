// File: components/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorBoundary = ({ children, fallback }) => {
  try {
    return children;
  } catch (error) {
    console.error('Uncaught error:', error);
    return fallback || (
      <div className="flex flex-col justify-center items-center h-64 p-8 bg-red-50 text-red-600 rounded-lg shadow-sm border border-red-200">
        <AlertTriangle size={48} className="mb-4" />
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p>Please try again later or contact support if the problem persists.</p>
      </div>
    );
  }
};

export default ErrorBoundary;