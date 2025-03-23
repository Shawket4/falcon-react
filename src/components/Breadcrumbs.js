import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import apiClient from '../apiClient';
import { pathNames } from '../App';

const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Get driver name for driver-related pages
  const [driverName, setDriverName] = useState('');
  const [truckDetails, setTruckDetails] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  
  // Prevent duplicate API calls
  const currentPathRef = useRef(location.pathname);
  const fetchInProgressRef = useRef(false);
  const driverIDRef = useRef(null);
  
  useEffect(() => {
    // If the path hasn't changed, don't do anything
    if (currentPathRef.current === location.pathname) {
      return;
    }
    
    // Update current path reference
    currentPathRef.current = location.pathname;
    
    // Reset state when path changes
    setDriverName('');
    setTruckDetails(null);
    setTripDetails(null);
    
    const fetchEntityDetails = async () => {
      // Prevent concurrent fetches
      if (fetchInProgressRef.current) {
        return;
      }
      
      fetchInProgressRef.current = true;
      
      // Fetch driver name when on driver routes
      const driverId = params.id || (pathnames[0] === 'driver' && pathnames[1]);
      
      // Only fetch if we have a driver ID and we're on a driver-related page
      // Also prevent duplicate fetches for the same driver
      if (driverId && 
          (pathnames[0] === 'driver' || pathnames[2] === 'loans') && 
          driverIDRef.current !== driverId) {
        
        driverIDRef.current = driverId; // Update the current driver ID
        
        try {
          const response = await apiClient.post(
            '/api/GetDriverProfileData',
            {},
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (response.data) {
            const driverData = response.data.find(d => d.ID.toString() === driverId);
            if (driverData) {
              setDriverName(driverData.name);
            }
          }
        } catch (error) {
          console.error('Error fetching driver name:', error);
        }
      }
      
      // Fetch truck details
      if (pathnames[0] === 'trucks' && pathnames.length > 1 && pathnames[1] !== 'create') {
        try {
          const truckId = pathnames[1];
          const response = await apiClient.get(`/api/trucks/${truckId}`);
          if (response.data) {
            setTruckDetails(response.data);
          }
        } catch (error) {
          console.error('Error fetching truck details:', error);
        }
      }
      
      // Fetch trip details
      if ((pathnames[0] === 'trip-details' || pathnames[0] === 'trips') && pathnames.length > 1) {
        try {
          const tripId = pathnames[1];
          const response = await apiClient.get(`/api/trips/${tripId}`);
          if (response.data) {
            setTripDetails(response.data);
          }
        } catch (error) {
          console.error('Error fetching trip details:', error);
        }
      }
      
      fetchInProgressRef.current = false;
    };
    
    fetchEntityDetails();
    
    // Clean up function to reset refs when component unmounts
    return () => {
      fetchInProgressRef.current = false;
      driverIDRef.current = null;
    };
  }, [location.pathname, params.id]);

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
    
    // Helper function to add a breadcrumb item
    const addBreadcrumb = (key, text, path = null, isActive = false) => {
      // Add chevron separator
      breadcrumbs.push(<ChevronRight key={`chevron-${key}`} size={16} />);
      
      // Add the breadcrumb item
      if (path && !isActive) {
        breadcrumbs.push(
          <span
            key={key}
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => navigate(path)}
          >
            {text}
          </span>
        );
      } else {
        breadcrumbs.push(
          <span key={key} className="text-gray-500 dark:text-gray-400">
            {text}
          </span>
        );
      }
    };
    
    // DRIVERS SECTION
    if (pathnames[0] === 'drivers') {
      addBreadcrumb('drivers', 'Drivers', null, true);
    }
    
    // DRIVER DETAILS SECTION
    else if (pathnames[0] === 'driver') {
      addBreadcrumb('drivers', 'Drivers', '/drivers');
      
      // If we're on driver loans page
      if (pathnames[2] === 'loans') {
        // Add Driver name breadcrumb with link
        addBreadcrumb('driver-name', driverName || 'Driver Details', `/driver/${pathnames[1]}`);
        
        // Add Loans breadcrumb
        if (pathnames[3] === 'add') {
          addBreadcrumb('loans', 'Loans', `/driver/loans/${pathnames[1]}`);
          addBreadcrumb('add-loan', 'Add Loan', null, true);
        } else {
          addBreadcrumb('loans', 'Loans', null, true);
        }
      } 
      // Just driver details page
      else {
        addBreadcrumb('driver-name', driverName || 'Driver Details', null, true);
      }
    }
    
    // FUEL EVENTS SECTION
    else if (pathnames[0] === 'add-fuel') {
      addBreadcrumb('add-fuel', 'Add Fuel Event', null, true);
    }
    else if (pathnames[0] === 'details') {
      addBreadcrumb('fuel-events', 'Fuel Events', '/');
      addBreadcrumb('details', 'Details', null, true);
    }
    else if (pathnames[0] === 'edit-fuel') {
      addBreadcrumb('fuel-events', 'Fuel Events', '/');
      addBreadcrumb('edit', 'Edit Event', null, true);
    }
    
    // TRUCKS SECTION
    else if (pathnames[0] === 'trucks') {
      if (pathnames.length === 1) {
        addBreadcrumb('trucks', 'Trucks', null, true);
      } else if (pathnames[1] === 'create') {
        addBreadcrumb('trucks', 'Trucks', '/trucks');
        addBreadcrumb('create-truck', 'Add Truck', null, true);
      } else {
        addBreadcrumb('trucks', 'Trucks', '/trucks');
        addBreadcrumb('truck-details', truckDetails?.plate_number || 'Truck Details', null, true);
      }
    }
    
    // TIRES SECTION
    else if (pathnames[0] === 'tires') {
      if (pathnames.length === 1) {
        addBreadcrumb('tires', 'Tires', null, true);
      } else if (pathnames[1] === 'create') {
        addBreadcrumb('tires', 'Tires', '/tires');
        addBreadcrumb('create-tire', 'Add Tire', null, true);
      } else {
        addBreadcrumb('tires', 'Tires', '/tires');
        addBreadcrumb('tire-details', 'Tire Details', null, true);
      }
    }
    
    // MAPPINGS SECTION
    else if (pathnames[0] === 'distances') {
      addBreadcrumb('distances', 'Distance Mappings', null, true);
    }
    else if (pathnames[0] === 'fees') {
      addBreadcrumb('fees', 'Fee Mappings', null, true);
    }
    
    // TRIPS SECTION
    else if (pathnames[0] === 'trips-list') {
      addBreadcrumb('trips', 'Trips', null, true);
    }
    else if (pathnames[0] === 'add-trip') {
      addBreadcrumb('trips', 'Trips', '/trips-list');
      addBreadcrumb('add-trip', 'Add Trip', null, true);
    }
    else if (pathnames[0] === 'trips' && pathnames.length > 1) {
      addBreadcrumb('trips', 'Trips', '/trips-list');
      addBreadcrumb('edit-trip', 'Edit Trip', null, true);
    }
    else if (pathnames[0] === 'trip-details') {
      addBreadcrumb('trips', 'Trips', '/trips-list');
      addBreadcrumb('trip-details', 'Trip Details', null, true);
    }
    
    // OIL CHANGES SECTION
    else if (pathnames[0] === 'oil-changes-list') {
      addBreadcrumb('oil-changes', 'Oil Changes', null, true);
    }
    else if (pathnames[0] === 'add-oil-change') {
      addBreadcrumb('oil-changes', 'Oil Changes', '/oil-changes-list');
      addBreadcrumb('add-oil-change', 'Add Oil Change', null, true);
    }
    else if (pathnames[0] === 'edit-oil-change') {
      addBreadcrumb('oil-changes', 'Oil Changes', '/oil-changes-list');
      addBreadcrumb('edit-oil-change', 'Edit Oil Change', null, true);
    }
    
    // ADMIN SECTION
    else if (pathnames[0] === 'admin') {
      addBreadcrumb('admin', 'Admin Dashboard', null, true);
    }
    
    // Try to use the pathNames mapping for unknown routes
    else {
      const path = pathnames.join('/');
      if (pathNames[path]) {
        addBreadcrumb(path, pathNames[path], null, true);
      }
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