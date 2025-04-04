import React, { useMemo } from 'react';
import PropTypes from 'prop-types'; // Add this import
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, 
  LineChart, Line, Legend 
} from 'recharts';
import { 
  TrendingUp, Clock, MapPin, 
  DollarSign, Truck, Package 
} from 'lucide-react';

const DriverDetails = ({ driver, globalStats, hasFinancialAccess, dateRange }) => {
  // Memoized formatting functions
  const formatNumber = useMemo(() => 
    (num) => new Intl.NumberFormat('en-US', { 
      maximumFractionDigits: 1 
    }).format(num || 0),
    []
  );
  
  const formatPercent = useMemo(() => 
    (num) => `${formatNumber(num)}%`,
    [formatNumber]
  );

  // Colors for charts
  const COLORS = useMemo(() => [
    '#3B82F6', '#10B981', '#F59E0B', 
    '#6366F1', '#EC4899', '#8B5CF6', 
    '#06B6D4', '#F97316'
  ], []);

  // Efficiency details with default state
  const getEfficiencyDetails = useMemo(() => {
    if (!driver) return { 
      label: 'No Data', 
      color: 'text-gray-500', 
      headerBg: 'bg-gray-700',
      description: 'No driver data available',
      efficiency: 0
    };

    const efficiency = driver.efficiency || 0;
    if (efficiency >= 1.2) return { 
      label: 'Outstanding', 
      color: 'text-green-300', 
      headerBg: 'bg-green-900',
      description: 'Significantly above average performance',
      efficiency
    };
    if (efficiency >= 1.1) return { 
      label: 'Excellent', 
      color: 'text-green-200', 
      headerBg: 'bg-green-800',
      description: 'Consistently high performance',
      efficiency
    };
    if (efficiency >= 1.0) return { 
      label: 'Good', 
      color: 'text-blue-200', 
      headerBg: 'bg-blue-800',
      description: 'Meets expected performance',
      efficiency
    };
    if (efficiency >= 0.9) return { 
      label: 'Average', 
      color: 'text-yellow-200', 
      headerBg: 'bg-yellow-800',
      description: 'Performing near company average',
      efficiency
    };
    return { 
      label: 'Needs Improvement', 
      color: 'text-red-200', 
      headerBg: 'bg-red-900',
      description: 'Performance below expectations',
      efficiency
    };
  }, [driver]);


  // Prepare route data
  const routeData = useMemo(() => {
    if (!driver || !driver.route_distribution) return [];
    
    const totalCount = driver.route_distribution.reduce((sum, route) => sum + route.count, 0);
    
    return driver.route_distribution
      .slice(0, 8)
      .map(route => ({
        ...route,
        percentage: ((route.count / totalCount) * 100).toFixed(1)
      }));
  }, [driver]);

  // Prepare activity data
  const activityData = useMemo(() => 
    driver ? (driver.activity_heatmap || []).map(day => ({
      date: day.date,
      trips: day.count,
    })) : [], 
    [driver]
  );

  // Performance comparison metrics
  const comparisonMetrics = useMemo(() => {
    if (!driver || !globalStats) return [];

    const metrics = [
      {
        name: 'Trips Per Day',
        driver: driver.avg_trips_per_day || 0,
        global: globalStats.avg_trips_per_day || 0,
        unit: ''
      },
      {
        name: 'Km Per Day',
        driver: driver.avg_km_per_day || 0,
        global: globalStats.avg_km_per_day || 0,
        unit: 'km'
      },
      {
        name: 'Volume Per Km',
        driver: driver.avg_volume_per_km || 0,
        global: globalStats.avg_volume_per_km || 0,
        unit: 'L'
      }
    ];

    // Conditionally add financial metrics
    if (hasFinancialAccess) {
      metrics.push({
        name: 'Fees Per Day',
        driver: driver.avg_fees_per_day || 0,
        global: globalStats ? 
          (globalStats.total_fees / (globalStats.total_trips / globalStats.avg_trips_per_day)) : 
          0,
        unit: '$'
      });
    }

    return metrics;
  }, [
    driver, 
    globalStats, 
    hasFinancialAccess
  ]);

  // Metrics for display
  const metrics = useMemo(() => {
    if (!driver || !globalStats) return [];

    const baseMetrics = [
        {
            icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
            label: 'Total Trips',
            value: formatNumber(driver.total_trips),
            subtext: `${formatNumber(driver.avg_trips_per_day || 0)} trips/day`
          },
      {
        icon: <MapPin className="w-6 h-6 text-green-500" />,
        label: 'Distance',
        value: `${formatNumber(driver.total_distance)} km`,
        subtext: `${formatNumber(driver.avg_km_per_day || 0)} km/day`
      },
      {
        icon: <Package className="w-6 h-6 text-yellow-500" />,
        label: 'Volume',
        value: `${formatNumber(driver.total_volume)} L`,
        subtext: `${formatNumber(driver.total_volume / driver.working_days || 0)} L/day`
      },
    ];

    // Conditionally add last metric
    const lastMetric = hasFinancialAccess 
      ? {
          icon: <DollarSign className="w-6 h-6 text-purple-500" />,
          label: 'Revenue',
          value: `$${formatNumber((driver.total_amount || driver.total_revenue) || 0)}`,
          subtext: `$${formatNumber(driver.avg_fees_per_day || 0)}/day`
        }
      : {
          icon: <Clock className="w-6 h-6 text-gray-500" />,
          label: 'Working Days',
          value: driver.working_days || 0,
          subtext: `${formatNumber(driver.avg_trips_per_day || 0)} trips/day`
        };

    return [...baseMetrics, lastMetric];
  }, [
    driver, 
  globalStats, 
  hasFinancialAccess, 
  formatNumber, 
  formatPercent
  ]);

  // Null check with more elegant loading state
  if (!driver) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-pulse w-16 h-16 mx-auto mb-4 bg-blue-300 rounded-full"></div>
          <p className="text-gray-600">Loading driver details...</p>
        </div>
      </div>
    );
  }

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Driver Header with Improved Contrast */}
        <div className={`${getEfficiencyDetails.headerBg} p-6 text-white`}>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-full">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{driver.driver_name}</h2>
                <p className="text-white/70 text-sm">
                  {driver.working_days || 0} working days • {formatNumber(driver.total_trips)} total trips
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getEfficiencyDetails.color}`}>
                {formatPercent(driver.efficiency * 100)}
              </div>
              <p className={`${getEfficiencyDetails.color} text-sm`}>
                {getEfficiencyDetails.label}
              </p>
              <p className="text-white/70 text-xs mt-1">
                {getEfficiencyDetails.description}
              </p>
            </div>
          </div>
        </div>
  
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className="bg-gray-50 hover:bg-gray-100 transition-colors duration-300 rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-2">
                {metric.icon}
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-800">{metric.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{metric.subtext}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Rest of the component remains the same as in the previous implementation */}
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50">
          {/* Route Distribution */}
          <div className="bg-white rounded-lg shadow p-4 m-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Route Distribution</h3>
        <div className="h-64">
          {routeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={routeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {routeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-75 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 shadow-lg rounded border border-gray-200">
                          <p className="font-bold">{data.route}</p>
                          <p>Trips: {data.count}</p>
                          <p>Percentage: {data.percentage}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No route data available
            </div>
          )}
        </div>
      </div>
  
          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Activity Timeline</h3>
            <div className="h-64">
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.9)', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="trips" 
                      stroke="#3B82F6" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No activity data available
                </div>
              )}
            </div>
          </div>
  
          {/* Performance Comparison */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Performance Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonMetrics}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: '1px solid #ddd', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Bar dataKey="driver" name={`${driver.driver_name}`} fill="#3B82F6" />
                  <Bar dataKey="global" name="Global Average" fill="#D1D5DB" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
  
        {/* Route Table */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Routes</h3>
          {driver.route_distribution && driver.route_distribution.length > 0 ? (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {driver.route_distribution.slice(0, 5).map((route, index) => (
                    <tr 
                      key={index} 
                      className={`
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        hover:bg-blue-50 transition-colors duration-200
                      `}
                    >
                      <td className="px-6 py-3 text-sm text-gray-900">{route.route}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 text-right">{route.count}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 text-right">
                        {formatNumber(route.distance)} km
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 text-right">
                        {formatPercent(route.percent || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
              No route data available
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default DriverDetails;