import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, 
  LineChart, Line, Legend 
} from 'recharts';
import { 
  TrendingUp, Clock, MapPin, 
  DollarSign, Truck, Package 
} from 'lucide-react';

const DriverDetails = ({ driver, globalStats, hasFinancialAccess }) => {
  // Consistent efficiency color logic
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 1.2) return { 
      headerBg: 'bg-green-900', 
      color: 'text-green-300', 
      label: 'Outstanding', 
      description: 'Significantly above average performance'
    };
    if (efficiency >= 1.1) return { 
      headerBg: 'bg-green-800', 
      color: 'text-green-200', 
      label: 'Excellent', 
      description: 'Consistently high performance'
    };
    if (efficiency >= 1.0) return { 
      headerBg: 'bg-blue-800', 
      color: 'text-blue-500', 
      label: 'Good', 
      description: 'Meets expected performance'
    };
    if (efficiency >= 0.9) return { 
      headerBg: 'bg-blue-400', 
      color: 'text-blue-50', 
      label: 'Average', 
      description: 'Performing near company average'
    };
    if (efficiency >= 0.8) return { 
      headerBg: 'bg-yellow-500', 
      color: 'text-yellow-50', 
      label: 'Needs Improvement', 
      description: 'Performance below expectations'
    };
    if (efficiency > 0) return { 
      headerBg: 'bg-red-400', 
      color: 'text-red-50', 
      label: 'Poor', 
      description: 'Significantly underperforming'
    };
    return { 
      headerBg: 'bg-gray-400', 
      color: 'text-gray-50', 
      label: 'No Data', 
      description: 'Insufficient performance data'
    };
  };

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

  // Prepare route data
  const routeData = useMemo(() => {
    if (!driver || !driver.route_distribution) return [];
    
    
    return driver.route_distribution
      .slice(0, 8)
      .map(route => ({
        ...route,
        name: `${route.Terminal} - ${route.DropOffPoint}`, // Use the pre-formatted route name
      }));
  }, [driver]);

  // Prepare revenue data for activity timeline
  const revenueData = useMemo(() => 
    driver ? (driver.activity_heatmap || []).map(day => ({
      date: day.date,
      count: day.count,
      revenue: day.revenue || ((driver.total_fees / driver.working_days) * day.count),
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
        name: 'Revenue Per Day',
        driver: driver.avg_fees_per_day || 0,
        global: globalStats ? 
          (globalStats.total_amount / (globalStats.total_trips / globalStats.avg_trips_per_day)) : 
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

  // Efficiency details
  const efficiencyDetails = useMemo(() => {
    if (!driver) return getEfficiencyColor(0);
    return getEfficiencyColor(driver.efficiency);
  }, [driver]);

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
          value: `$${formatNumber((driver.total_fees || driver.total_revenue) || 0)}`,
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
      <div className={`${efficiencyDetails.headerBg} p-6 text-white`}>
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
            <div className={`text-3xl font-bold ${efficiencyDetails.color}`}>
              {formatPercent(driver.efficiency * 100)}
            </div>
            <p className={`${efficiencyDetails.color} text-sm`}>
              {efficiencyDetails.label}
            </p>
            <p className="text-white/70 text-xs mt-1">
              {efficiencyDetails.description}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50">
        {/* Route Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Route Distribution</h3>
          <div className="h-64">
            {routeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
  data={routeData}
  cx="50%"
  cy="50%"
  labelLine={true}
  outerRadius={80}
  fill="#8884d8"
  dataKey="count"
  label={({ name}) => `${name}`}
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

        {/* Revenue Timeline */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue Timeline</h3>
          <div className="h-64">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: '1px solid #ddd', 
                      borderRadius: '8px' 
                    }} 
                    formatter={(value, name, props) => {
                      const dailyRate = driver.total_fees / driver.working_days;
                      return [
                        `${formatNumber(value)}`, 
                        `Revenue (${props.payload.count} trips at ${formatNumber(dailyRate)}/day)`
                      ];
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No revenue data available
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
                    <td className="px-6 py-3 text-sm text-gray-900">{route.Terminal} - {route.DropOffPoint}</td>
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

DriverDetails.propTypes = {
  driver: PropTypes.shape({
    driver_name: PropTypes.string.isRequired,
    total_trips: PropTypes.number,
    total_distance: PropTypes.number,
    total_volume: PropTypes.number,
    working_days: PropTypes.number,
    total_fees: PropTypes.number,
    total_revenue: PropTypes.number,
    total_amount: PropTypes.number,
    avg_trips_per_day: PropTypes.number,
    avg_km_per_day: PropTypes.number,
    avg_fees_per_day: PropTypes.number,
    efficiency: PropTypes.number,
    route_distribution: PropTypes.arrayOf(PropTypes.shape({
      route: PropTypes.string,
      count: PropTypes.number,
      distance: PropTypes.number,
      percent: PropTypes.number
    })),
    activity_heatmap: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.string,
      count: PropTypes.number,
      revenue: PropTypes.number
    }))
  }),
  globalStats: PropTypes.shape({
    avg_trips_per_day: PropTypes.number,
    avg_km_per_day: PropTypes.number,
    avg_volume_per_km: PropTypes.number,
    total_fees: PropTypes.number,
    total_trips: PropTypes.number
  }),
  hasFinancialAccess: PropTypes.bool,
  dateRange: PropTypes.object
};

export default DriverDetails;