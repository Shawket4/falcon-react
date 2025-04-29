import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ExportToExcel from './ExportStatsToExcel';
import ExportToPdf from './ExportStatsToPdf';
import TripStatsByDate from './AnalyticsGraphByDate';
import apiClient from '../../apiClient';
import CarDataSection from './CarDataSection';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie,
  Line,
  ComposedChart,
  Area,
  AreaChart,
  Legend
} from 'recharts';

// Color palette for consistent styling
const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  indigo: '#6366F1',
  pink: '#EC4899',
  purple: '#8B5CF6',
  red: '#EF4444',
  orange: '#F97316',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  emerald: '#10B981',
  amber: '#F59E0B'
};

const COLOR_ARRAY = Object.values(COLORS);

// CollapsibleCard component preserved from the original mobile component
const CollapsibleCard = ({ 
  title, 
  children, 
  initiallyExpanded = false, 
  className = '',
  badge = null
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden mb-4 ${className}`}>
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {badge && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
              {badge}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>
      {isExpanded && (
        <div className="p-3 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

// MetricCard component preserved from the original mobile component
const MetricCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-3 rounded-lg shadow mb-2">
    <div className="flex items-center">
      <div className={`p-2 rounded-full ${color} mr-3`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs">{title}</p>
        <p className="text-gray-900 font-semibold text-base">{value}</p>
      </div>
    </div>
  </div>
);

// Tab button component
const TabButton = ({ active, label, icon, onClick }) => (
  <button
    className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
      active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    } mb-2 mr-2`}
    onClick={onClick}
  >
    <span className="mr-1">{icon}</span>
    <span>{label}</span>
  </button>
);

// Company tab component
const CompanyTab = ({ company, isActive, onClick }) => (
  <button
    className={`px-3 py-2 rounded-lg text-xs font-medium ${
      isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
    } mr-2 mb-2`}
    onClick={onClick}
  >
    {company}
  </button>
);

