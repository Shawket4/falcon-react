import React, { useState } from 'react';
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
  Map, 
  DollarSign,
  Container,
  Droplet,
} from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import { useAuth } from './AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, hasPermission } = useAuth();
  
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
  
  // Navigation items grouped by sections
  const navSections = [
    {
      title: "Fuel Management",
      items: [
        { 
          path: '/', 
          icon: <Fuel size={20} />, 
          label: 'Fuel Events',
          isActive: location.pathname === '/'
        },
        { 
          path: '/add-fuel', 
          icon: <PlusCircle size={20} />, 
          label: 'Add Fuel Event',
          isActive: location.pathname === '/add-fuel'
        },
      ]
    },
    {
      title: "Fleet Management",
      items: [
        { 
          path: '/trucks', 
          icon: <Truck size={20} />, 
          label: 'Trucks',
          isActive: location.pathname === '/trucks' || location.pathname.includes('/trucks/')
        },
        { 
          path: '/tires', 
          icon: <Disc size={20} />, 
          label: 'Tires',
          isActive: location.pathname === '/tires' || location.pathname.includes('/tires/')
        },
        { 
          path: '/oil-changes-list', 
          icon: <Droplet size={20} />, 
          label: 'Oil Changes',
          isActive: location.pathname === '/oil-changes-list' || location.pathname.includes('/edit-oil-change/')
        },
      ]
    },
    {
      title: "Trip Management",
      items: [
        { 
          path: '/fees', 
          icon: <DollarSign size={20} />, 
          label: 'Fee Mappings',
          isActive: location.pathname === '/fees'
        },
        { 
          path: '/trips-list', 
          icon: <Container size={20} />, 
          label: 'Trips',
          isActive: location.pathname === '/trips-list' || location.pathname.includes('/trip-details/')
        },
      ]
    },
    {
      title: "Driver Management",
      items: [
        { 
          path: '/drivers', 
          icon: <Users size={20} />, 
          label: 'Drivers',
          isActive: location.pathname === '/drivers' || location.pathname.includes('/driver/')
        },
      ]
    },
  ];
  
  // Admin section - only displayed for users with admin permission
  if (hasPermission('admin')) {
    navSections.push({
      title: "Administration",
      items: [
        {
          path: '/admin', 
          icon: <Settings size={20} />, 
          label: 'Admin Panel',
          isActive: location.pathname === '/admin'
        }
      ]
    });
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col
        md:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Container className="text-blue-600" size={28} />
            <span className="text-2xl font-bold text-gray-800">Apex</span>
          </div>
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            onClick={toggleSidebar}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 overflow-y-auto flex-grow">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                      ${item.isActive 
                        ? 'bg-blue-50 text-blue-600 font-semibold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}
                    `}
                    onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                  >
                    <span className={`
                      p-2 rounded-lg
                      ${item.isActive 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-500'}
                    `}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              {idx < navSections.length - 1 && (
                <div className="border-t border-gray-200 my-4"></div>
              )}
            </div>
          ))}
        </nav>

        {/* User info, Copyright & Logout button */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          {user && (
            <div className="mb-4 px-3">
              <p className="text-sm font-medium text-gray-600">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          )}
          
          {/* Copyright in sidebar */}
          <div className="text-center text-xs text-gray-500 mb-3 px-2">
            © {new Date().getFullYear()} Shawket Ibrahim
          </div>
          
          <button 
            className="w-full flex items-center justify-center space-x-3 p-3 
            text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div 
        className={`
          flex-1 flex flex-col ml-0 md:ml-72 w-full
          ${sidebarOpen ? 'md:ml-0' : 'md:ml-72'}
        `} 
        onClick={handleContentClick}
      >
        {/* App bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            
            {/* Breadcrumbs component */}
            <Breadcrumbs />
          </div>
        </div>
        
        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
        
        {/* Copyright footer */}
        <div className="py-3 px-6 bg-white border-t border-gray-200 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Shawket Ibrahim. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Layout;