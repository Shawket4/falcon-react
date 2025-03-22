import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import apiClient from '../apiClient';

const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Get driver name for driver-related pages
  const [driverName, setDriverName] = useState('');
  
  useEffect(() => {
    // Fetch driver name when on driver routes
    const fetchDriverName = async () => {
      const driverId = params.id || (pathnames[0] === 'driver' && pathnames[1]);
      
      if (driverId && (pathnames[0] === 'driver' || pathnames[2] === 'loans')) {
        try {
          const response = await apiClient.get(`/drivers/${driverId}`);
          const data = response.data;
          if (data && data.name) {
            setDriverName(data.name);
          }
        } catch (error) {
          console.error('Error fetching driver name:', error);
        }
      }
    };
    
    fetchDriverName();
  }, [params.id, pathnames]);

  // Don't render breadcrumbs on home page
  if (location.pathname === '/') {
    return (
      <span className="cursor-pointer hover:text-blue-600 font-medium dark:hover:text-blue-400"
        onClick={() => navigate('/')}>
        Apex
      </span>
    );
  }
  
  // Custom rendering for specific routes
  const renderBreadcrumbs = () => {
    // Base breadcrumb always shows Apex
    const breadcrumbs = [
      <span key="home" 
        className="cursor-pointer hover:text-blue-600 font-medium dark:hover:text-blue-400"
        onClick={() => navigate('/')}>
        Apex
      </span>
    ];
    
    // If we're on the drivers listing page
    if (pathnames[0] === 'drivers') {
      breadcrumbs.push(
        <ChevronRight key="chevron-drivers" size={16} />,
        <span key="drivers" className="text-gray-500 dark:text-gray-400">
          Drivers
        </span>
      );
    }
    
    // If we're on a specific driver's page
    else if (pathnames[0] === 'driver') {
      // Add Drivers breadcrumb with link
      breadcrumbs.push(
        <ChevronRight key="chevron-drivers" size={16} />,
        <span 
          key="drivers"
          className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          onClick={() => navigate('/drivers')}
        >
          Drivers
        </span>
      );
      
      // If we're on driver loans page
      if (pathnames[2] === 'loans') {
        // Add Driver name breadcrumb with link
        breadcrumbs.push(
          <ChevronRight key="chevron-driver" size={16} />,
          <span 
            key="driver-name"
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => navigate(`/driver/${pathnames[1]}`)}
          >
            {driverName || 'Driver Details'}
          </span>,
          <ChevronRight key="chevron-loans" size={16} />,
          <span key="loans" className="text-gray-500 dark:text-gray-400">
            Loans
          </span>
        );
        
        // If we're adding a loan
        if (pathnames[3] === 'add') {
          breadcrumbs.push(
            <ChevronRight key="chevron-add" size={16} />,
            <span key="add" className="text-gray-500 dark:text-gray-400">
              Add Loan
            </span>
          );
        }
      } 
      // Just driver details page
      else {
        breadcrumbs.push(
          <ChevronRight key="chevron-driver" size={16} />,
          <span key="driver-name" className="text-gray-500 dark:text-gray-400">
            {driverName || 'Driver Details'}
          </span>
        );
      }
    }
    
    // If we're on fuel events page
    else if (pathnames[0] === 'add-fuel') {
      breadcrumbs.push(
        <ChevronRight key="chevron-add-fuel" size={16} />,
        <span key="add-fuel" className="text-gray-500 dark:text-gray-400">
          Add Fuel Event
        </span>
      );
    }
    
    // If we're on details page
    else if (pathnames[0] === 'details') {
      breadcrumbs.push(
        <ChevronRight key="chevron-fuel-events" size={16} />,
        <span 
          key="fuel-events"
          className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          onClick={() => navigate('/')}
        >
          Fuel Events
        </span>,
        <ChevronRight key="chevron-details" size={16} />,
        <span key="details" className="text-gray-500 dark:text-gray-400">
          Details
        </span>
      );
    }
    
    // If we're on edit fuel page
    else if (pathnames[0] === 'edit-fuel') {
      breadcrumbs.push(
        <ChevronRight key="chevron-fuel-events" size={16} />,
        <span 
          key="fuel-events"
          className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          onClick={() => navigate('/')}
        >
          Fuel Events
        </span>,
        <ChevronRight key="chevron-edit" size={16} />,
        <span key="edit" className="text-gray-500 dark:text-gray-400">
          Edit Event
        </span>
      );
    }
    
    return breadcrumbs;
  };
  
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
      {renderBreadcrumbs()}
    </div>
  );
};

export default Breadcrumbs;