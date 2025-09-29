import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, 
  Home,
  Fuel,
  Truck,
  Users,
  Container,
  Droplet,
  Building,
  DollarSign,
  Map,
  Settings,
  Disc,
  FileText,
  AlertCircle,
  BarChart4,
  CreditCard,
  PieChart,
  Shield,
  Gauge,
  Plus
} from 'lucide-react';
import apiClient from '../apiClient';

const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // State for entity details
  const [entityDetails, setEntityDetails] = useState({
    driver: null,
    truck: null,
    trip: null,
    vendor: null,
    expense: null,
    oilChange: null
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Cache management
  const cache = useRef({});
  const currentPathRef = useRef(location.pathname);
  
  // Fetch entity details based on route
  useEffect(() => {
    if (currentPathRef.current === location.pathname) return;
    currentPathRef.current = location.pathname;
    
    const fetchDetails = async () => {
      setIsLoading(true);
      const newDetails = { ...entityDetails };
      
      try {
        // Driver details
        if (pathnames.includes('driver') || pathnames.includes('drivers')) {
          const driverId = params.id || pathnames[1];
          if (driverId && driverId !== 'expenses' && driverId !== 'loans' && driverId !== 'salaries') {
            const cacheKey = `driver-${driverId}`;
            if (cache.current[cacheKey]) {
              newDetails.driver = cache.current[cacheKey];
            } else {
              const response = await apiClient.post('/api/GetDriverProfileData', {});
              const driver = response.data?.find(d => d.ID.toString() === driverId);
              if (driver) {
                cache.current[cacheKey] = driver;
                newDetails.driver = driver;
              }
            }
          }
        }
        
        // Truck details
        if (pathnames[0] === 'trucks' && pathnames[1] && pathnames[1] !== 'create') {
          const truckId = pathnames[1];
          const cacheKey = `truck-${truckId}`;
          if (cache.current[cacheKey]) {
            newDetails.truck = cache.current[cacheKey];
          } else {
            const response = await apiClient.get(`/api/trucks/${truckId}`);
            if (response.data) {
              cache.current[cacheKey] = response.data;
              newDetails.truck = response.data;
            }
          }
        }
        
        // Trip details
        if (pathnames.includes('trip-details') || (pathnames[0] === 'trips' && pathnames[1])) {
          const tripId = pathnames[1] || params.tripId;
          if (tripId) {
            const cacheKey = `trip-${tripId}`;
            if (cache.current[cacheKey]) {
              newDetails.trip = cache.current[cacheKey];
            } else {
              const response = await apiClient.get(`/api/trips/${tripId}`);
              if (response.data) {
                cache.current[cacheKey] = response.data;
                newDetails.trip = response.data;
              }
            }
          }
        }
        
        // Vendor details
        if (pathnames.includes('vendor') || pathnames.includes('vendors')) {
          const vendorId = params.vendorId || params.id || pathnames[1];
          if (vendorId && vendorId !== 'create') {
            const cacheKey = `vendor-${vendorId}`;
            if (cache.current[cacheKey]) {
              newDetails.vendor = cache.current[cacheKey];
            } else {
              const response = await apiClient.get(`/api/vendors/${vendorId}`);
              if (response.data) {
                cache.current[cacheKey] = response.data;
                newDetails.vendor = response.data;
              }
            }
          }
        }
        if (pathnames.includes('service-management') || pathnames.some(p => p.startsWith('service-'))) {
        const carId = params.carId || pathnames[pathnames.findIndex(p => p === 'car') + 1];
        if (carId && !isNaN(carId)) {
          const cacheKey = `car-${carId}`;
          if (cache.current[cacheKey]) {
            newDetails.car = cache.current[cacheKey];
          } else {
            try {
              const response = await apiClient.get('/api/GetCars');
              const car = response.data?.find(c => c.ID.toString() === carId);
              if (car) {
                cache.current[cacheKey] = car;
                newDetails.car = car;
              }
            } catch (error) {
              console.warn('Could not fetch car details:', error);
            }
          }
        }
      }
      
      // Service Invoice details
      if (pathnames.includes('invoice') || pathnames.some(p => p.includes('service-invoice'))) {
        const invoiceId = params.invoiceId || pathnames[pathnames.length - 1];
        if (invoiceId && !isNaN(invoiceId)) {
          const cacheKey = `service-invoice-${invoiceId}`;
          if (cache.current[cacheKey]) {
            newDetails.serviceInvoice = cache.current[cacheKey];
          } else {
            try {
              const response = await apiClient.get(`/api/service-invoices/${invoiceId}`);
              if (response.data?.data) {
                cache.current[cacheKey] = response.data.data;
                newDetails.serviceInvoice = response.data.data;
              }
            } catch (error) {
              console.warn('Could not fetch service invoice details:', error);
            }
          }
        }
      }
      
      setEntityDetails(newDetails);
    } catch (error) {
      console.error('Error fetching entity details:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchDetails();
}, [location.pathname, params]);
  
  // Route configuration with icons and labels
  const routeConfig = useMemo(() => ({
    // Root sections
    'service-management': { label: 'Service Management', icon: FileText, color: 'text-amber-600' },
    'fuel': { label: 'Fuel Events', icon: Fuel, color: 'text-emerald-600' },
    'add-fuel': { label: 'Add Fuel Event', icon: Plus, color: 'text-emerald-600' },
    'edit-fuel': { label: 'Edit Fuel Event', icon: Fuel, color: 'text-emerald-600' },
    'details': { label: 'Event Details', icon: FileText, color: 'text-emerald-600' },
    
    // Fleet
    'trucks': { label: 'Vehicle Fleet', icon: Truck, color: 'text-blue-600' },
    'add-car': { label: 'Add Vehicle', icon: Plus, color: 'text-blue-600' },
    'car-management': { label: 'Fleet Management', icon: Settings, color: 'text-blue-600' },
    'map': { label: 'Station Locator', icon: Map, color: 'text-blue-600' },
    
    // Maintenance
    'tires': { label: 'Tire Management', icon: Disc, color: 'text-amber-600' },
    'oil-changes-list': { label: 'Oil Changes', icon: Droplet, color: 'text-amber-600' },
    'add-oil-change': { label: 'Add Oil Change', icon: Plus, color: 'text-amber-600' },
    'edit-oil-change': { label: 'Edit Oil Change', icon: Droplet, color: 'text-amber-600' },
    'speed-violations': { label: 'Speed Violations', icon: AlertCircle, color: 'text-amber-600' },
    
    // Trips
    'trips-list': { label: 'All Trips', icon: Container, color: 'text-purple-600' },
    'add-trip': { label: 'Register Trip', icon: Plus, color: 'text-purple-600' },
    'trip-details': { label: 'Trip Details', icon: Container, color: 'text-purple-600' },
    'trips': { label: 'Edit Trip', icon: Container, color: 'text-purple-600' },
    'fees': { label: 'Fee Mappings', icon: DollarSign, color: 'text-purple-600' },
    'distances': { label: 'Distance Mappings', icon: Map, color: 'text-purple-600' },
    
    // Personnel
    'drivers': { label: 'Driver Registry', icon: Users, color: 'text-cyan-600' },
    'driver': { label: 'Driver Details', icon: Users, color: 'text-cyan-600' },
    'add-driver': { label: 'Add Driver', icon: Plus, color: 'text-cyan-600' },
    'loans': { label: 'Loans', icon: DollarSign, color: 'text-cyan-600' },
    'expenses': { label: 'Expenses', icon: CreditCard, color: 'text-cyan-600' },
    'salaries': { label: 'Salaries', icon: DollarSign, color: 'text-cyan-600' },
    
    // Finance
    'finance-dashboard': { label: 'Financial Dashboard', icon: BarChart4, color: 'text-rose-600' },
    'vendors': { label: 'Vendor Directory', icon: Building, color: 'text-rose-600' },
    'vendor': { label: 'Vendor Details', icon: Building, color: 'text-rose-600' },
    'transactions': { label: 'Transactions', icon: CreditCard, color: 'text-rose-600' },
    'reports': { label: 'Financial Reports', icon: PieChart, color: 'text-rose-600' },
    
    // System
    'admin': { label: 'Admin Panel', icon: Shield, color: 'text-slate-600' },
    'user-management': { label: 'User Management', icon: Users, color: 'text-slate-600' },
    'logs': { label: 'System Logs', icon: FileText, color: 'text-slate-600' },
    'settings': { label: 'Settings', icon: Settings, color: 'text-slate-600' },
    
    // Analytics
    'driver-analytics': { label: 'Driver Analytics', icon: BarChart4, color: 'text-indigo-600' },
    'trip-report-garage': { label: 'Garage Report', icon: FileText, color: 'text-purple-600' },
  }), []);
  
  // Build breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items = [];
    
    // Always add home
    items.push({
      label: 'Apex Fleet',
      icon: Home,
      path: '/',
      isActive: location.pathname === '/',
      color: 'text-gray-600'
    });
    if (location.pathname.includes('/service-management')) {
    // Add Service Management breadcrumb
    items.push({
      label: 'Service Management',
      icon: FileText,
      path: '/service-management',
      isActive: location.pathname === '/service-management',
      color: 'text-amber-600'
    });
    
    // If we're deeper in service management, we don't show sub-paths
    // since it's a single-page app with internal navigation
    return items;
  }
    // If we're on the home page, return just the home item
    if (location.pathname === '/' || pathnames.length === 0) {
      return items;
    }
    
    // Build breadcrumb trail based on pathname
    let currentPath = '';
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathnames.length - 1;
      
      // Skip numeric IDs in breadcrumbs unless they're the last item
      if (!isNaN(segment) && !isLast) {
        return;
      }
      
      // Get config for this segment
      const config = routeConfig[segment] || {};
      
      // Handle special cases with entity names
      let label = config.label || segment;
      let icon = config.icon;
      let color = config.color || 'text-gray-600';
      
      // Replace with actual entity names where available
      if (segment === 'driver' || (pathnames[0] === 'driver' && index === 1)) {
        if (entityDetails.driver) {
          label = entityDetails.driver.name;
          icon = Users;
        }
      } else if (pathnames[0] === 'trucks' && index === 1 && pathnames[1] !== 'create') {
        if (entityDetails.truck) {
          label = entityDetails.truck.plate_number || 'Truck Details';
          icon = Truck;
        }
      } else if (pathnames[0] === 'trip-details' && index === 1) {
        if (entityDetails.trip) {
          label = `Trip #${entityDetails.trip.id || segment}`;
          icon = Container;
        }
      } else if ((pathnames[0] === 'vendor' || pathnames[0] === 'vendors') && index === 1) {
        if (entityDetails.vendor) {
          label = entityDetails.vendor.name;
          icon = Building;
        }
      } else if (pathnames[0] === 'edit-oil-change' && index === 1) {
        label = `Oil Change #${segment}`;
        icon = Droplet;
      }
      
      // Handle nested routes
      if (segment === 'loans' || segment === 'expenses' || segment === 'salaries') {
        const parentConfig = routeConfig[pathnames[0]] || {};
        color = parentConfig.color || color;
      }
      
      // Handle 'add' segments
      if (segment === 'add') {
        label = 'Add';
        icon = Plus;
      }
      
      // Handle 'create' segments
      if (segment === 'create') {
        label = 'Create';
        icon = Plus;
      }
      
      items.push({
        label,
        icon,
        path: isLast ? null : currentPath,
        isActive: isLast,
        color
      });
    });
    
    return items;
  }, [pathnames, location.pathname, entityDetails, routeConfig]);
  
  // Render loading skeleton
  if (isLoading && breadcrumbItems.length <= 2) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
        <ChevronRight size={16} className="text-gray-400" />
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }
  
  return (
    <nav className="flex items-center">
      <ol className="flex items-center space-x-1 md:space-x-2">
        {breadcrumbItems.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight size={16} className="mx-1 text-gray-400" />
              )}
              
              {isLast || !item.path ? (
                <div className={`flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-100 ${item.color}`}>
                  {Icon && <Icon size={16} />}
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors ${item.color} hover:${item.color}`}
                >
                  {Icon && <Icon size={16} />}
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;