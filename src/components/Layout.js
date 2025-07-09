import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Fuel, 
  PlusCircle, 
  Users, 
  LogOut, 
  Truck, 
  Disc, 
  Settings, 
  DollarSign,
  Container,
  Droplet,
  Building,
  BarChart4,
  FileText,
  CreditCard,
  PieChart
} from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import { useAuth } from './AuthContext';

// Permission level required for certain operations
const REQUIRED_PERMISSION_LEVEL = 3;

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, hasPermission, userPermission, hasMinPermissionLevel } = useAuth();
  
  // Check if user has required permission level
  const hasRequiredPermissionLevel = hasMinPermissionLevel(REQUIRED_PERMISSION_LEVEL);

  // Handle scroll for shadow effect on header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Close sidebar on mobile when clicking outside
  const handleContentClick = () => {
    if (sidebarOpen && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Filter navigation items based on permissions
  const getNavItems = (items) => {
    return items.filter(item => {
      // Hide restricted items if user doesn't have required permission level
      if (item.minPermissionLevel && !hasMinPermissionLevel(item.minPermissionLevel)) {
        return false;
      }
      return true;
    });
  };
  
  // Navigation items grouped by sections
  const navSections = [
    {
      title: "Fuel Management",
      icon: <Fuel size={18} />,
      items: getNavItems([
        { 
          path: '/', 
          icon: <Fuel size={18} />, 
          label: 'Fuel Events',
          isActive: location.pathname === '/'
        },
        { 
          path: '/add-fuel', 
          icon: <PlusCircle size={18} />, 
          label: 'Add Fuel Event',
          isActive: location.pathname === '/add-fuel',
          minPermissionLevel: REQUIRED_PERMISSION_LEVEL
        },
      ])
    },
    {
      title: "Fleet Management",
      icon: <Truck size={18} />,
      items: getNavItems([
        { 
          path: '/trucks', 
          icon: <Truck size={18} />, 
          label: 'Trucks',
          isActive: location.pathname === '/trucks' || location.pathname.includes('/trucks/')
        },
        { 
          path: '/add-car', 
          icon: <PlusCircle size={18} />, 
          label: 'Add Car',
          isActive: location.pathname === '/add-car',
          minPermissionLevel: REQUIRED_PERMISSION_LEVEL
        },
        { 
          path: '/car-management', 
          icon: <Truck size={18} />, 
          label: 'Car Management',
          isActive: location.pathname === '/car-management'
        },
        { 
          path: '/tires', 
          icon: <Disc size={18} />, 
          label: 'Tires',
          isActive: location.pathname === '/tires' || location.pathname.includes('/tires/')
        },
        { 
          path: '/oil-changes-list', 
          icon: <Droplet size={18} />, 
          label: 'Oil Changes',
          isActive: location.pathname === '/oil-changes-list' || location.pathname.includes('/edit-oil-change/')
        },
      ])
    },
    {
      title: "Trip Management",
      icon: <Container size={18} />,
      items: getNavItems([
        { 
          path: '/trips-list', 
          icon: <Container size={18} />, 
          label: 'Trips',
          isActive: location.pathname === '/trips-list' || location.pathname.includes('/trip-details/')
        },
        { 
          path: '/fees', 
          icon: <DollarSign size={18} />, 
          label: 'Fee Mappings',
          isActive: location.pathname === '/fees',
          minPermissionLevel: REQUIRED_PERMISSION_LEVEL
        },
      ])
    },
    {
      title: "Driver Management",
      icon: <Users size={18} />,
      items: getNavItems([
        { 
          path: '/drivers', 
          icon: <Users size={18} />, 
          label: 'Drivers',
          isActive: location.pathname === '/drivers' || location.pathname.includes('/driver/')
        },
        { 
          path: '/add-driver', 
          icon: <PlusCircle size={18} />, 
          label: 'Add Driver',
          isActive: location.pathname === '/add-driver',
          minPermissionLevel: REQUIRED_PERMISSION_LEVEL
        }
      ])
    }
  ];
  
  // Only add the Vendor Finance section if user has the required permission level
  if (hasMinPermissionLevel(REQUIRED_PERMISSION_LEVEL)) {
    navSections.push({
      title: "Vendor Finance",
      icon: <DollarSign size={18} />,
      items: [
        { 
          path: '/finance-dashboard', 
          icon: <BarChart4 size={18} />, 
          label: 'Financial Dashboard',
          isActive: location.pathname === '/finance-dashboard'
        },
        { 
          path: '/vendors', 
          icon: <Building size={18} />, 
          label: 'Vendors',
          isActive: location.pathname === '/vendors' || 
                    location.pathname.includes('/vendors/') && !location.pathname.includes('/vendors/create')
        },
        { 
          path: '/transactions', 
          icon: <CreditCard size={18} />, 
          label: 'Transactions',
          isActive: location.pathname === '/transactions'
        },
        { 
          path: '/vendors/create', 
          icon: <PlusCircle size={18} />, 
          label: 'Add Vendor',
          isActive: location.pathname === '/vendors/create',
          minPermissionLevel: REQUIRED_PERMISSION_LEVEL
        },
        { 
          path: '/reports', 
          icon: <PieChart size={18} />, 
          label: 'Financial Reports',
          isActive: location.pathname === '/reports',
          minPermissionLevel: REQUIRED_PERMISSION_LEVEL
        }
      ]
    });
  }
  
  // Admin section - only displayed for users with admin permission
  if (hasPermission('admin')) {
    navSections.push({
      title: "Administration",
      icon: <Settings size={18} />,
      items: [
        {
          path: '/admin', 
          icon: <Settings size={18} />, 
          label: 'Admin Panel',
          isActive: location.pathname === '/admin'
        },
        {
          path: '/user-management',
          icon: <Users size={18} />,
          label: 'User Management',
          isActive: location.pathname === '/user-management'
        }
      ]
    });
  }

  // Filter out sections with no items
  const filteredNavSections = navSections.filter(section => section.items.length > 0);
  
  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-auto">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-40 z-40 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 lg:w-76 bg-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col
        md:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-blue-100 flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500 rounded-lg">
              <Container className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-800">Apex Fleet</span>
          </div>
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            onClick={toggleSidebar}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="p-4 overflow-y-auto flex-grow">
          {filteredNavSections.map((section, idx) => (
            <div key={idx} className="mb-5">
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-2.5 px-2">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={`
                      flex items-center space-x-3 px-3.5 py-2.5 rounded-lg transition-all duration-200
                      ${item.isActive 
                        ? 'bg-blue-500 text-white font-medium shadow-sm' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                    `}
                    onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                  >
                    <span className={`
                      p-1.5 rounded-md
                      ${item.isActive 
                        ? 'bg-white bg-opacity-25 text-white' 
                        : 'bg-blue-100 text-blue-600'}
                    `}>
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
              {idx < filteredNavSections.length - 1 && (
                <div className="border-t border-blue-100 my-4"></div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer - User Info & Logout */}
        <div className="p-4 border-t border-blue-100 flex-shrink-0 bg-blue-50">
          {user && (
            <div className="mb-4 flex items-center">
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-3">
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-blue-600 truncate">{user.email}</p>
              </div>
              {userPermission && (
                <div className="ml-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                    Level {userPermission}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <button 
            className="w-full flex items-center justify-center space-x-2 p-3
            text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
          
          {/* Copyright */}
          <div className="text-center text-xs text-blue-400 mt-4">
            © {new Date().getFullYear()} Apex Fleet
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div 
        className={`
          flex-1 flex flex-col ml-0 md:ml-72 lg:ml-76 w-full min-w-0
        `} 
        onClick={handleContentClick}
      >
        {/* Top App Bar */}
        <div className={`
          bg-white p-3.5 md:p-4.5 flex items-center justify-between sticky top-0 z-40 transition-shadow duration-300
          ${scrolled ? 'shadow-md' : 'shadow-sm border-b border-blue-100'}
        `}>
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={toggleSidebar}
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumbs */}
            <Breadcrumbs />
          </div>
          
          {/* Right side of App Bar */}
          <div className="flex items-center space-x-3">
            {/* Permission Level Indicator */}
            {!hasRequiredPermissionLevel && (
              <div className="hidden md:block">
                <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-medium">
                  Limited Access
                </span>
              </div>
            )}
            
            {/* Mobile User Avatar */}
            <div className="md:hidden">
              {user && (
                <button 
                  className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium"
                  onClick={toggleSidebar}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-5 md:p-6 lg:p-8 bg-gray-50">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <div className="py-3 px-4 md:px-6 bg-white border-t border-gray-100 text-center text-gray-400 text-xs">
        Apex Fleet. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Layout;