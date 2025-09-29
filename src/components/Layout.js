import React, { useState, useEffect, useMemo } from 'react';
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
  PieChart,
  Map,
  ChevronDown,
  ChevronRight,
  Shield,
  Home,
  Bell,
  Search,
  User,
  Gauge,
  AlertCircle,
  Activity
} from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import { useAuth } from './AuthContext';

const PERMISSION_LEVELS = {
  VIEWER: 1,
  EDITOR: 2,
  MANAGER: 3,
  ADMIN: 4
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, hasPermission, userPermission, hasMinPermissionLevel } = useAuth();

  // Handle scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-expand active sections
  useEffect(() => {
    navSections.forEach((section, idx) => {
      const hasActiveItem = section.items.some(item => 
        location.pathname === item.path || 
        (item.pathIncludes && item.pathIncludes.some(p => location.pathname.includes(p)))
      );
      if (hasActiveItem) {
        setExpandedSections(prev => ({ ...prev, [idx]: true }));
      }
    });
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const toggleSection = (idx) => {
    setExpandedSections(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Navigation structure with enhanced permissions
  const navSections = useMemo(() => {
    const sections = [
      {
        title: "Fuel Management",
        icon: Fuel,
        color: "emerald",
        items: [
          { 
            path: '/', 
            icon: Fuel, 
            label: 'Fuel Events',
            description: 'View all fuel events'
          },
          { 
            path: '/add-fuel', 
            icon: PlusCircle, 
            label: 'Add Fuel Event',
            description: 'Record new fuel event',
            minPermissionLevel: PERMISSION_LEVELS.MANAGER
          }
        ]
      },
      {
        title: "Fleet Operations",
        icon: Truck,
        color: "blue",
        items: [
          { 
            path: '/trucks', 
            icon: Truck, 
            label: 'Vehicle Fleet',
            description: 'Manage all vehicles',
            pathIncludes: ['/trucks/']
          },
          { 
            path: '/add-car', 
            icon: PlusCircle, 
            label: 'Add Vehicle',
            description: 'Register new vehicle',
            minPermissionLevel: PERMISSION_LEVELS.MANAGER
          },
          { 
            path: '/car-management', 
            icon: Settings, 
            label: 'Fleet Management',
            description: 'Advanced fleet controls'
          },
          { 
            path: '/map', 
            icon: Map, 
            label: 'Station Locator',
            description: 'Find PetroApp stations'
          },
          { 
  path: '/vehicle-status', 
  icon: Activity, 
  label: 'Vehicle Status',
  description: 'Monitor and update vehicle status'
}
        ]
      },
      {
  title: "Maintenance",
  icon: Gauge,
  color: "amber",
  items: [
    { 
      path: '/service-management', 
      icon: FileText, 
      label: 'Service Management',
      description: 'Vehicle service inspections',
      pathIncludes: ['/service-']
    },
    { 
      path: '/oil-changes-list', 
      icon: Droplet, 
      label: 'Oil Changes',
      description: 'Oil change records',
      pathIncludes: ['/oil-change', '/edit-oil-change/']
    },
    { 
      path: '/tires', 
      icon: Disc, 
      label: 'Tire Management',
      description: 'Track tire maintenance',
      pathIncludes: ['/tires/']
    },
    { 
      path: '/speed-violations', 
      icon: AlertCircle, 
      label: 'Speed Violations',
      description: 'Monitor speed infractions'
    }
  ]
},
      {
        title: "Trip Management",
        icon: Container,
        color: "purple",
        items: [
          { 
            path: '/trips-list', 
            icon: Container, 
            label: 'All Trips',
            description: 'View trip history',
            pathIncludes: ['/trip-details/']
          },
          { 
            path: '/add-trip', 
            icon: PlusCircle, 
            label: 'Register Trip',
            description: 'Log new trip'
          },
           { 
      path: '/trip-report-garage', 
      icon: FileText, 
      label: 'Garage Report',
      description: 'Generate company trip reports'
    },
          { 
            path: '/fees', 
            icon: DollarSign, 
            label: 'Fee Mappings',
            description: 'Configure trip fees',
            minPermissionLevel: PERMISSION_LEVELS.MANAGER
          }
        ]
      },
      {
        title: "Personnel",
        icon: Users,
        color: "cyan",
        items: [
          { 
            path: '/drivers', 
            icon: Users, 
            label: 'Driver Registry',
            description: 'Manage drivers',
            pathIncludes: ['/driver/']
          },
          { 
            path: '/add-driver', 
            icon: PlusCircle, 
            label: 'Add Driver',
            description: 'Register new driver',
            minPermissionLevel: PERMISSION_LEVELS.MANAGER
          }
        ]
      }
    ];

    // Add Vendor Finance section for managers
    if (hasMinPermissionLevel(PERMISSION_LEVELS.MANAGER)) {
      sections.push({
        title: "Vendor Finance",
        icon: Building,
        color: "rose",
        items: [
          { 
            path: '/finance-dashboard', 
            icon: BarChart4, 
            label: 'Financial Dashboard',
            description: 'Financial metrics and reports'
          },
          { 
            path: '/vendors', 
            icon: Building, 
            label: 'Vendor Directory',
            description: 'Manage vendors',
          },
          { 
            path: '/transactions', 
            icon: CreditCard, 
            label: 'Transactions',
            description: 'Financial transactions'
          },
          { 
            path: '/vendors/create', 
            icon: PlusCircle, 
            label: 'Add Vendor',
            description: 'Register new vendor'
          },
          { 
            path: '/reports', 
            icon: PieChart, 
            label: 'Financial Reports',
            description: 'Generate reports'
          }
        ]
      });
    }

    // Add System section for admins
    if (hasPermission('admin')) {
      sections.push({
        title: "System",
        icon: Shield,
        color: "slate",
        items: [
          {
            path: '/admin', 
            icon: Settings, 
            label: 'Admin Panel',
            description: 'System administration'
          },
          {
            path: '/user-management',
            icon: Users,
            label: 'User Management',
            description: 'Manage user accounts'
          },
          { 
            path: '/logs', 
            icon: FileText, 
            label: 'System Logs',
            description: 'View system activity',
            minPermissionLevel: PERMISSION_LEVELS.ADMIN
          }
        ]
      });
    }

    return sections;
  }, [hasMinPermissionLevel, hasPermission]);

  // Filter items based on permissions
  const filterNavItems = (items) => {
    return items.filter(item => {
      if (item.minPermissionLevel && !hasMinPermissionLevel(item.minPermissionLevel)) {
        return false;
      }
      return true;
    });
  };

  // Filter sections with items
  const filteredNavSections = navSections
    .map(section => ({
      ...section,
      items: filterNavItems(section.items)
    }))
    .filter(section => section.items.length > 0);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    
    const results = [];
    filteredNavSections.forEach(section => {
      section.items.forEach(item => {
        if (
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          results.push({ ...item, section: section.title });
        }
      });
    });
    
    return results;
  }, [searchQuery, filteredNavSections]);

  // Check if item is active
  const isItemActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.pathIncludes) {
      return item.pathIncludes.some(p => {
        if (p.startsWith('!')) {
          return !location.pathname.includes(p.slice(1));
        }
        return location.pathname.includes(p);
      });
    }
    return false;
  };

  // Get permission badge color
  const getPermissionBadge = () => {
    if (!userPermission) return null;
    
    const badges = {
      1: { label: 'Office', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      2: { label: 'Office', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      3: { label: 'Manager', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      4: { label: 'Admin', color: 'bg-red-100 text-red-700 border-red-200' }
    };
    
    return badges[userPermission] || badges[1];
  };

  const permissionBadge = getPermissionBadge();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Container className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Apex Fleet</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={toggleSidebar}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Search Results */}
          {searchQuery && searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg absolute left-4 right-4 z-10 max-h-64 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <Link
                  key={idx}
                  to={result.path}
                  onClick={() => {
                    setSearchQuery('');
                    setSidebarOpen(false);
                  }}
                  className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <result.icon size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{result.label}</p>
                      <p className="text-xs text-gray-500">{result.section}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNavSections.map((section, idx) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections[idx] !== false;
            const hasActiveItem = section.items.some(item => isItemActive(item));
            
            return (
              <div key={idx} className="space-y-1">
                <button
                  onClick={() => toggleSection(idx)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all
                    ${hasActiveItem ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg bg-${section.color}-100`}>
                      <SectionIcon size={16} className={`text-${section.color}-600`} />
                    </div>
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                  {isExpanded ? 
                    <ChevronDown size={16} className="text-gray-400" /> : 
                    <ChevronRight size={16} className="text-gray-400" />
                  }
                </button>
                
                {isExpanded && (
                  <div className="ml-4 space-y-1 mt-1">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = isItemActive(item);
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                          className={`
                            group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                            ${isActive 
                              ? 'bg-blue-50 text-blue-700 font-medium' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                          `}
                        >
                          <ItemIcon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                          <div className="flex-1">
                            <p className="text-sm">{item.label}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold shadow-md">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              </div>
              {permissionBadge && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${permissionBadge.color}`}>
                  {permissionBadge.label}
                </span>
              )}
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`
          bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between
          transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}
        `}>
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={toggleSidebar}
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            
            <Breadcrumbs />
          </div>
          
          <div className="flex items-center gap-3">
            {/* User Menu (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;