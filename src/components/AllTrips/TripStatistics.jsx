import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';
import ExportToExcel from './ExportStatsToExcel';
import ExportToPDF from './ExportStatsToPdf';
import TripStatsByDate from './AnalyticsGraphByDate';
import RouteDetailsSection from './RouteDetailsSection';
import CarDataSection from './CarDataSection';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie,
  Line,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';

// Color palette
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

const TripStatistics = ({ filters }) => {
  const [statistics, setStatistics] = useState([]);
  const [statsByDate, setStatsByDate] = useState([]);
  const [hasFinancialAccess, setHasFinancialAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCompany, setActiveCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [carTotals, setCarTotals] = useState([]);

  useEffect(() => {
    fetchStatistics();
  }, [filters]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let url = `/api/trips/statistics`;
      let params = {};
      
      if (filters.startDate && filters.endDate) {
        params = {
          ...params,
          start_date: filters.startDate,
          end_date: filters.endDate
        };
      }
      
      if (filters.company) {
        params = {
          ...params,
          company: filters.company
        };
      }
      
      const response = await apiClient.get(url, { params });
      setStatistics(response.data.data || []);
      setStatsByDate(response.data.statsByDate || []);
      setHasFinancialAccess(response.data.hasFinancialAccess || false);
      
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

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  const GetCarTotals = (statistics) => {
    const carTotalsMap = {};
    
    for (const statistic of statistics) {
      if (statistic.route_details) {
        for (const routeDetail of statistic.route_details) {
          if (routeDetail.cars) {
            for (const car of routeDetail.cars) {
              if (!carTotalsMap[car.car_no_plate]) {
                carTotalsMap[car.car_no_plate] = {
                  car_no_plate: car.car_no_plate,
                  liters: 0,
                  distance: 0,
                  base_revenue: 0,
                  vat: 0,
                  rent: 0
                };
              }
              
              carTotalsMap[car.car_no_plate].liters += car.total_volume || 0;
              carTotalsMap[car.car_no_plate].distance += car.total_distance || 0;
              carTotalsMap[car.car_no_plate].base_revenue += car.total_revenue || 0;
              
              if (car.vat) {
                carTotalsMap[car.car_no_plate].vat += car.vat;
              }
              
              if (car.car_rental) {
                carTotalsMap[car.car_no_plate].rent += car.car_rental;
              }
            }
          }
        }
      }
    }
    
    const result = Object.values(carTotalsMap);
    
    result.sort((a, b) => {
      const totalA = (a.base_revenue || 0) + (a.vat || 0) + (a.rent || 0);
      const totalB = (b.base_revenue || 0) + (b.vat || 0) + (b.rent || 0);
      return totalB - totalA;
    });
    
    return result;
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(num);
  };

  const calculateTotals = () => {
    const totals = statistics.reduce((acc, company) => {
      acc.totalTrips += (company.total_trips || 0);
      acc.totalVolume += (company.total_volume || 0);
      acc.totalDistance += (company.total_distance || 0);
      acc.totalRevenue += (company.total_revenue || 0);
      acc.totalVAT += (company.total_vat || 0);
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
    
    totals.totalAmount = totals.totalRevenue + totals.totalVAT + totals.totalCarRent;
    
    return totals;
  };

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

  const getActiveCompanyData = () => {
    if (!activeCompany) return null;
    return statistics.find(company => company.company === activeCompany);
  };

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
      value: detail.total_trips || 0
    }));
  };

  const totals = calculateTotals();
  const dailyAvgs = calculateDailyAvgs();
  const comparisonData = getCompanyComparison();
  const activeCompanyData = getActiveCompanyData();
  const detailsData = activeCompanyData ? getCompanyDetailsChartData(activeCompanyData) : [];

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
    if (name === 'workingDays') return [`${formatNumber(value)}`, 'Working Days'];
    
    return [formatNumber(value), name];
  };

  const hasVAT = activeCompanyData && 
    (activeCompanyData.company === "Watanya" || activeCompanyData.company === "TAQA" || activeCompanyData.company === "Petromin");
    
  const hasCarRental = activeCompanyData && (activeCompanyData.company === "TAQA" || activeCompanyData.company === "Petromin");

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'chart-pie' },
    { id: 'timeline', label: 'Timeline', icon: 'chart-line' },
    { id: 'companies', label: 'Companies', icon: 'building-office' },
    { id: 'details', label: 'Company Details', icon: 'clipboard-document-list' },
    { id: 'routes', label: 'Route Analysis', icon: 'map' },
    { id: 'cars', label: 'Car Data', icon: 'truck' }
  ];

  function getWeeklyData() {
    if (!statsByDate.length) return [];
    
    const weekData = {};
    
    statsByDate.forEach(day => {
      const date = new Date(day.date);
      const weekNumber = getWeekNumber(date);
      const weekKey = `Week ${weekNumber}`;
      
      if (!weekData[weekKey]) {
        weekData[weekKey] = {
          week: weekKey,
          trips: 0,
          volume: 0,
          distance: 0,
          revenue: 0
        };
      }
      
      weekData[weekKey].trips += day.total_trips || 0;
      weekData[weekKey].volume += day.total_volume || 0;
      weekData[weekKey].distance += day.total_distance || 0;
      weekData[weekKey].revenue += day.total_revenue || 0;
    });
    
    return Object.values(weekData);
  }
  
  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  
  function getDailyPatterns() {
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
        companies: day.company_details?.length || 0
      };
    });
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {!hasFinancialAccess && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Limited view: Financial data (revenue and fees) is hidden. Contact your administrator for access.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trip Statistics Dashboard</h1>
          <p className="text-gray-500 text-sm">
            {filters.startDate && filters.endDate 
              ? `Data from ${new Date(filters.startDate).toLocaleDateString()} to ${new Date(filters.endDate).toLocaleDateString()}`
              : 'All time data'
            }
            {filters.company ? ` • ${filters.company}` : ' • All companies'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Note: Multi-container trips count as one trip with aggregated volumes
          </p>
        </div>
        
        {!isLoading && statistics.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            <ExportToExcel 
              statistics={statistics} 
              hasFinancialAccess={hasFinancialAccess} 
              filters={filters}
            />
            <ExportToPDF 
              statistics={statistics} 
              hasFinancialAccess={hasFinancialAccess} 
              filters={filters}
            />
          </div>
        )}
      </div>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === tab.id ? 
                  'border-blue-500 text-blue-600' : 
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {tab.icon === 'chart-pie' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                )}
                {tab.icon === 'chart-line' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                )}
                {tab.icon === 'building-office' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                )}
                {tab.icon === 'clipboard-document-list' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                )}
                {tab.icon === 'map' && (
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
      
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!isLoading && statistics.length > 0 && (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Trips</p>
                      <p className="text-gray-900 font-semibold text-xl">{formatNumber(totals.totalTrips)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg: {formatNumber(dailyAvgs.avgTripsPerDay)}/day
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Volume</p>
                      <p className="text-gray-900 font-semibold text-xl">{formatNumber(totals.totalVolume)} L</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg: {formatNumber(dailyAvgs.avgVolumePerDay)}/day
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Distance</p>
                      <p className="text-gray-900 font-semibold text-xl">{formatNumber(totals.totalDistance)} km</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg: {formatNumber(dailyAvgs.avgDistancePerDay)}/day
                      </p>
                    </div>
                  </div>
                </div>
                
                {hasFinancialAccess ? (
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Total Revenue</p>
                        <p className="text-gray-900 font-semibold text-xl">{formatCurrency(totals.totalAmount || totals.totalRevenue)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Monthly projection: {formatCurrency(dailyAvgs.avgRevenuePerDay * 31)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-5 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-gray-200 text-gray-400 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Total Revenue</p>
                        <p className="text-gray-400 font-semibold text-xl">Restricted</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-blue-100 rounded-lg p-4 bg-blue-50">
                    <h4 className="text-gray-700 text-sm font-medium">Top by Trips</h4>
                    {getTopPerformer('trips') && (
                      <div className="mt-2 flex items-center">
                        <span className="text-2xl font-bold text-blue-600 mr-2">
                          {getTopPerformer('trips').company}
                        </span>
                        <span className="text-blue-800 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium">
                          {formatNumber(getTopPerformer('trips').total_trips)} trips
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border border-green-100 rounded-lg p-4 bg-green-50">
                    <h4 className="text-gray-700 text-sm font-medium">Top by Volume</h4>
                    {getTopPerformer('volume') && (
                      <div className="mt-2 flex items-center">
                        <span className="text-2xl font-bold text-green-600 mr-2">
                          {getTopPerformer('volume').company}
                        </span>
                        <span className="text-green-800 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                          {formatNumber(getTopPerformer('volume').total_volume)} L
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {hasFinancialAccess && (
                    <div className="border border-purple-100 rounded-lg p-4 bg-purple-50">
                      <h4 className="text-gray-700 text-sm font-medium">Top by Revenue</h4>
                      {getTopPerformer('revenue') && (
                        <div className="mt-2 flex items-center">
                          <span className="text-2xl font-bold text-purple-600 mr-2">
                            {getTopPerformer('revenue').company}
                          </span>
                          <span className="text-purple-800 bg-purple-100 px-2 py-1 rounded-full text-xs font-medium">
                            {formatCurrency(getTopPerformer('revenue').total_amount || getTopPerformer('revenue').total_revenue)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <TripStatsByDate statsByDate={statsByDate} hasFinancialAccess={hasFinancialAccess} startDate={filters.startDate} endDate={filters.endDate} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="text-gray-700 text-sm font-medium mb-4">Trip Distribution by Company</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={comparisonData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          outerRadius={80}
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
                
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="text-gray-700 text-sm font-medium mb-4">Volume Distribution by Company</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={comparisonData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          outerRadius={80}
                          fill={COLORS.green}
                          dataKey="volume"
                        >
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLOR_ARRAY[(index + 1) % COLOR_ARRAY.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${formatNumber(value)} L`, props.payload.name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {hasFinancialAccess && (
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-gray-700 text-sm font-medium mb-4">Revenue Distribution by Company</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={comparisonData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={80}
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
            </div>
          )}
          
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <TripStatsByDate statsByDate={statsByDate} hasFinancialAccess={hasFinancialAccess} startDate={filters.startDate} endDate={filters.endDate} />
              
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={getWeeklyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis yAxisId="left" />
                      {hasFinancialAccess && <YAxis yAxisId="right" orientation="right" />}
                      <Tooltip formatter={customTooltipFormatter} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="trips" fill={COLORS.blue} name="Trips" />
                      <Bar yAxisId="left" dataKey="volume" fill={COLORS.indigo} name="Volume" />
                      {hasFinancialAccess && (
                        <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={COLORS.green} name="Revenue" />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Daily Activity Patterns</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getDailyPatterns()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={customTooltipFormatter} />
                      <Legend />
                      <Area type="monotone" dataKey="trips" fill={COLORS.cyan} stroke={COLORS.blue} name="Trips" />
                      <Area type="monotone" dataKey="companies" fill={COLORS.amber} stroke={COLORS.orange} name="Companies" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'companies' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Company Comparison</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {hasFinancialAccess && (
                    <div className="h-80">
                      <h4 className="text-gray-700 text-sm font-medium mb-2">Revenue Breakdown by Company</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={customTooltipFormatter} />
                          <Legend />
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
                  
                  <div className="h-80">
                    <h4 className="text-gray-700 text-sm font-medium mb-2">Trips by Company</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Legend />
                        <Bar dataKey="trips" fill={COLORS.blue} name="Trips">
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLOR_ARRAY[(index + 1) % COLOR_ARRAY.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-80">
                    <h4 className="text-gray-700 text-sm font-medium mb-2">Distance by Company</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Legend />
                        <Bar dataKey="distance" fill={COLORS.yellow} name="Distance">
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLOR_ARRAY[(index + 2) % COLOR_ARRAY.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-80">
                    <h4 className="text-gray-700 text-sm font-medium mb-2">Volume by Company</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Legend />
                        <Bar dataKey="volume" fill={COLORS.green} name="Volume">
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLOR_ARRAY[(index + 3) % COLOR_ARRAY.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statistics.map((company, index) => (
                  <div 
                    key={index} 
                    className={`bg-white p-5 rounded-lg shadow-sm border border-gray-100 cursor-pointer transition-all duration-200 ${
                      activeCompany === company.company ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setActiveCompany(company.company);
                      setActiveTab('details');
                    }}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{company.company}</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Total Trips</p>
                        <p className="text-gray-800 font-semibold">{formatNumber(company.total_trips)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="text-gray-800 font-semibold">{formatNumber(company.total_volume)} L</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="text-gray-800 font-semibold">{formatNumber(company.total_distance)} km</p>
                      </div>
                      {hasFinancialAccess && (
                        <div>
                          <p className="text-xs text-gray-500">Revenue</p>
                          <p className="text-gray-800 font-semibold">{formatCurrency(company.total_amount || company.total_revenue)}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCompany(company.company);
                          setActiveTab('details');
                        }}
                      >
                        View Details
                        <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'details' && activeCompanyData && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6 overflow-x-auto">
                <h4 className="text-gray-700 text-sm font-medium mb-4">Switch Company</h4>
                <div className="flex space-x-2">
                  {statistics.map((company, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                        ${activeCompany === company.company 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                        }`}
                      onClick={() => setActiveCompany(company.company)}
                    >
                      {company.company}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{activeCompanyData.company} Details</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Note: Trip counts represent individual trips. Multi-container trips count as one trip with aggregated volumes.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      Trips: {formatNumber(activeCompanyData.total_trips)}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Volume: {formatNumber(activeCompanyData.total_volume)} L
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      Distance: {formatNumber(activeCompanyData.total_distance)} km
                    </span>
                    {hasFinancialAccess && (
                      <>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                          Revenue: {formatCurrency(activeCompanyData.total_revenue || 0)}
                        </span>
                        {activeCompanyData.total_vat > 0 && (
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                            VAT: {formatCurrency(activeCompanyData.total_vat)}
                          </span>
                        )}
                        {activeCompanyData.total_car_rent > 0 && (
                          <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-semibold">
                            Car Rental: {formatCurrency(activeCompanyData.total_car_rent)}
                          </span>
                        )}
                        {(activeCompanyData.total_amount > 0 || (activeCompanyData.total_vat > 0)) && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            Total: {formatCurrency(activeCompanyData.total_revenue + (activeCompanyData.total_vat || 0) + (activeCompanyData.total_car_rent || 0))}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {activeCompanyData.details && activeCompanyData.details.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="text-gray-700 text-sm font-medium mb-4">Details Breakdown</h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={detailsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" />
                            {hasFinancialAccess && <YAxis yAxisId="right" orientation="right" />}
                            <Tooltip formatter={customTooltipFormatter} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="trips" fill={COLORS.blue} name="Trips" />
                            <Bar yAxisId="left" dataKey="distance" fill={COLORS.yellow} name="Distance" />
                            {hasFinancialAccess && hasVAT && (
                              <Bar yAxisId="right" dataKey="totalWithVAT" fill={COLORS.purple} name="Total Amount" />
                            )}
                            {hasFinancialAccess && !hasVAT && (
                              <Bar yAxisId="right" dataKey="revenue" fill={COLORS.green} name="Revenue" />
                            )}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="text-gray-700 text-sm font-medium mb-4">Trip Distribution</h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={detailsData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
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
                    </div>
                  </div>
                  
                  {hasFinancialAccess && (hasVAT || hasCarRental) && (
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6">
                      <h4 className="text-gray-700 text-sm font-medium mb-4">Financial Breakdown</h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={detailsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={customTooltipFormatter} />
                            <Legend />
                            <Bar dataKey="revenue" name="Base Revenue" stackId="a" fill={COLORS.green} />
                            {hasVAT && <Bar dataKey="vat" name="VAT (14%)" stackId="a" fill={COLORS.indigo} />}
                            {hasCarRental && <Bar dataKey="carRental" name="Car Rental" stackId="a" fill={COLORS.teal} />}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <h4 className="text-gray-700 text-sm font-medium mb-4">Detailed Breakdown</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Group
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trips
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Volume (L)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Distance (km)
                            </th>
                            {hasFinancialAccess && (
                              <>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Fee
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Base Revenue
                                </th>
                                {hasCarRental && (
                                  <>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Cars
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Days
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Car Rental
                                    </th>
                                  </>
                                )}
                                {hasVAT && (
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    VAT (14%)
                                  </th>
                                )}
                                {(hasVAT || hasCarRental) && (
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                  </th>
                                )}
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeCompanyData.details.map((detail, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {detail.group_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatNumber(detail.total_trips)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatNumber(detail.total_volume)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatNumber(detail.total_distance)}
                              </td>
                              {hasFinancialAccess && (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {detail.fee ? formatNumber(detail.fee) : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatCurrency(detail.total_revenue)}
                                  </td>
                                  {hasCarRental && (
                                    <>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatNumber(detail.distinct_cars || 0)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatNumber(detail.distinct_days || 0)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(detail.car_rental || 0)}
                                      </td>
                                    </>
                                  )}
                                  {hasVAT && (
                                    <td className="px-6 py-4 whitespace-nowrap text-smtext-gray-500">
                                        {formatCurrency(detail.vat || 0)}
                                      </td>
                                    )}
                                    {(hasVAT || hasCarRental) && (
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(detail.total_with_vat || (detail.total_revenue + (detail.vat || 0) + (detail.car_rental || 0)))}
                                      </td>
                                    )}
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 p-8 text-center rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No detailed data available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No detailed data is available for this company.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'routes' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6 overflow-x-auto">
                  <h4 className="text-gray-700 text-sm font-medium mb-4">Select Company for Route Analysis</h4>
                  <div className="flex space-x-2">
                    {statistics.map((company, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                          ${activeCompany === company.company 
                            ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                          }`}
                        onClick={() => setActiveCompany(company.company)}
                      >
                        {company.company}
                      </button>
                    ))}
                  </div>
                </div>

                {activeCompanyData && (
                  <RouteDetailsSection 
                    activeCompanyData={activeCompanyData} 
                    hasFinancialAccess={hasFinancialAccess} 
                    formatNumber={formatNumber}
                    formatCurrency={formatCurrency}
                  />
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
        
        {!isLoading && statistics.length === 0 && (
          <div className="bg-gray-50 p-8 text-center rounded-lg shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No statistics available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try changing your filter options or make sure trips are recorded in the system.
            </p>
          </div>
        )}
      </div>
    );
  };

  export default TripStatistics;