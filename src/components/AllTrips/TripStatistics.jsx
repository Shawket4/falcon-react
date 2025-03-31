import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';
import ExportToExcel from './ExportStatsToExcel';

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
  Pie 
} from 'recharts';

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#8B5CF6'  // Purple
];


const TripStatistics = ({ filters }) => {
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
  const [hasFinancialAccess, setHasFinancialAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCompany, setActiveCompany] = useState(null);
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
      setHasFinancialAccess(response.data.hasFinancialAccess || false);
      
      // Set active company to first one if not already set
      if (response.data.data && response.data.data.length > 0 && !activeCompany) {
        setActiveCompany(response.data.data[0].company);
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

  // Calculate totals across all companies
  const calculateTotals = () => {
    // First extract all the relevant values
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
    
    // Check if revenue needs to be normalized (in case of Watanya)
    const needsNormalization = company.company === "Watanya" || 
      (company.details.some(detail => detail.total_revenue > 1000000));
    
    return company.details.map(detail => ({
      name: detail.group_name,
      trips: detail.total_trips || 0,
      volume: detail.total_volume || 0,
      distance: detail.total_distance || 0,
      revenue: hasFinancialAccess ? (detail.total_revenue || 0) : 0,
      // Normalize revenue for chart display
      normalizedRevenue: hasFinancialAccess ? ((detail.total_revenue || 0) / 1000) : 0,
      vat: hasFinancialAccess ? (detail.vat || 0) : 0,
      normalizedVAT: hasFinancialAccess ? ((detail.vat || 0) / 1000) : 0,
      carRental: hasFinancialAccess ? (detail.car_rental || 0) : 0,
      normalizedCarRental: hasFinancialAccess ? ((detail.car_rental || 0) / 1000) : 0,
      totalWithVAT: hasFinancialAccess ? (detail.total_with_vat || 0) : 0,
      normalizedTotalWithVAT: hasFinancialAccess ? ((detail.total_with_vat || 0) / 1000) : 0,
      fee: hasFinancialAccess ? (detail.fee || 0) : 0,
      distinctCars: detail.distinct_cars || 0,
      distinctDays: detail.distinct_days || 0,
      value: detail.total_trips || 0 // For pie chart
    }));
  };

  const totals = calculateTotals();
  const comparisonData = getCompanyComparison();
  const activeCompanyData = getActiveCompanyData();
  const detailsData = activeCompanyData ? getCompanyDetailsChartData(activeCompanyData) : [];

  // Custom tooltip formatter for charts
  const customTooltipFormatter = (value, name) => {
    if (name === 'revenue') return [`${formatNumber(value)}`, 'Base Revenue'];
    if (name === 'totalAmount' || name === 'totalWithVAT') return [`${formatNumber(value)}`, 'Total Amount'];
    if (name === 'vat') return [`${formatNumber(value)}`, 'VAT (14%)'];
    if (name === 'carRental') return [`${formatNumber(value)}`, 'Car Rental Fees'];
    
    if (name === 'distance') return [`${formatNumber(value)} km`, 'Distance'];
    if (name === 'volume') return [`${formatNumber(value)} L`, 'Volume'];
    if (name === 'trips') return [`${formatNumber(value)}`, 'Trips'];
    if (name === 'distinctCars') return [`${formatNumber(value)}`, 'Distinct Cars'];
    if (name === 'distinctDays') return [`${formatNumber(value)}`, 'Distinct Days'];
    
    return [formatNumber(value), name];
  };

  // Determine if the active company has VAT
  const hasVAT = activeCompanyData && 
    (activeCompanyData.company === "Watanya" || activeCompanyData.company === "TAQA");
    
  // Determine if the active company has car rental fees
  const hasCarRental = activeCompanyData && activeCompanyData.company === "TAQA";

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
    {/* Error Handling */}
    {error && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    )}
      
      {/* Permission notification */}
      {!hasFinancialAccess && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
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

      {/* Export to Excel Component */}
{!isLoading && statistics.length > 0 && (
  <ExportToExcel 
    statistics={statistics} 
    hasFinancialAccess={hasFinancialAccess} 
  />
)}
      
       {/* Loading Indicator */}
       {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
        </div>
      )}

      {!isLoading && statistics.length > 0 && (
        <>
          {/* Top Stats Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Trips</p>
                  <p className="text-gray-900 font-semibold text-xl">{formatNumber(totals.totalTrips)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Volume</p>
                  <p className="text-gray-900 font-semibold text-xl">{formatNumber(totals.totalVolume)} L</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Distance</p>
                  <p className="text-gray-900 font-semibold text-xl">{formatNumber(totals.totalDistance)} km</p>
                </div>
              </div>
            </div>
            
            {hasFinancialAccess ? (
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <p className="text-gray-900 font-semibold text-xl">${formatNumber(totals.totalAmount || totals.totalRevenue)}</p>
                    {(totals.totalVAT > 0 || totals.totalCarRent > 0) && (
                      <p className="text-xs text-gray-500 mt-1">
                        Base: ${formatNumber(totals.totalRevenue)}
                        {totals.totalVAT > 0 && `, VAT: ${formatNumber(totals.totalVAT)}`}
                        {totals.totalCarRent > 0 && `, Rental: ${formatNumber(totals.totalCarRent)}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg shadow">
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
          
          {/* Company Comparison Charts */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Company Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hasFinancialAccess && (
                <div className="h-72">
                  <h4 className="text-gray-700 text-sm font-medium mb-2">Revenue Breakdown by Company</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={customTooltipFormatter} />
                      <Legend />
                      <Bar dataKey="revenue" name="Base Revenue" stackId="a" fill="#8884d8">
                        {comparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                      <Bar dataKey="vat" name="VAT (14%)" stackId="a" fill="#82ca9d" />
                      <Bar dataKey="carRental" name="Car Rental" stackId="a" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              <div className="h-72">
                <h4 className="text-gray-700 text-sm font-medium mb-2">Trips by Company</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={customTooltipFormatter} />
                    <Legend />
                    <Bar dataKey="trips" fill="#82ca9d" name="Trips">
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-72">
                <h4 className="text-gray-700 text-sm font-medium mb-2">Distance by Company</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={customTooltipFormatter} />
                    <Legend />
                    <Bar dataKey="distance" fill="#ffc658" name="Distance">
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-72">
                <h4 className="text-gray-700 text-sm font-medium mb-2">Volume by Company</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={customTooltipFormatter} />
                    <Legend />
                    <Bar dataKey="volume" fill="#ff8042" name="Volume">
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Company Selection Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {statistics.map((company, index) => (
                <button
                  key={index}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeCompany === company.company ? 
                      'border-blue-500 text-blue-600' : 
                      'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                  onClick={() => setActiveCompany(company.company)}
                >
                  {company.company}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Active Company Details */}
          {activeCompanyData && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-lg font-semibold">{activeCompanyData.company} Details</h3>
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
                        Revenue: ${formatNumber(activeCompanyData.total_revenue || 0)}
                      </span>
                      {activeCompanyData.total_vat > 0 && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                          VAT: ${formatNumber(activeCompanyData.total_vat)}
                        </span>
                      )}
                      {activeCompanyData.total_car_rent > 0 && (
                        <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-semibold">
                          Car Rental: ${formatNumber(activeCompanyData.total_car_rent)}
                        </span>
                      )}
                      {(activeCompanyData.total_amount > 0 || (activeCompanyData.total_vat > 0)) && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                      Total: ${formatNumber(activeCompanyData.total_revenue + (activeCompanyData.total_vat || 0) + (activeCompanyData.total_car_rent || 0))}
                    </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {activeCompanyData.details && activeCompanyData.details.length > 0 ? (
                <>
                  {/* Charts for Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="lg:col-span-2">
                      <div className="h-72">
                        <h4 className="text-gray-700 text-sm font-medium mb-2">Details Breakdown</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={detailsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" />
                            {hasFinancialAccess && <YAxis yAxisId="right" orientation="right" />}
                            <Tooltip formatter={customTooltipFormatter} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="trips" fill="#8884d8" name="Trips" />
                            <Bar yAxisId="left" dataKey="distance" fill="#82ca9d" name="Distance" />
                            {hasFinancialAccess && hasVAT && (
                              <Bar yAxisId="right" dataKey="totalWithVAT" fill="#ffc658" name="Total Amount" />
                            )}
                            {hasFinancialAccess && !hasVAT && (
                              <Bar yAxisId="right" dataKey="revenue" fill="#ffc658" name="Revenue" />
                            )}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <div className="h-72">
                        <h4 className="text-gray-700 text-sm font-medium mb-2">Trip Distribution</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={detailsData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="trips"
                            >
                              {detailsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={customTooltipFormatter} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {/* Financial Breakdown Chart for Watanya and TAQA */}
                  {hasFinancialAccess && (hasVAT || hasCarRental) && (
                    <div className="mb-6">
                      <h4 className="text-gray-700 text-sm font-medium mb-2">Financial Breakdown</h4>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={detailsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={customTooltipFormatter} />
                            <Legend />
                            <Bar dataKey="revenue" name="Base Revenue" stackId="a" fill="#8884d8" />
                            {hasVAT && <Bar dataKey="vat" name="VAT (14%)" stackId="a" fill="#82ca9d" />}
                            {hasCarRental && <Bar dataKey="carRental" name="Car Rental" stackId="a" fill="#ffc658" />}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  
                  {/* Details Table */}
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
                                  ${formatNumber(detail.total_revenue)}
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
                                      ${formatNumber(detail.car_rental || 0)}
                                    </td>
                                  </>
                                )}
                                {hasVAT && (
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${formatNumber(detail.vat || 0)}
                                  </td>
                                )}
                                {(hasVAT || hasCarRental) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${formatNumber(detail.total_with_vat || (detail.total_revenue + (detail.vat || 0) + (detail.car_rental || 0)))}
                                  </td>
                                )}
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-gray-500">No detailed data available for this company.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {!isLoading && statistics.length === 0 && (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
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