const MobileTripStatistics = ({ filters }) => {
  // Function to get the first day of current month
  const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  };

  // Function to get today's date
  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  // State declarations
  const [statistics, setStatistics] = useState([]);
  const [statsByDate, setStatsByDate] = useState([]);
  const [hasFinancialAccess, setHasFinancialAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCompany, setActiveCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'timeline', 'companies', 'details'
  const [carTotals, setCarTotals] = useState([]);
  // Initialize filters with default date range if not provided
  const [internalFilters, setInternalFilters] = useState({
    company: (filters && filters.company) || '',
    startDate: (filters && filters.startDate) || getFirstDayOfMonth(),
    endDate: (filters && filters.endDate) || getToday()
  });

  useEffect(() => {
    // Update internal filters when external filters change
    if (filters) {
      setInternalFilters(prevFilters => ({
        ...prevFilters,
        company: filters.company || prevFilters.company,
        startDate: filters.startDate || prevFilters.startDate,
        endDate: filters.endDate || prevFilters.endDate
      }));
    }
  }, [filters]);

  useEffect(() => {
    fetchStatistics();
  }, [internalFilters]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let url = `/api/trips/statistics`;
      let params = {};
      
      // Apply date filters if set
      if (internalFilters.startDate && internalFilters.endDate) {
        params = {
          ...params,
          start_date: internalFilters.startDate,
          end_date: internalFilters.endDate
        };
      }
      
      // Apply company filter if set
      if (internalFilters.company) {
        params = {
          ...params,
          company: internalFilters.company
        };
      }
      
      const response = await apiClient.get(url, { params });
      setStatistics(response.data.data || []);
      setStatsByDate(response.data.statsByDate || []);
      setHasFinancialAccess(response.data.hasFinancialAccess || false);
      
      // Set active company to first one if not already set
      if (response.data.data && response.data.data.length > 0 && !activeCompany) {
        setActiveCompany(response.data.data[0].company);
      }
      if (response.data.data) {
        const calculatedCarTotals = GetCarTotals(response.data.data);
        setCarTotals(calculatedCarTotals);
      }
    } catch (err) {
      setError('Failed to fetch statistics: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  const GetCarTotals = (statistics) => {
    // Create a map to aggregate data by car number plate
    const carTotalsMap = {};
    
    // Iterate through all statistics
    for (const statistic of statistics) {
      // Access the route details which contain car information
      if (statistic.route_details) {
        for (const routeDetail of statistic.route_details) {
          // Process each car in the route
          if (routeDetail.cars) {
            for (const car of routeDetail.cars) {
              // Check if we already have an entry for this car
              if (!carTotalsMap[car.car_no_plate]) {
                // If not, create a new CarTotal
                carTotalsMap[car.car_no_plate] = {
                  car_no_plate: car.car_no_plate,
                  liters: 0,
                  distance: 0,
                  base_revenue: 0,
                  vat: 0,
                  rent: 0
                };
              }
              
              // Aggregate the data
              carTotalsMap[car.car_no_plate].liters += car.total_volume || 0;
              carTotalsMap[car.car_no_plate].distance += car.total_distance || 0;
              carTotalsMap[car.car_no_plate].base_revenue += car.total_revenue || 0;
              
              // Add VAT if available
              if (car.vat) {
                carTotalsMap[car.car_no_plate].vat += car.vat;
              }
              
              // Add Rent/Car Rental if available
              if (car.car_rental) {
                carTotalsMap[car.car_no_plate].rent += car.car_rental;
              }
            }
          }
        }
      }
    }
    
    // Convert the map to an array and sort by revenue descending
    const result = Object.values(carTotalsMap);
    
    // Sort by total revenue (base_revenue + vat + rent) descending
    result.sort((a, b) => {
      const totalA = (a.base_revenue || 0) + (a.vat || 0) + (a.rent || 0);
      const totalB = (b.base_revenue || 0) + (b.vat || 0) + (b.rent || 0);
      return totalB - totalA;
    });
    
    return result;
  };

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(num);
  };

  // Calculate totals across all companies
  const calculateTotals = () => {
    const totals = statistics.reduce((acc, company) => {
      // Add total trips, volume, and distance
      acc.totalTrips += (company.total_trips || 0);
      acc.totalVolume += (company.total_volume || 0);
      acc.totalDistance += (company.total_distance || 0);
      
      // Add the base revenue
      acc.totalRevenue += (company.total_revenue || 0);
      
      // Add VAT if present
      acc.totalVAT += (company.total_vat || 0);
      
      // Add car rental if present
      acc.totalCarRent += (company.total_car_rent || 0);
      
      return acc;
    }, { 
      totalTrips: 0, 
      totalVolume: 0, 
      totalDistance: 0, 
      totalRevenue: 0,
      totalVAT: 0,
      totalCarRent: 0
    });
    
    // Calculate the total amount (sum of base revenue, VAT, and car rental)
    totals.totalAmount = totals.totalRevenue + totals.totalVAT + totals.totalCarRent;
    
    return totals;
  };

  // Calculate daily averages
  const calculateDailyAvgs = () => {
    const uniqueDates = new Set(statsByDate.map(day => day.date)).size;
    const days = uniqueDates || 1;
    const totals = calculateTotals();
    
    return {
      avgTripsPerDay: totals.totalTrips / days,
      avgVolumePerDay: totals.totalVolume / days,
      avgDistancePerDay: totals.totalDistance / days,
      avgRevenuePerDay: totals.totalAmount / days,
      days
    };
  };

  // Get data for company comparison chart
  const getCompanyComparison = () => {    
    return statistics.map(company => ({
      name: company.company,
      trips: company.total_trips || 0,
      volume: company.total_volume || 0,
      distance: company.total_distance || 0,
      revenue: hasFinancialAccess ? (company.total_revenue || 0) : 0,
      vat: hasFinancialAccess ? (company.total_vat || 0) : 0,
      carRental: hasFinancialAccess ? (company.total_car_rent || 0) : 0,
      totalAmount: hasFinancialAccess ? (company.total_amount || company.total_revenue || 0) : 0,
    }));
  };

  // Find the active company's data
  const getActiveCompanyData = () => {
    if (!activeCompany) return null;
    return statistics.find(company => company.company === activeCompany);
  };

  // Format company details for charts
  const getCompanyDetailsChartData = (company) => {
    if (!company || !company.details) return [];
    
    return company.details.map(detail => ({
      name: detail.group_name,
      trips: detail.total_trips || 0,
      volume: detail.total_volume || 0,
      distance: detail.total_distance || 0,
      revenue: hasFinancialAccess ? (detail.total_revenue || 0) : 0,
      normalizedRevenue: hasFinancialAccess ? ((detail.total_revenue || 0) / 1000) : 0,
      vat: hasFinancialAccess ? (detail.vat || 0) : 0,
      normalizedVAT: hasFinancialAccess ? ((detail.vat || 0) / 1000) : 0,
      carRental: hasFinancialAccess ? (detail.car_rental || 0) : 0,
      normalizedCarRental: hasFinancialAccess ? ((detail.car_rental || 0) / 1000) : 0,
      totalWithVAT: hasFinancialAccess ? (detail.total_with_vat || (detail.total_revenue + (detail.vat || 0) + (detail.car_rental || 0))) : 0,
      normalizedTotalWithVAT: hasFinancialAccess ? ((detail.total_with_vat || (detail.total_revenue + (detail.vat || 0) + (detail.car_rental || 0))) / 1000) : 0,
      fee: hasFinancialAccess ? (detail.fee || 0) : 0,
      distinctCars: detail.distinct_cars || 0,
      distinctDays: detail.distinct_days || 0,
      value: detail.total_trips || 0 // For pie chart
    }));
  };

  // Get time series data for charts
  const getDailyPatterns = () => {
    if (!statsByDate.length) return [];
    
    return statsByDate.map(day => {
      const date = new Date(day.date);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      return {
        date: formattedDate,
        trips: day.total_trips || 0,
        companies: day.company_details?.length || 1,
        revenue: hasFinancialAccess ? (day.total_revenue || 0) : 0
      };
    });
  };

  // Get top performing company by metric
  const getTopPerformer = (metric) => {
    if (!statistics.length) return null;
    
    const sorted = [...statistics].sort((a, b) => {
      if (metric === 'revenue' || metric === 'totalAmount') {
        const aValue = a.total_amount || a.total_revenue || 0;
        const bValue = b.total_amount || b.total_revenue || 0;
        return bValue - aValue;
      }
      return (b[`total_${metric}`] || 0) - (a[`total_${metric}`] || 0);
    });
    
    return sorted[0];
  };

  const totals = calculateTotals();
  const dailyAvgs = calculateDailyAvgs();
  const comparisonData = getCompanyComparison();
  const activeCompanyData = getActiveCompanyData();
  const detailsData = activeCompanyData ? getCompanyDetailsChartData(activeCompanyData) : [];
  const timeSeriesData = getDailyPatterns();

  // Custom tooltip formatter for charts
  const customTooltipFormatter = (value, name) => {
    if (name === 'revenue') return [`${formatCurrency(value)}`, 'Base Revenue'];
    if (name === 'totalAmount' || name === 'totalWithVAT') return [`${formatCurrency(value)}`, 'Total Amount'];
    if (name === 'vat') return [`${formatCurrency(value)}`, 'VAT (14%)'];
    if (name === 'carRental') return [`${formatCurrency(value)}`, 'Car Rental Fees'];
    
    if (name === 'distance') return [`${formatNumber(value)} km`, 'Distance'];
    if (name === 'volume') return [`${formatNumber(value)} L`, 'Volume'];
    if (name === 'trips') return [`${formatNumber(value)}`, 'Trips'];
    if (name === 'distinctCars') return [`${formatNumber(value)}`, 'Distinct Cars'];
    if (name === 'distinctDays') return [`${formatNumber(value)}`, 'Distinct Days'];
    if (name === 'companies') return [`${formatNumber(value)}`, 'Companies'];
    
    return [formatNumber(value), name];
  };

  // Determine if the active company has VAT
  const hasVAT = activeCompanyData && 
    (activeCompanyData.company === "Watanya" || activeCompanyData.company === "TAQA");
    
  // Determine if the active company has car rental fees
  const hasCarRental = activeCompanyData && activeCompanyData.company === "TAQA";

  // Tab definitions for navigation
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'companies', label: 'Companies' },
    { id: 'details', label: 'Company Details' },
    { id: 'routes', label: 'Route Analysis', icon: 'map' }, // New tab for route analysis
    { id: 'cars', label: 'Car Data', icon: 'truck' }
  ];

  return (
    <div className="container mx-auto px-3 py-4 space-y-4 max-w-full">
      {/* Error Handling */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3">
          <p className="text-red-700 text-xs">{error}</p>
        </div>
      )}
      
      {/* Permission notification */}
      {!hasFinancialAccess && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-yellow-700">
                Limited view: Financial data is hidden. Contact admin for access.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Dashboard Header with Filters Summary */}
      <div className="flex flex-col mb-4">
        <h1 className="text-xl font-bold text-gray-800">Trip Statistics Dashboard</h1>
        <p className="text-gray-500 text-xs">
          {internalFilters.startDate && internalFilters.endDate 
            ? `Data from ${new Date(internalFilters.startDate).toLocaleDateString()} to ${new Date(internalFilters.endDate).toLocaleDateString()}`
            : 'All time data'
          }
          {internalFilters.company ? ` • ${internalFilters.company}` : ' • All companies'}
        </p>
      </div>

      {/* Export to Excel/PDF */}
      {!isLoading && statistics.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <ExportToExcel 
            statistics={statistics} 
            hasFinancialAccess={hasFinancialAccess} 
            filters={internalFilters}
          />
          <ExportToPdf 
            statistics={statistics} 
            hasFinancialAccess={hasFinancialAccess} 
            filters={internalFilters}
          />
        </div>
      )}

      {/* Dashboard Tabs (Desktop Style) */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs flex items-center
                ${activeTab === tab.id ? 
                  'border-blue-500 text-blue-600' : 
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {tab.id === 'overview' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                )}
                {tab.id === 'timeline' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                )}
                {tab.id === 'companies' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                )}
                {tab.id === 'details' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                )}
                {tab.id === 'routes' && (
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
)}
 {tab.icon === 'truck' && (
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
)}
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        </div>
      )}

      {!isLoading && statistics.length > 0 && (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Overall Summary Cards */}
              <CollapsibleCard title="Overall Summary" initiallyExpanded={true}>
                <div className="grid grid-cols-2 gap-2">
                  <MetricCard 
                    title="Total Trips" 
                    value={formatNumber(totals.totalTrips)}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>}
                    color="bg-blue-100 text-blue-500"
                  />
                  
                  <MetricCard 
                    title="Total Volume" 
                    value={`${formatNumber(totals.totalVolume)} L`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>}
                    color="bg-green-100 text-green-500"
                  />
                  
                  <MetricCard 
                    title="Total Distance" 
                    value={`${formatNumber(totals.totalDistance)} km`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>}
                    color="bg-yellow-100 text-yellow-500"
                  />
                  
                  {hasFinancialAccess ? (
                    <MetricCard 
                      title="Total Revenue" 
                      value={formatCurrency(totals.totalAmount || totals.totalRevenue)}
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>}
                      color="bg-purple-100 text-purple-500"
                    />
                  ) : (
                    <div className="bg-gray-100 p-3 rounded-lg shadow">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-gray-200 text-gray-400 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Total Revenue</p>
                          <p className="text-gray-400 font-semibold text-base">Restricted</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Daily Averages */}
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-800 mb-1">Daily Averages:</p>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center">
                      <p className="text-gray-500">Trips</p>
                      <p className="font-medium">{formatNumber(dailyAvgs.avgTripsPerDay)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Volume</p>
                      <p className="font-medium">{formatNumber(dailyAvgs.avgVolumePerDay)} L</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Distance</p>
                      <p className="font-medium">{formatNumber(dailyAvgs.avgDistancePerDay)} km</p>
                    </div>
                  </div>
                </div>
              </CollapsibleCard>
              
              {/* Top Performers Cards */}
              <CollapsibleCard title="Top Performers" initiallyExpanded={false}>
                <div className="space-y-2">
                  <div className="border border-blue-100 rounded-lg p-3 bg-blue-50">
                    <h4 className="text-xs font-medium text-gray-700">Top by Trips</h4>
                    {getTopPerformer('trips') && (
                      <div className="mt-1 flex items-center">
                        <span className="text-sm font-bold text-blue-600 mr-2">
                          {getTopPerformer('trips').company}
                        </span>
                        <span className="text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-medium">
                          {formatNumber(getTopPerformer('trips').total_trips)} trips
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border border-green-100 rounded-lg p-3 bg-green-50">
                    <h4 className="text-xs font-medium text-gray-700">Top by Volume</h4>
                    {getTopPerformer('volume') && (
                      <div className="mt-1 flex items-center">
                        <span className="text-sm font-bold text-green-600 mr-2">
                          {getTopPerformer('volume').company}
                        </span>
                        <span className="text-green-800 bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium">
                          {formatNumber(getTopPerformer('volume').total_volume)} L
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {hasFinancialAccess && (
                    <div className="border border-purple-100 rounded-lg p-3 bg-purple-50">
                      <h4 className="text-xs font-medium text-gray-700">Top by Revenue</h4>
                      {getTopPerformer('revenue') && (
                        <div className="mt-1 flex items-center">
                          <span className="text-sm font-bold text-purple-600 mr-2">
                            {getTopPerformer('revenue').company}
                          </span>
                          <span className="text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full text-xs font-medium">
                            {formatCurrency(getTopPerformer('revenue').total_amount || getTopPerformer('revenue').total_revenue)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleCard>

              {/* Distribution Charts */}
              <CollapsibleCard title="Company Distribution" initiallyExpanded={false}>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Trips by Company</h4>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={comparisonData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={50}
                            fill={COLORS.blue}
                            dataKey="trips"
                          >
                            {comparisonData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLOR_ARRAY[index % COLOR_ARRAY.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name, props) => [`${formatNumber(value)} trips`, props.payload.name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {hasFinancialAccess && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-1">Revenue by Company</h4>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={comparisonData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={50}
                              fill={COLORS.purple}
                              dataKey="totalAmount"
                            >
                              {comparisonData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLOR_ARRAY[(index + 2) % COLOR_ARRAY.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name, props) => [formatCurrency(value), props.payload.name]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleCard>
            </div>
          )}
          
          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Use the desktop TripStatsByDate component */}
              <TripStatsByDate statsByDate={statsByDate} hasFinancialAccess={hasFinancialAccess} />
              
              {/* Additional Mobile-Friendly Charts */}
              <CollapsibleCard title="Daily Company Activity" initiallyExpanded={false}>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={timeSeriesData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} width={25} />
                      <Tooltip formatter={customTooltipFormatter} />
                      <Bar dataKey="companies" fill={COLORS.orange} name="Companies" />
                      <Line type="monotone" dataKey="trips" stroke={COLORS.blue} name="Trips" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CollapsibleCard>
            </div>
          )}
          
          {/* COMPANIES TAB */}
          {activeTab === 'companies' && (
            <div className="space-y-4">
              {/* Company Comparison */}
              <CollapsibleCard title="Company Comparison" initiallyExpanded={true}>
                <div className="space-y-4">
                  {hasFinancialAccess && (
                    <div className="h-64">
                      <h4 className="text-gray-700 text-xs font-medium mb-1">Revenue by Company</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={40} />
                          <Tooltip formatter={customTooltipFormatter} />
                          <Bar dataKey="revenue" name="Base Revenue" stackId="a" fill={COLORS.purple}>
                            {comparisonData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLOR_ARRAY[index % COLOR_ARRAY.length]} />
                            ))}
                          </Bar>
                          <Bar dataKey="vat" name="VAT (14%)" stackId="a" fill={COLORS.indigo} />
                          <Bar dataKey="carRental" name="Car Rental" stackId="a" fill={COLORS.teal} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  <div className="h-64">
                    <h4 className="text-gray-700 text-xs font-medium mb-1">Trips by Company</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} width={30} />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Bar dataKey="trips" fill={COLORS.blue} name="Trips">
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLOR_ARRAY[(index + 1) % COLOR_ARRAY.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CollapsibleCard>
              
              {/* Company Selection Cards */}
              <div className="mb-2">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Select a company for details:</h3>
                <div className="space-y-2">
                  {statistics.map((company, index) => (
                    <div 
                      key={index} 
                      className={`bg-white p-3 rounded-lg shadow-sm border cursor-pointer transition-all duration-200 ${
                        activeCompany === company.company ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                      }`}
                      onClick={() => {
                        setActiveCompany(company.company);
                        setActiveTab('details');
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-800">{company.company}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          {formatNumber(company.total_trips)} trips
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                        <div>
                          <span className="text-gray-500">Volume:</span>
                          <p className="font-medium">{formatNumber(company.total_volume)} L</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Distance:</span>
                          <p className="font-medium">{formatNumber(company.total_distance)} km</p>
                        </div>
                        {hasFinancialAccess && (
                          <div>
                            <span className="text-gray-500">Revenue:</span>
                            <p className="font-medium">{formatCurrency(company.total_amount || company.total_revenue)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* DETAILS TAB */}
          {activeTab === 'details' && activeCompanyData && (
            <div className="space-y-4">
              {/* Company Selection */}
              <div className="mb-2">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Company:</h3>
                <div className="flex flex-wrap">
                  {statistics.map((company, index) => (
                    <CompanyTab
                      key={index}
                      company={company.company}
                      isActive={activeCompany === company.company}
                      onClick={() => setActiveCompany(company.company)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Active Company Details */}
              <CollapsibleCard 
                title={`${activeCompanyData.company} Overview`} 
                initiallyExpanded={true}
                badge={`${formatNumber(activeCompanyData.total_trips)} trips`}
              >
                <div className="space-y-3">
                  {/* Company Stats */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Volume: {formatNumber(activeCompanyData.total_volume)} L
                    </span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      Distance: {formatNumber(activeCompanyData.total_distance)} km
                    </span>
                    {hasFinancialAccess && (
                      <>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          Revenue: {formatCurrency(activeCompanyData.total_revenue || 0)}
                        </span>
                        {hasVAT && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                            VAT: {formatCurrency(activeCompanyData.total_vat || 0)}
                          </span>
                        )}
                        {hasCarRental && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">
                            Car Rental: {formatCurrency(activeCompanyData.total_car_rent || 0)}
                          </span>
                        )}
                        {(activeCompanyData.total_vat > 0 || activeCompanyData.total_car_rent > 0) && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Total: {formatCurrency(activeCompanyData.total_revenue + (activeCompanyData.total_vat || 0) + (activeCompanyData.total_car_rent || 0))}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Trip Distribution Chart */}
                  {activeCompanyData.details && activeCompanyData.details.length > 0 && (
                    <div className="h-56 mt-3">
                      <h4 className="text-gray-700 text-xs font-medium mb-1">Trip Distribution</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={detailsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => {
                              const shortName = name.length > 8 ? `${name.substring(0, 8)}...` : name;
                              return `${shortName}: ${(percent * 100).toFixed(0)}%`;
                            }}
                            outerRadius={60}
                            fill={COLORS.blue}
                            dataKey="trips"
                          >
                            {detailsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLOR_ARRAY[index % COLOR_ARRAY.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={customTooltipFormatter} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </CollapsibleCard>
              
              {/* Details Cards */}
              {activeCompanyData.details && activeCompanyData.details.length > 0 ? (
                <CollapsibleCard title="Group Details" initiallyExpanded={false}>
                  {detailsData.map((detail, index) => (
                    <CollapsibleCard
                      key={index}
                      title={detail.name}
                      initiallyExpanded={false}
                      badge={`${formatNumber(detail.trips)} trips`}
                      className="border border-gray-100 mb-2"
                    >
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-100 rounded p-2">
                            <p className="text-xs text-gray-500">Volume</p>
                            <p className="text-sm font-medium">{formatNumber(detail.volume)} L</p>
                          </div>
                          <div className="bg-gray-100 rounded p-2">
                            <p className="text-xs text-gray-500">Distance</p>
                            <p className="text-sm font-medium">{formatNumber(detail.distance)} km</p>
                          </div>
                          {hasFinancialAccess && (
                            <>
                              <div className="bg-gray-100 rounded p-2">
                                <p className="text-xs text-gray-500">Revenue</p>
                                <p className="text-sm font-medium">{formatCurrency(detail.revenue)}</p>
                              </div>
                              {hasVAT && (
                                <div className="bg-gray-100 rounded p-2">
                                  <p className="text-xs text-gray-500">VAT (14%)</p>
                                  <p className="text-sm font-medium">{formatCurrency(detail.vat || 0)}</p>
                                </div>
                              )}
                              {hasCarRental && (
                                <>
                                  <div className="bg-gray-100 rounded p-2">
                                    <p className="text-xs text-gray-500">Cars</p>
                                    <p className="text-sm font-medium">{formatNumber(detail.distinctCars || 0)}</p>
                                  </div>
                                  <div className="bg-gray-100 rounded p-2">
                                    <p className="text-xs text-gray-500">Car Rental</p>
                                    <p className="text-sm font-medium">{formatCurrency(detail.carRental || 0)}</p>
                                  </div>
                                </>
                              )}
                              {(hasVAT || hasCarRental) && (
                                <div className="bg-gray-100 rounded p-2 col-span-2">
                                  <p className="text-xs text-gray-500">Total Amount</p>
                                  <p className="text-sm font-medium">{formatCurrency(detail.totalWithVAT || (detail.revenue + (detail.vat || 0) + (detail.carRental || 0)))}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CollapsibleCard>
                  ))}
                </CollapsibleCard>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-gray-500 text-xs">No detailed data available for this company.</p>
                </div>
              )}
              
              {/* Financial Breakdown Chart */}
              {hasFinancialAccess && activeCompanyData.details && activeCompanyData.details.length > 0 && (
                <CollapsibleCard title="Financial Breakdown" initiallyExpanded={false}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={detailsData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} width={40} />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Bar dataKey="revenue" name="Base Revenue" stackId="a" fill={COLORS.green} />
                        {hasVAT && <Bar dataKey="vat" name="VAT (14%)" stackId="a" fill={COLORS.indigo} />}
                        {hasCarRental && <Bar dataKey="carRental" name="Car Rental" stackId="a" fill={COLORS.teal} />}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CollapsibleCard>
              )}
            </div>
          
            
          
          )}
          {activeTab === 'routes' && (
  <div className="space-y-4">
    {/* Company Selection for Routes */}
    <div className="mb-2">
      <h3 className="text-xs font-medium text-gray-700 mb-2">Select company for route analysis:</h3>
      <div className="flex flex-wrap">
        {statistics.map((company, index) => (
          <CompanyTab
            key={index}
            company={company.company}
            isActive={activeCompany === company.company}
            onClick={() => setActiveCompany(company.company)}
          />
        ))}
      </div>
    </div>
    
    {activeCompanyData && activeCompanyData.route_details && activeCompanyData.route_details.length > 0 ? (
      <>
        {/* Route Distribution Card */}
        <CollapsibleCard title="Route Distribution" initiallyExpanded={true}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeCompanyData.route_details}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => {
                    const shortName = name && name.length > 8 ? `${name.substring(0, 8)}...` : name;
                    return `${shortName}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={60}
                  fill={COLORS.blue}
                  dataKey="total_trips"
                >
                  {activeCompanyData.route_details.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLOR_ARRAY[index % COLOR_ARRAY.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${formatNumber(value)} trips`, 
                    props.payload.route_name || 'Unknown'
                  ]} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CollapsibleCard>
        
        {/* Route Revenue Card */}
        {hasFinancialAccess && (
          <CollapsibleCard title="Route Revenue" initiallyExpanded={false}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeCompanyData.route_details} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="route_name" angle={-45} textAnchor="end" height={50} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={40} />
                  <Tooltip formatter={customTooltipFormatter} />
                  <Bar dataKey="total_revenue" name="Base Revenue" stackId="a" fill={COLORS.green} />
                  <Bar dataKey="vat" name="VAT (14%)" stackId="a" fill={COLORS.indigo} />
                  <Bar dataKey="car_rental" name="Car Rental" stackId="a" fill={COLORS.teal} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CollapsibleCard>
        )}
        
        {/* Routes List */}
        <CollapsibleCard title={`${activeCompanyData.company} Routes`} initiallyExpanded={true}>
          {activeCompanyData.route_details.map((route, index) => (
            <CollapsibleCard
              key={index}
              title={route.route_name}
              initiallyExpanded={false}
              badge={`${formatNumber(route.total_trips)} trips`}
              className="border border-gray-100 mb-2"
            >
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-100 rounded p-2">
                    <p className="text-xs text-gray-500">Volume</p>
                    <p className="text-sm font-medium">{formatNumber(route.total_volume)} L</p>
                  </div>
                  <div className="bg-gray-100 rounded p-2">
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="text-sm font-medium">{formatNumber(route.total_distance)} km</p>
                  </div>
                  {hasFinancialAccess && (
                    <>
                      <div className="bg-gray-100 rounded p-2">
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className="text-sm font-medium">{formatCurrency(route.total_revenue)}</p>
                      </div>
                      {'vat' in route && route.vat > 0 && (
                        <div className="bg-gray-100 rounded p-2">
                          <p className="text-xs text-gray-500">VAT (14%)</p>
                          <p className="text-sm font-medium">{formatCurrency(route.vat || 0)}</p>
                        </div>
                      )}
                      {'car_rental' in route && route.car_rental > 0 && (
                        <div className="bg-gray-100 rounded p-2">
                          <p className="text-xs text-gray-500">Car Rental</p>
                          <p className="text-sm font-medium">{formatCurrency(route.car_rental || 0)}</p>
                        </div>
                      )}
                      {('vat' in route || 'car_rental' in route) && (
                        <div className="bg-gray-100 rounded p-2 col-span-2">
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="text-sm font-medium">{formatCurrency(route.total_with_vat || (route.total_revenue + (route.vat || 0) + (route.car_rental || 0)))}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Cars section */}
                {route.cars && route.cars.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Cars ({route.cars.length})</h5>
                    <div className="max-h-48 overflow-y-auto">
                      {route.cars.map((car, carIdx) => (
                        <div key={carIdx} className={`p-2 text-xs ${carIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100`}>
                          <div className="font-semibold">{car.car_no_plate}</div>
                          <div className="grid grid-cols-3 gap-1 mt-1">
                            <div>
                              <span className="text-gray-500">Trips:</span> {formatNumber(car.total_trips)}
                            </div>
                            <div>
                              <span className="text-gray-500">Days:</span> {formatNumber(car.working_days)}
                            </div>
                            {hasFinancialAccess && (
                              <div>
                                <span className="text-gray-500">Rev:</span> {formatCurrency(car.total_revenue)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          ))}
        </CollapsibleCard>
      </>
    ) : (
      <div className="text-center p-4 bg-gray-50 rounded">
        <p className="text-gray-500 text-xs">
          {activeCompanyData 
            ? "No route data available for this company." 
            : "Please select a company to view route analysis."}
        </p>
      </div>
    )}
  </div>
)}
{activeTab === 'cars' && (
  <div className="space-y-6">
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h4 className="text-gray-700 text-sm font-medium mb-4">Car Performance Analysis</h4>
      <p className="text-gray-500 text-sm">
        This section displays the aggregated performance data for all cars across all routes and companies.
      </p>
    </div>

    <CarDataSection 
      carTotals={carTotals}
      hasFinancialAccess={hasFinancialAccess}
      formatNumber={formatNumber}
      formatCurrency={formatCurrency}
    />
  </div>
)}
        </>
      )}
      
      {/* No Data State */}
      {!isLoading && statistics.length === 0 && (
        <div className="bg-gray-50 p-4 text-center rounded-lg">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-xs font-medium text-gray-900">No statistics available</h3>
          <p className="mt-1 text-xs text-gray-500">
            Try changing your filter options.
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileTripStatistics;