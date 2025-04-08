import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ExportToExcel from './ExportStatsToExcel';
import ExportToPdf from './ExportStatsToPdf';
import apiClient from '../../apiClient';
import TripStatsByDate from './AnalyticsGraphByDate';

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
  const [statsByDate, setStatsByDate] = useState([]);
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
      setStatsByDate(response.data.statsByDate || []);
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
      
            {/* Export to Excel Component */}
            {!isLoading && statistics.length > 0 && (
  <div className="flex flex-col sm:flex-row gap-4 mb-4">
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

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        </div>
      )}

      {!isLoading && statistics.length > 0 && (
        <>
          {/* Top Stats Summary Cards */}
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
                  value={`$${formatNumber(totals.totalAmount || totals.totalRevenue)}`}
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
          </CollapsibleCard>

          <TripStatsByDate statsByDate={statsByDate} hasFinancialAccess={hasFinancialAccess}></TripStatsByDate>
          
          {/* Company Selection */}
          <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Company:</h3>
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
          
          {/* Company Comparison Charts */}
          <CollapsibleCard title="Company Comparison" initiallyExpanded={false}>
            <div className="space-y-4">
              {hasFinancialAccess && (
                <div className="h-64">
                  <h4 className="text-gray-700 text-xs font-medium mb-2">Revenue by Company</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                      <YAxis />
                      <Tooltip formatter={customTooltipFormatter} />
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
              
              <div className="h-64">
                <h4 className="text-gray-700 text-xs font-medium mb-2">Trips by Company</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                    <YAxis />
                    <Tooltip formatter={customTooltipFormatter} />
                    <Bar dataKey="trips" fill="#82ca9d" name="Trips">
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CollapsibleCard>
          
          {/* Active Company Details */}
          {activeCompanyData && (
            <CollapsibleCard 
              title={`${activeCompanyData.company} Details`} 
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
                        Revenue: ${formatNumber(activeCompanyData.total_revenue || 0)}
                      </span>
                      {(activeCompanyData.total_vat > 0 || activeCompanyData.total_car_rent > 0) && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          Total: ${formatNumber(activeCompanyData.total_revenue + (activeCompanyData.total_vat || 0) + (activeCompanyData.total_car_rent || 0))}
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {activeCompanyData.details && activeCompanyData.details.length > 0 ? (
                  <>
                    {/* Trip Distribution Chart */}
                    <div className="h-64 mt-4">
                      <h4 className="text-gray-700 text-xs font-medium mb-2">Trip Distribution</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={detailsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name.substring(0, 10)}${name.length > 10 ? '...' : ''}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
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
                    
                    {/* Details Cards */}
                    {detailsData.map((detail, index) => (
                      <CollapsibleCard
                        key={index}
                        title={detail.name}
                        initiallyExpanded={false}
                        badge={`${formatNumber(detail.trips)} trips`}
                        className="border border-gray-100"
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
                                  <p className="text-sm font-medium">${formatNumber(detail.revenue)}</p>
                                </div>
                                {hasVAT && (
                                  <div className="bg-gray-100 rounded p-2">
                                    <p className="text-xs text-gray-500">VAT (14%)</p>
                                    <p className="text-sm font-medium">${formatNumber(detail.vat || 0)}</p>
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
                                      <p className="text-sm font-medium">${formatNumber(detail.carRental || 0)}</p>
                                    </div>
                                  </>
                                )}
                                {(hasVAT || hasCarRental) && (
                                  <div className="bg-gray-100 rounded p-2 col-span-2">
                                    <p className="text-xs text-gray-500">Total Amount</p>
                                    <p className="text-sm font-medium">${formatNumber(detail.totalWithVAT || (detail.revenue + (detail.vat || 0) + (detail.carRental || 0)))}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CollapsibleCard>
                    ))}
                  </>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <p className="text-gray-500 text-xs">No detailed data available.</p>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          )}
        </>
      )}
      
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