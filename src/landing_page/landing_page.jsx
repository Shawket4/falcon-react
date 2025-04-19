import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Phone, Mail, BarChart2, Truck, Droplet, Clock, DollarSign, Users, Check, LogIn } from 'lucide-react';

const LandingPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mobile menu close on navigation
  const handleNavClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:shawket.4@icloud.com';
  };

  const handlePhoneClick = () => {
    window.location.href = 'tel:+201061856523';
  };
  
  const handleLoginClick = () => {
    window.location.href = '/login';
  };
  
  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };
  
  const closeImageModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto'; // Restore scrolling
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Optimized animation keyframes */}
      <style jsx global>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeLeft {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeRight {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fadeDown {
          animation: fadeDown 0.3s ease-out;
        }
        
        .animate-fadeUp {
          animation: fadeUp 0.3s ease-out;
        }
        
        .animate-fadeLeft {
          animation: fadeLeft 0.3s ease-out;
        }
        
        .animate-fadeRight {
          animation: fadeRight 0.3s ease-out;
        }

        /* Optimize mobile tap targets */
        @media (max-width: 768px) {
          button, a {
            min-height: 44px;
            min-width: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          
          /* Improve mobile spacing */
          section {
            padding-top: 4rem;
            padding-bottom: 4rem;
          }
          
          /* Improve readability on mobile */
          p {
            font-size: 1rem;
            line-height: 1.6;
          }
        }
      `}</style>
      
      {/* Navigation - Optimized for mobile with login button */}
      <nav className={`fixed w-full z-50 transition-all duration-200 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-3'}`}>
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex items-center transform hover:scale-105 transition-transform duration-200">
                <div className="bg-blue-600 text-white p-2 rounded-lg mr-2">
                  <Truck size={24} />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  Apex Fleet
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="font-medium hover:text-blue-600 transition-colors relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#dashboard" className="font-medium hover:text-blue-600 transition-colors relative group">
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#screenshots" className="font-medium hover:text-blue-600 transition-colors relative group">
                Screenshots
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#modules" className="font-medium hover:text-blue-600 transition-colors relative group">
                Modules
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#contact" className="font-medium hover:text-blue-600 transition-colors relative group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={handlePhoneClick} className="flex items-center px-4 py-2 rounded-md text-blue-600 border border-blue-600 hover:bg-blue-50 transition-all duration-200 hover:shadow-md">
                <Phone size={16} className="mr-2" /> Contact
              </button>
              <button onClick={handleLoginClick} className="flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 hover:shadow-md">
                <LogIn size={16} className="mr-2" /> Login
              </button>
            </div>
            
            {/* Mobile Navigation Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 focus:outline-none"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu - Improved animations */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg py-4 px-6 absolute top-full left-0 right-0 animate-fadeDown">
            <div className="flex flex-col space-y-4">
              <a href="#features" onClick={handleNavClick} className="font-medium hover:text-blue-600 transition-colors py-2">Features</a>
              <a href="#dashboard" onClick={handleNavClick} className="font-medium hover:text-blue-600 transition-colors py-2">Dashboard</a>
              <a href="#screenshots" onClick={handleNavClick} className="font-medium hover:text-blue-600 transition-colors py-2">Screenshots</a>
              <a href="#modules" onClick={handleNavClick} className="font-medium hover:text-blue-600 transition-colors py-2">Modules</a>
              <a href="#contact" onClick={handleNavClick} className="font-medium hover:text-blue-600 transition-colors py-2">Contact</a>
              <button onClick={handlePhoneClick} className="w-full flex items-center justify-center px-4 py-3 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors mt-2">
                <Phone size={16} className="mr-2" /> Contact
              </button>
              <button onClick={handleLoginClick} className="w-full flex items-center justify-center px-4 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors mt-2">
                <LogIn size={16} className="mr-2" /> Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Improved mobile responsiveness */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block">Manage Your Fleet</span>
                <span className="text-blue-600">Effortlessly</span>
              </h1>
              <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-600 max-w-lg">
                A comprehensive fleet management solution that helps track fuel consumption, manage trips, and monitor drivers - all in one platform.
              </p>
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4">
                <a href="#contact" className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center justify-center">
                  Contact Us <ChevronRight className="ml-2" size={18} />
                </a>
                <button onClick={handleLoginClick} className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium transition-colors flex items-center justify-center">
                  Login <LogIn className="ml-2" size={18} />
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 mt-10 lg:mt-0">
              <div className="relative">
                <div className="bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl md:rounded-2xl w-full h-64 md:h-80 lg:h-96 opacity-10 absolute -right-4 top-4"></div>
                {/* Fixed image container using same approach as gallery images */}
                <div className="bg-white shadow-xl rounded-xl md:rounded-2xl w-full h-64 md:h-80 lg:h-96 relative z-10 overflow-hidden">
                  <div 
                    className="relative group cursor-pointer h-full w-full"
                    onClick={() => openImageModal("/screenshots/1.png")}
                  >
                    <img 
                      src="/screenshots/1.png" 
                      alt="Apex Fleet Dashboard - Add Fuel Event" 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Click to Enlarge</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile optimized */}
      <section id="features" className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              Comprehensive Fleet Management
            </h2>
            <p className="mt-3 md:mt-4 text-lg md:text-xl text-gray-600">
              Everything you need to efficiently manage your entire fleet operation
            </p>
          </div>
          
          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Fuel Management",
                description: "Track fuel consumption, record fuel events, and analyze efficiency across your entire fleet.",
                icon: <Droplet className="text-blue-600" size={40} />
              },
              {
                title: "Trip Management",
                description: "Create and monitor trips, track distances, and manage associated costs for each vehicle.",
                icon: <Truck className="text-blue-600" size={40} />
              },
              {
                title: "Driver Management",
                description: "Keep detailed driver records including license information, contact details, and performance.",
                icon: <Users className="text-blue-600" size={40} />
              },
              {
                title: "Advanced Analytics",
                description: "Visualize fuel consumption trends, cost analytics, and trip statistics with interactive charts.",
                icon: <BarChart2 className="text-blue-600" size={40} />
              },
              {
                title: "Vendor Finance",
                description: "Manage vendor relationships, track transactions, and monitor financial activities.",
                icon: <DollarSign className="text-blue-600" size={40} />
              },
              {
                title: "Real-time Monitoring",
                description: "Get up-to-date information on vehicle status, maintenance needs, and driver activities.",
                icon: <Clock className="text-blue-600" size={40} />
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-50 hover:bg-blue-50 transition-all duration-300 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transform hover:translate-y-[-4px]"
              >
                <div className="mb-3 md:mb-4">{feature.icon}</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section - Mobile optimized */}
      <section id="dashboard" className="py-16 md:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              Intuitive Dashboards & Analytics
            </h2>
            <p className="mt-3 md:mt-4 text-lg md:text-xl text-gray-600">
              Make data-driven decisions with our comprehensive reporting and analytics tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
              <div className="p-3 md:p-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold">
                Fuel Statistics Dashboard
              </div>
              <div 
                className="relative group cursor-pointer p-2" 
                onClick={() => openImageModal("/screenshots/3.png")}
              >
                <img 
                  src="/screenshots/3.png" 
                  alt="Fuel Statistics Dashboard" 
                  className="w-full h-auto rounded"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200 rounded"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Click to Enlarge</div>
                </div>
              </div>
              <div className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-2">Fuel Consumption Analytics</h3>
                <p className="text-gray-600">
                  Track total fuel consumption, average efficiency, costs, and daily usage with interactive time-series visualizations.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
              <div className="p-3 md:p-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold">
                Trip Statistics Dashboard
              </div>
              <div 
                className="relative group cursor-pointer p-2" 
                onClick={() => openImageModal("/screenshots/8.png")}
              >
                <img 
                  src="/screenshots/8.png" 
                  alt="Trip Statistics Dashboard" 
                  className="w-full h-auto rounded"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200 rounded"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Click to Enlarge</div>
                </div>
              </div>
              <div className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-2">Trip Management & Analytics</h3>
                <p className="text-gray-600">
                  Analyze trip data, distance covered, revenue trends, and company distribution with detailed visualizations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Gallery - Mobile optimized */}
      <section id="screenshots" className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Apex Fleet Screenshots
            </h2>
            <p className="mt-3 md:mt-4 text-lg md:text-xl text-gray-600">
              Explore the powerful features of our fleet management system
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 1, name: "Add Fuel Event", description: "Record new fuel events with vehicle and driver details", image: "/screenshots/1.png" },
              { id: 2, name: "Fuel Event Details", description: "View comprehensive fuel event information", image: "/screenshots/2.png" },
              { id: 3, name: "Fuel Events Dashboard", description: "Analyze fuel consumption and costs", image: "/screenshots/3.png" },
              { id: 4, name: "Truck Details", description: "Track vehicle information and tire management", image: "/screenshots/4.png" },
              { id: 5, name: "Oil Change Management", description: "Monitor maintenance schedules and history", image: "/screenshots/5.png" },
              { id: 6, name: "Trip Management", description: "Track trips, distances, and associated costs", image: "/screenshots/6.png" },
              { id: 7, name: "Revenue Analytics", description: "Visualize revenue trends and projections", image: "/screenshots/7.png" },
              { id: 8, name: "Trip Statistics Dashboard", description: "Comprehensive trip data analysis", image: "/screenshots/8.png" },
              { id: 9, name: "Company Analysis", description: "Distribution of trips, volume, and revenue by company", image: "/screenshots/9.png" },
              { id: 10, name: "Driver Details", description: "Driver contact information and document tracking", image: "/screenshots/10.png" },
              { id: 11, name: "Driver Loans", description: "Manage driver finances and loan history", image: "/screenshots/11.png" },
              { id: 12, name: "Loan Statistics", description: "Analyze loan distributions and trends", image: "/screenshots/12.png" },
              { id: 13, name: "Loan Analytics", description: "Time series analysis of loan amounts", image: "/screenshots/13.png" },
              { id: 14, name: "Financial Dashboard", description: "Overview of vendor transactions and financial activity", image: "/screenshots/14.png" },
              { id: 15, name: "Vendor Management", description: "Track vendor information and contacts", image: "/screenshots/15.png" },
              { id: 16, name: "Vendor Details", description: "Detailed vendor balances and transaction history", image: "/screenshots/16.png" },
              { id: 17, name: "Add Fuel Event Form", description: "Easy-to-use form for recording fuel events", image: "/screenshots/17.png" },
              { id: 18, name: "Add Trip Form", description: "Streamlined interface for creating new trips", image: "/screenshots/18.png" }
            ].map((screenshot) => (
              <div key={screenshot.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => openImageModal(screenshot.image)}
                >
                  <img 
                    src={screenshot.image}
                    alt={screenshot.name} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Click to Enlarge</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-blue-600">{screenshot.name}</h3>
                  <p className="text-gray-600 text-sm">{screenshot.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 md:mt-10 text-center">
            <a href="#modules" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 transform hover:translate-y-[-2px] hover:shadow-lg">
              Explore Modules
            </a>
          </div>
        </div>
      </section>
      
      {/* Modules Section - Mobile optimized */}
      <section id="modules" className="py-16 md:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              Powerful Modules
            </h2>
            <p className="mt-3 md:mt-4 text-lg md:text-xl text-gray-600">
              Our comprehensive suite of management tools for complete fleet operations
            </p>
          </div>
          
          <div className="mt-12 md:mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20 items-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 md:p-8 rounded-xl shadow-lg md:col-span-1 transform transition-all duration-300 hover:shadow-xl hover:scale-105">
                <h3 className="text-xl md:text-2xl font-bold mb-4">Fuel Management</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Track fuel events and consumption</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Monitor fuel efficiency (km/L)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Record odometer readings</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Calculate fuel costs and statistics</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg md:col-span-2 transform transition-all duration-300 hover:shadow-xl">
                <div 
                  className="relative group cursor-pointer" 
                  onClick={() => openImageModal("/screenshots/1.png")}
                >
                  <img 
                    src="/screenshots/1.png" 
                    alt="Fuel Module Interface" 
                    className="w-full h-auto rounded shadow-sm mb-4"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200 rounded flex items-center justify-center">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100">Click to Enlarge</div>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-blue-600">Add and Track Fuel Events</h4>
                <p className="text-gray-600">
                  Easily record fuel events with detailed information including vehicle, driver, fuel amount, cost, and odometer readings.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 my-16 md:my-20 items-center">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg md:col-span-2 order-2 md:order-1 transform transition-all duration-300 hover:shadow-xl">
                <div 
                  className="relative group cursor-pointer" 
                  onClick={() => openImageModal("/screenshots/6.png")}
                >
                  <img 
                    src="/screenshots/6.png" 
                    alt="Trip Module Interface" 
                    className="w-full h-auto rounded shadow-sm mb-4"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200 rounded flex items-center justify-center">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100">Click to Enlarge</div>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-blue-600">Comprehensive Trip Management</h4>
                <p className="text-gray-600">
                  Create, track, and analyze trips with detailed data on routes, distances, drivers, and associated costs.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 md:p-8 rounded-xl shadow-lg md:col-span-1 order-1 md:order-2 transform transition-all duration-300 hover:shadow-xl hover:scale-105">
                <h3 className="text-xl md:text-2xl font-bold mb-4">Trip Management</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Record trip details and routes</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Track distances and terminals</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Manage trip costs and fees</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Generate trip statistics and reports</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 my-16 md:my-20 items-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 md:p-8 rounded-xl shadow-lg md:col-span-1 transform transition-all duration-300 hover:shadow-xl hover:scale-105">
                <h3 className="text-xl md:text-2xl font-bold mb-4">Driver Management</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Maintain driver profiles and contacts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Track licenses and documents</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Manage driver loans and finances</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Monitor document expiration dates</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg md:col-span-2 transform transition-all duration-300 hover:shadow-xl">
                <div 
                  className="relative group cursor-pointer" 
                  onClick={() => openImageModal("/screenshots/10.png")}
                >
                  <img 
                    src="/screenshots/10.png" 
                    alt="Driver Module Interface" 
                    className="w-full h-auto rounded shadow-sm mb-4"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200 rounded flex items-center justify-center">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100">Click to Enlarge</div>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-blue-600">Complete Driver Records</h4>
                <p className="text-gray-600">
                  Maintain detailed driver information including contact details, document status, and financial records.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16 md:mt-20 items-center">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg md:col-span-2 order-2 md:order-1 transform transition-all duration-300 hover:shadow-xl">
                <div 
                  className="relative group cursor-pointer" 
                  onClick={() => openImageModal("/screenshots/14.png")}
                >
                  <img 
                    src="/screenshots/14.png" 
                    alt="Financial Module Interface" 
                    className="w-full h-auto rounded shadow-sm mb-4"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200 rounded flex items-center justify-center">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100">Click to Enlarge</div>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-blue-600">Vendor Financial Management</h4>
                <p className="text-gray-600">
                  Track vendor transactions, monitor financial activities, and manage vendor relationships with detailed analytics.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 md:p-8 rounded-xl shadow-lg md:col-span-1 order-1 md:order-2 transform transition-all duration-300 hover:shadow-xl hover:scale-105">
                <h3 className="text-xl md:text-2xl font-bold mb-4">Financial Dashboard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Track purchases and payments</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Monitor vendor balances</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Analyze transaction trends</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Generate financial reports</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Mobile optimized */}
      <section id="contact" className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-400 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full"></div>
          <div className="absolute top-1/3 -right-24 w-80 h-80 bg-white opacity-10 rounded-full"></div>
          <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-white opacity-10 rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold animate-fadeDown">
              Ready to Optimize Your Fleet Management?
            </h2>
            <p className="mt-3 md:mt-4 text-lg text-blue-100">
              Contact us today to learn more about Apex Fleet
            </p>
            
            <div className="mt-10 md:mt-12 bg-white text-gray-800 rounded-xl p-6 md:p-8 shadow-xl transform transition-all duration-300 hover:shadow-2xl animate-fadeUp">
              <div className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 mb-6 md:mb-8">Contact Information</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div 
                  onClick={handleEmailClick}
                  className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-200 transform hover:translate-y-[-2px] hover:shadow-md"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-3 rounded-full mr-4 text-white">
                    <Mail size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium break-all">shawket.4@icloud.com</div>
                  </div>
                </div>
                
                <div 
                  onClick={handlePhoneClick}
                  className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-200 transform hover:translate-y-[-2px] hover:shadow-md"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-3 rounded-full mr-4 text-white">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">+201061856523</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-8 text-gray-600 text-center">
                Click on the email or phone to reach out to us directly.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Mobile optimized */}
      <footer className="bg-gray-900 text-gray-400 py-10 md:py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-8 md:mb-0">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-2">
                <Truck size={24} />
              </div>
              <div className="text-2xl font-bold text-white">
                Apex Fleet
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:flex-row gap-6 md:gap-8">
              <a href="#features" className="hover:text-white transition-colors py-1">Features</a>
              <a href="#dashboard" className="hover:text-white transition-colors py-1">Dashboard</a>
              <a href="#modules" className="hover:text-white transition-colors py-1">Modules</a>
              <a href="#contact" className="hover:text-white transition-colors py-1">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2025 Apex Fleet. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Improved Image Modal - Larger with less opacity */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-3 md:p-4 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full animate-fadeDown"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute -top-16 right-0 text-white p-2 hover:text-blue-300 transition-colors focus:outline-none bg-blue-600 bg-opacity-70 rounded-full"
              onClick={closeImageModal}
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <div className="bg-white p-3 rounded-lg shadow-2xl overflow-hidden">
              <img 
                src={selectedImage} 
                alt="Enlarged screenshot" 
                className="w-full h-auto object-contain max-h-[85vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;