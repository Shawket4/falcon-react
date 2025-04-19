import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Enhanced ProtectedRoute component that supports both role-based and permission level checks
const ProtectedRoute = ({ children, requiredPermission = null, minPermissionLevel = null }) => {
  const { isAuthenticated, isLoading, hasPermission, hasMinPermissionLevel } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/landing-page" state={{ from: location }} replace />;
  }

  // Check permission level if required
  if (minPermissionLevel !== null && !hasMinPermissionLevel(minPermissionLevel)) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Access Denied</p>
          <p>You need a higher permission level to access this feature.</p>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Check specific permission role if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Access Denied</p>
          <p>You don't have permission to access this page.</p>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // If authenticated and has permission, render the children
  return children;
};

export default ProtectedRoute;