import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar
} from 'recharts';

const TripStatsByDate = ({ statsByDate, hasFinancialAccess }) => {
  const [activeMetric, setActiveMetric] = useState('revenue');

  // Format numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  // If no data, show empty state
  if (!statsByDate || statsByDate.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Time Series Analysis</h3>
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline data available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your date range to see time-based statistics.
          </p>
        </div>
      </div>
    );
  }

  // Format the data for the chart
  const chartData = statsByDate.map(day => {
    // Format the date to be more readable
    const dateObj = new Date(day.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    return {
      date: formattedDate,
      originalDate: day.date, // Keep original date for tooltip
      trips: day.total_trips || 0,
      volume: day.total_volume || 0,
      distance: day.total_distance || 0,
      revenue: hasFinancialAccess ? (day.total_revenue || 0) : 0,
      companies: day.company_details?.length || 0
    };
  });


  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.originalDate}</p>
          <div className="mt-2">
            {hasFinancialAccess && (
              <p className="text-sm text-gray-600">
                <span className="inline-block w-24">Revenue:</span>
                <span className="font-medium text-purple-600">${formatNumber(data.revenue)}</span>
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="inline-block w-24">Volume:</span>
              <span className="font-medium text-green-600">{formatNumber(data.volume)} L</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="inline-block w-24">Distance:</span>
              <span className="font-medium text-yellow-600">{formatNumber(data.distance)} km</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="inline-block w-24">Companies:</span>
              <span className="font-medium text-indigo-600">{data.companies}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Metric selector buttons
  const MetricButton = ({ metric, label, color }) => (
    <button
      onClick={() => setActiveMetric(metric)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        activeMetric === metric 
          ? `bg-${color}-100 text-${color}-800 border border-${color}-300` 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      style={activeMetric === metric ? { backgroundColor: `${color}15`, color: color, borderColor: `${color}50` } : {}}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h3 className="text-lg font-semibold">Time Series Analysis</h3>
        <div className="flex flex-wrap gap-2">
        {hasFinancialAccess && (
            <MetricButton metric="revenue" label="Revenue" color="#8B5CF6" />
          )}
          <MetricButton metric="volume" label="Volume" color="#10B981" />
          <MetricButton metric="distance" label="Distance" color="#F59E0B" />
          
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
              </linearGradient>
              
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            
            {activeMetric === 'volume' && (
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorVolume)" 
                activeDot={{ r: 6 }}
                name="Volume (L)"
              />
            )}
            
            {activeMetric === 'distance' && (
              <Area 
                type="monotone" 
                dataKey="distance" 
                stroke="#F59E0B" 
                fillOpacity={1} 
                fill="url(#colorDistance)" 
                activeDot={{ r: 6 }}
                name="Distance (km)"
              />
            )}
            
            {activeMetric === 'revenue' && hasFinancialAccess && (
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8B5CF6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6 }}
                name="Revenue ($)"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {chartData.length > 0 && (
        <div className="mt-6 border-t pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Average Trips per Day</p>
            <p className="text-lg font-semibold text-blue-800">
              {formatNumber(chartData.reduce((sum, day) => sum + day.trips, 0) / chartData.length)}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-600 font-medium">Average Volume per Day</p>
            <p className="text-lg font-semibold text-green-800">
              {formatNumber(chartData.reduce((sum, day) => sum + day.volume, 0) / chartData.length)} L
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-yellow-600 font-medium">Average Distance per Day</p>
            <p className="text-lg font-semibold text-yellow-800">
              {formatNumber(chartData.reduce((sum, day) => sum + day.distance, 0) / chartData.length)} km
            </p>
          </div>
          {hasFinancialAccess && (
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">Average Revenue per Day</p>
              <p className="text-lg font-semibold text-purple-800">
                ${formatNumber(chartData.reduce((sum, day) => sum + day.revenue, 0) / chartData.length)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripStatsByDate;