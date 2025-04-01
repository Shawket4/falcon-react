// components/Layout.js
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Vendors', icon: Users, href: '/vendors' },
    { name: 'Transactions', icon: FileText, href: '/transactions' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <h1 className="font-bold text-xl">Vendor Finance</h1>
          <button 
            className="md:hidden text-gray-300 hover:text-white" 
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="mt-5 px-4 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150
                ${isActive(item.href) 
                  ? 'bg-slate-700 text-white' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
              `}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between h-16 px-4">
            <button 
              className="md:hidden text-gray-600 hover:text-gray-900" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="ml-auto flex items-center space-x-4">
              <div className="relative">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-800 text-white">
                  <span className="text-sm font-medium">UF</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;