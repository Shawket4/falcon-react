import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';

// Import components that could be reused from the TripList
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const TripStatistics = () => {
  // State declarations
  const [statistics, setStatistics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    company: '',
    startDate: '',
    endDate: ''
  });
  const [activeCompany, setActiveCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchStatistics();
  }, [filters]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get(`/api/mappings/companies`);
      setCompanies(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let url = `/api/trips/statistics`;
      let params = {};
      
      // Apply date filters if set
      if (filters.startDate && filters.endDate) {
        params = {
          ...params,
          start_date: filters.startDate,
          end_date: filters.endDate
        };
      }
      
      // Apply company filter if set
      if (filters.company) {
        params = {
          ...params,
          company: filters.company
        };
      }
      
      const response = await apiClient.get(url, { params });
      setStatistics(response.data.data || []);
      
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    // Reset active company if company filter changes
    if (name === 'company') {
      setActiveCompany(value || null);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      company: '',
      startDate: '',
      endDate: ''
    });
    
    // Reset active company
    if (statistics.length > 0) {
      setActiveCompany(statistics[0].company);
    } else {
      setActiveCompany(null);
    }
  };

  // Format numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  // Calculate totals across all companies
  const calculateTotals = () => {
    return statistics.reduce((totals, company) => {
      return {
        totalTrips: totals.totalTrips + company.total_trips,
        totalVolume: totals.totalVolume + company.total_volume,
        totalDistance: totals.totalDistance + company.total_distance,
        totalRevenue: totals.totalRevenue + company.total_revenue,
      };
    }, { totalTrips: 0, totalVolume: 0, totalDistance: 0, totalRevenue: 0 });
  };

  // Get data for company comparison chart
  const getCompanyComparison = () => {
    return statistics.map(company => ({
      name: company.company,
      trips: company.total_trips,
      volume: company.total_volume,
      distance: company.total_distance,
      revenue: company.total_revenue,
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
      trips: detail.total_trips,
      volume: detail.total_volume,
      distance: detail.total_distance,
      revenue: detail.total_revenue,
      fee: detail.fee,
      value: detail.total_trips // For pie chart
    }));
  };

  const totals = calculateTotals();
  const comparisonData = getCompanyComparison();
  const activeCompanyData = getActiveCompanyData();
  const detailsData = activeCompanyData ? getCompanyDetailsChartData(activeCompanyData) : [];

  // Custom tooltip formatter for charts
  const customTooltipFormatter = (value, name) => {
    if (name === 'revenue') return [`$${formatNumber(value)}`, 'Revenue'];
    if (name === 'distance') return [`${formatNumber(value)} km`, 'Distance'];
    if (name === 'volume') return [`${formatNumber(value)} L`, 'Volume'];
    if (name === 'trips') return [`${formatNumber(value)}`, 'Trips'];
    return [formatNumber(value), name];
  };

  return (
    <div className="w-full overflow-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-3 sm:px-4 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">Trip Statistics Dashboard</h2>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded" role="alert">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Filter panel */}
          <FilterPanel
            companies={companies}
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
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
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Revenue</p>
                      <p className="text-gray-900 font-semibold text-xl">${formatNumber(totals.totalRevenue)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Company Comparison Charts */}
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">Company Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-72">
                    <h4 className="text-gray-700 text-sm font-medium mb-2">Revenue by Company</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#8884d8" name="Revenue">
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                        <Bar dataKey="distance" fill="#82ca9d" name="Distance">
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Company Selection Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8">
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{activeCompanyData.company} Details</h3>
                    <div className="flex space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        Trips: {formatNumber(activeCompanyData.total_trips)}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Distance: {formatNumber(activeCompanyData.total_distance)} km
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        Revenue: ${formatNumber(activeCompanyData.total_revenue)}
                      </span>
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
                                <YAxis />
                                <Tooltip formatter={customTooltipFormatter} />
                                <Legend />
                                <Bar dataKey="trips" fill="#8884d8" name="Trips" />
                                <Bar dataKey="distance" fill="#82ca9d" name="Distance" />
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
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fee
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Revenue
                              </th>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {detail.fee ? formatNumber(detail.fee) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${formatNumber(detail.total_revenue)}
                                </td>
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
      </div>
    </div>
  );
};

export default TripStatistics;