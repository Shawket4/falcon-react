import React, { useState } from 'react';
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
  Treemap,
  LineChart,
  Line
} from 'recharts';

// Color palette (reusing existing colors)
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

const RouteDetailsSection = ({ activeCompanyData, hasFinancialAccess, formatNumber, formatCurrency }) => {
  const [activeRoute, setActiveRoute] = useState(null);
  const [expandedRoutes, setExpandedRoutes] = useState({});

  // Route details are in activeCompanyData.route_details
  const routeDetails = activeCompanyData?.route_details || [];

  if (!routeDetails.length) {
    return (
      <div className="bg-gray-50 p-8 text-center rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No route data available</h3>
        <p className="mt-1 text-sm text-gray-500">
          No route-specific data is available for this company.
        </p>
      </div>
    );
  }

  // Format route details for charts
  const getRouteChartData = () => {
    return routeDetails.map(route => ({
      name: route.route_name,
      trips: route.total_trips || 0,
      volume: route.total_volume || 0,
      distance: route.total_distance || 0,
      revenue: hasFinancialAccess ? (route.total_revenue || 0) : 0,
      vat: hasFinancialAccess ? (route.vat || 0) : 0,
      carRental: hasFinancialAccess ? (route.car_rental || 0) : 0,
      totalWithVAT: hasFinancialAccess ? (route.total_with_vat || route.total_revenue || 0) : 0,
      // For treemap visualization
      size: route.total_trips,
      value: hasFinancialAccess ? route.total_with_vat || route.total_revenue : route.total_volume,
    }));
  };

  // Format car details for a specific route - updated to use car_no_plate instead of car_id
  const getCarChartData = (route) => {
    if (!route || !route.cars || !route.cars.length) return [];
    
    return route.cars.map(car => ({
      name: car.car_no_plate, // Changed from car_id to car_no_plate
      trips: car.total_trips || 0,
      volume: car.total_volume || 0,
      distance: car.total_distance || 0,
      revenue: hasFinancialAccess ? (car.total_revenue || 0) : 0,
      vat: hasFinancialAccess ? (car.vat || 0) : 0,
      carRental: hasFinancialAccess ? (car.car_rental || 0) : 0,
      totalWithVAT: hasFinancialAccess ? (car.total_with_vat || car.total_revenue || 0) : 0,
      workingDays: car.working_days || 0,
      // For visualization
      value: car.total_trips, // For pie chart
    }));
  };

  // Find active route data
  const getActiveRouteData = () => {
    if (!activeRoute) return null;
    return routeDetails.find(route => route.route_name === activeRoute);
  };

  // Toggle expanded state for a route
  const toggleRouteExpanded = (routeName) => {
    setExpandedRoutes(prev => ({
      ...prev,
      [routeName]: !prev[routeName]
    }));
  };

  const routeChartData = getRouteChartData();
  const activeRouteData = getActiveRouteData();
  const carChartData = activeRouteData ? getCarChartData(activeRouteData) : [];

  // Custom tooltip formatter for charts
  const customTooltipFormatter = (value, name) => {
    if (name === 'revenue') return [`${formatCurrency(value)}`, 'Base Revenue'];
    if (name === 'totalAmount' || name === 'totalWithVAT') return [`${formatCurrency(value)}`, 'Total Amount'];
    if (name === 'vat') return [`${formatCurrency(value)}`, 'VAT (14%)'];
    if (name === 'carRental') return [`${formatCurrency(value)}`, 'Car Rental Fees'];
    
    if (name === 'distance') return [`${formatNumber(value)} km`, 'Distance'];
    if (name === 'volume') return [`${formatNumber(value)} L`, 'Volume'];
    if (name === 'trips') return [`${formatNumber(value)}`, 'Trips'];
    if (name === 'workingDays') return [`${formatNumber(value)}`, 'Working Days'];
    
    return [formatNumber(value), name];
  };

  // Check if we have car rental and VAT for formatting
  const hasVAT = activeRouteData && 'vat' in activeRouteData && activeRouteData.vat > 0;
  const hasCarRental = activeRouteData && 'car_rental' in activeRouteData && activeRouteData.car_rental > 0;

  return (
    <div className="space-y-6">
      {/* Route Summary Header */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Route Statistics</h3>
        <p className="text-gray-600 text-sm mb-4">
          This section shows detailed statistics for each route operated by {activeCompanyData.company}.
          {activeCompanyData.company === "TAQA" && " For TAQA, routes are organized by terminal."}
          {activeCompanyData.company === "Watanya" && " For Watanya, routes are organized by fee category."}
          {activeCompanyData.company !== "TAQA" && activeCompanyData.company !== "Watanya" && " Routes are defined as unique terminal to drop-off point pairs."}
        </p>
      </div>

      {/* Route Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-gray-700 text-sm font-medium mb-4">Trip Distribution by Route</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
                <Bar dataKey="trips" fill={COLORS.blue} onClick={(data) => setActiveRoute(data.name)}>
                  {routeChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={activeRoute === entry.name ? COLORS.indigo : COLOR_ARRAY[index % COLOR_ARRAY.length]} 
                      cursor="pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-gray-700 text-sm font-medium mb-4">
            {hasFinancialAccess ? "Revenue by Route" : "Volume by Route"}
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {hasFinancialAccess ? (
                <BarChart data={routeChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={customTooltipFormatter} />
                  <Legend />
                  <Bar dataKey="revenue" name="Base Revenue" stackId="a" fill={COLORS.green} onClick={(data) => setActiveRoute(data.name)}>
                    {routeChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={activeRoute === entry.name ? COLORS.emerald : COLOR_ARRAY[(index + 2) % COLOR_ARRAY.length]} 
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                  {routeDetails.some(r => r.vat > 0) && (
                    <Bar dataKey="vat" name="VAT (14%)" stackId="a" fill={COLORS.indigo} />
                  )}
                  {routeDetails.some(r => r.car_rental > 0) && (
                    <Bar dataKey="carRental" name="Car Rental" stackId="a" fill={COLORS.teal} />
                  )}
                </BarChart>
              ) : (
                <BarChart data={routeChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={customTooltipFormatter} />
                  <Legend />
                  <Bar dataKey="volume" fill={COLORS.green} onClick={(data) => setActiveRoute(data.name)}>
                    {routeChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={activeRoute === entry.name ? COLORS.emerald : COLOR_ARRAY[(index + 2) % COLOR_ARRAY.length]} 
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Route TreeMap */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-gray-700 text-sm font-medium mb-4">
          Route Performance Overview {hasFinancialAccess ? "(Revenue)" : "(Volume)"}
        </h4>
        <p className="text-xs text-gray-500 mb-2">
          Click on a route to see detailed car-level statistics.
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={routeChartData}
              dataKey="value"
              aspectRatio={4/3}
              stroke="#fff"
              fill={COLORS.blue}
              onClick={(data) => data && setActiveRoute(data.name)}
            >
              {routeChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={activeRoute === entry.name ? COLORS.indigo : COLOR_ARRAY[index % COLOR_ARRAY.length]} 
                  cursor="pointer"
                />
              ))}
              <Tooltip
                formatter={(value, name, props) => {
                  const routeName = props?.payload?.name || '';
                  return hasFinancialAccess 
                    ? [`${formatCurrency(value)}`, routeName]
                    : [`${formatNumber(value)} L`, routeName];
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Route List with Car Details */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <h4 className="text-gray-700 text-sm font-medium mb-4">Route Details</h4>
        
        {routeDetails.map((route, index) => (
          <div key={index} className="mb-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
            <div 
              className={`flex justify-between items-center p-3 rounded-md cursor-pointer ${
                activeRoute === route.route_name ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => {
                setActiveRoute(route.route_name === activeRoute ? null : route.route_name);
                toggleRouteExpanded(route.route_name);
              }}
            >
              <div>
                <h5 className="font-medium text-gray-800">{route.route_name}</h5>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {formatNumber(route.total_trips)} trips
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {formatNumber(route.total_volume)} L
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                    {formatNumber(route.total_distance)} km
                  </span>
                  {hasFinancialAccess && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {formatCurrency(route.total_with_vat || route.total_revenue)}
                    </span>
                  )}
                  {route.cars && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {route.cars.length} cars
                    </span>
                  )}
                </div>
              </div>
              <div>
                <svg 
                  className={`h-5 w-5 text-gray-500 transform transition-transform ${
                    expandedRoutes[route.route_name] ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded details for this route when it's active */}
            {(activeRoute === route.route_name || expandedRoutes[route.route_name]) && route.cars && route.cars.length > 0 && (
              <div className="mt-4 pl-4">
                {/* Car distribution charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h6 className="text-xs font-medium text-gray-600 mb-2">Trips by Car</h6>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getCarChartData(route)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill={COLORS.blue}
                            dataKey="trips"
                          >
                            {getCarChartData(route).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLOR_ARRAY[index % COLOR_ARRAY.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={customTooltipFormatter} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {hasFinancialAccess && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h6 className="text-xs font-medium text-gray-600 mb-2">Revenue by Car</h6>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getCarChartData(route)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={customTooltipFormatter} />
                            <Legend />
                            <Bar dataKey="revenue" fill={COLORS.green} name="Base Revenue" />
                            {hasVAT && (
                              <Bar dataKey="vat" fill={COLORS.indigo} name="VAT" />
                            )}
                            {hasCarRental && (
                              <Bar dataKey="carRental" fill={COLORS.teal} name="Car Rental" />
                            )}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cars table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          License Plate
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trips
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Volume (L)
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Distance (km)
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Working Days
                        </th>
                        {hasFinancialAccess && (
                          <>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Base Revenue
                            </th>
                            {hasVAT && (
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                VAT
                              </th>
                            )}
                            {hasCarRental && (
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Car Rental
                              </th>
                            )}
                            {(hasVAT || hasCarRental) && (
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                            )}
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {route.cars.map((car, carIdx) => (
                        <tr key={carIdx} className={carIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {car.car_no_plate}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(car.total_trips)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(car.total_volume)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(car.total_distance)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(car.working_days)}
                          </td>
                          {hasFinancialAccess && (
                            <>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(car.total_revenue)}
                              </td>
                              {hasVAT && (
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(car.vat || 0)}
                                </td>
                              )}
                              {hasCarRental && (
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(car.car_rental || 0)}
                                </td>
                              )}
                              {(hasVAT || hasCarRental) && (
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatCurrency(car.total_with_vat || car.total_revenue)}
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteDetailsSection;