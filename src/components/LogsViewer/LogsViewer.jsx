import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  RefreshCw, 
  Eye, 
  X, 
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Code,
  BarChart3,
  Activity,
  TrendingUp,
  AlertCircle,
  Users,
  Monitor,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import apiClient from '../../apiClient';

// Statistics Cards Component
const StatisticsCards = ({ totalLogs, totalGroups, stats }) => {
  const cards = [
    {
      title: 'Total Logs',
      value: totalLogs.toLocaleString(),
      icon: FileText,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Unique Paths',
      value: totalGroups,
      icon: Code,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Total Requests',
      value: stats?.total_requests || 0,
      icon: Zap,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Error Rate',
      value: `${stats?.error_rate || 0}%`,
      icon: AlertTriangle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
          <div className="p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <card.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${card.iconColor}`} />
                </div>
              </div>
              <div className="ml-3 lg:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                  <dd className="text-lg lg:text-2xl font-bold text-gray-900">{card.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Filters Component
const LogFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  methodFilter, 
  setMethodFilter, 
  statusFilter, 
  setStatusFilter, 
  quickDateFilter, 
  setQuickDateFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  handleQuickDateFilter,
  clearAllFilters 
}) => {
  return (
    <div className="bg-white shadow-lg rounded-xl mb-6 border border-gray-100">
      <div className="px-4 lg:px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {/* Search */}
          <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Method Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Method
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Status</option>
              <option value="200">200 (OK)</option>
              <option value="201">201 (Created)</option>
              <option value="400">400 (Bad Request)</option>
              <option value="401">401 (Unauthorized)</option>
              <option value="403">403 (Forbidden)</option>
              <option value="404">404 (Not Found)</option>
              <option value="500">500 (Server Error)</option>
            </select>
          </div>

          {/* Quick Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Quick Filter
            </label>
            <select
              value={quickDateFilter}
              onChange={(e) => handleQuickDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {/* Custom Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearAllFilters}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recent Logs Component
const RecentLogs = ({ logs, getMethodColor, getStatusColor, getStatusIcon, formatDate }) => {
  const recentLogs = logs.slice(0, 10).flatMap(group => group.logs || []).slice(0, 10);

  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Logs</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentLogs.map((log, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(log.method)}`}>
                {log.method}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                {getStatusIcon(log.status)}
                <span className="ml-1">{log.status}</span>
              </span>
            </div>
            <div className="text-sm text-gray-900 font-medium truncate">{log.path}</div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(log.timestamp)} • {log.response_time}ms • {log.ip_address}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Status Distribution Component
const StatusDistribution = ({ stats }) => {
  const statusItems = [
    { label: 'Success (2xx)', count: stats?.status_2xx || 0, color: 'bg-green-500' },
    { label: 'Redirect (3xx)', count: stats?.status_3xx || 0, color: 'bg-blue-500' },
    { label: 'Client Error (4xx)', count: stats?.status_4xx || 0, color: 'bg-yellow-500' },
    { label: 'Server Error (5xx)', count: stats?.status_5xx || 0, color: 'bg-red-500' }
  ];

  const totalRequests = stats?.total_requests || 1;

  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
      <div className="space-y-3">
        {statusItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{item.label}</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div 
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${(item.count / totalRequests) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Analytics Charts Component
const AnalyticsCharts = ({ timeSeriesData, methodData, statusData, topPathsData }) => {
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Request Timeline */}
      <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Timeline</h3>
        <div className="h-64 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Requests" />
              <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Errors" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* HTTP Methods Distribution */}
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">HTTP Methods</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={methodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Code Distribution */}
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Codes</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Paths */}
      <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Request Paths</h3>
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topPathsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="path" 
                width={150}
                fontSize={12}
                tick={{ textAnchor: 'end' }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Logs Table Component
const LogsTable = ({ filteredLogs, getMethodColor, getStatusColor, getStatusIcon, setSelectedLog }) => {
  return (
    <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-gray-100">
      <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-semibold text-gray-900">
          System Logs ({filteredLogs.length} groups)
        </h3>
      </div>
      
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 lg:py-16">
          <FileText className="mx-auto h-12 w-12 lg:h-16 lg:w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No logs found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Path
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Response Time
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((group, index) => {
                const avgResponseTime = group.logs && group.logs.length > 0 
                  ? Math.round(group.logs.reduce((sum, log) => sum + (log.response_time || 0), 0) / group.logs.length)
                  : 0;
                
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {group.path}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(group.method)}`}>
                        {group.method}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(group.status)}`}>
                        {getStatusIcon(group.status)}
                        <span className="ml-1">{group.status}</span>
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {group.logs?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {avgResponseTime}ms
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(group)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, totalLogs, setCurrentPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing page {currentPage} of {totalPages} ({totalLogs.toLocaleString()} total logs)
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

// Log Details Modal Component
const LogDetailsModal = ({ selectedLog, setSelectedLog, getMethodColor, getStatusColor, getStatusIcon, formatDate }) => {
  if (!selectedLog) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
              Log Details for {selectedLog.path}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedLog.logs?.length || 0} log entries
            </p>
          </div>
          <button
            onClick={() => setSelectedLog(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-96 p-4 lg:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Agent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedLog.logs?.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(log.method)}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        <span className="ml-1">{log.status}</span>
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.response_time}ms
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ip_address}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div 
                        className="cursor-help" 
                        title={`User ID: ${log.user_id || 'N/A'}`}
                      >
                        {log.username || 'Anonymous'}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={log.user_agent}>
                        {log.user_agent}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setSelectedLog(null)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main LogsViewer Component
const LogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  
  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pathFilter, setPathFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickDateFilter, setQuickDateFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [currentPage, pageSize, dateFrom, dateTo, pathFilter, methodFilter, statusFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
        ...(pathFilter && { path: pathFilter }),
        ...(methodFilter && { method: methodFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await apiClient.get(`/api/logs?${params}`);
      setLogs(response.data.groups || []);
      setTotalPages(response.data.total_pages || 0);
      setTotalLogs(response.data.total_logs || 0);
      setTotalGroups(response.data.total_groups || 0);
    } catch (err) {
      setError('Failed to fetch logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/logs/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100';
    if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-100';
    if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-100';
    if (status >= 500) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getMethodColor = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'text-blue-600 bg-blue-100';
      case 'POST': return 'text-green-600 bg-green-100';
      case 'PUT': return 'text-yellow-600 bg-yellow-100';
      case 'DELETE': return 'text-red-600 bg-red-100';
      case 'PATCH': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4" />;
    if (status >= 300 && status < 400) return <Globe className="h-4 w-4" />;
    if (status >= 400 && status < 500) return <AlertTriangle className="h-4 w-4" />;
    if (status >= 500) return <AlertCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const handleQuickDateFilter = (filter) => {
    setQuickDateFilter(filter);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (filter) {
      case 'today':
        setDateFrom(todayStr);
        setDateTo(todayStr);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        setDateFrom(yesterdayStr);
        setDateTo(yesterdayStr);
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        setDateFrom(weekAgo.toISOString().split('T')[0]);
        setDateTo(todayStr);
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        setDateFrom(monthAgo.toISOString().split('T')[0]);
        setDateTo(todayStr);
        break;
      default:
        setDateFrom('');
        setDateTo('');
        break;
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setDateFrom('');
    setDateTo('');
    setPathFilter('');
    setMethodFilter('');
    setStatusFilter('');
    setSearchTerm('');
    setQuickDateFilter('all');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const allLogs = logs.flatMap(group => group.logs || []);
    const csvData = [
      ['Timestamp', 'Method', 'Path', 'Status', 'Response Time', 'IP Address', 'Username', 'User ID', 'User Agent'],
      ...allLogs.map(log => [
        formatDate(log.timestamp),
        log.method,
        log.path,
        log.status,
        log.response_time,
        log.ip_address,
        log.username || 'Anonymous',
        log.user_id || 'N/A',
        log.user_agent
      ])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateLogReport = () => {
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>System Logs Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>System Logs Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div style="font-size: 24px; font-weight: bold;">${totalLogs.toLocaleString()}</div>
            <div>Total Logs</div>
          </div>
          <div class="stat-card">
            <div style="font-size: 24px; font-weight: bold;">${totalGroups}</div>
            <div>Unique Paths</div>
          </div>
          <div class="stat-card">
            <div style="font-size: 24px; font-weight: bold;">${stats?.total_requests || 0}</div>
            <div>Total Requests</div>
          </div>
          <div class="stat-card">
            <div style="font-size: 24px; font-weight: bold;">${stats?.error_rate || 0}%</div>
            <div>Error Rate</div>
          </div>
        </div>

        <h2>Request Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Method</th>
              <th>Path</th>
              <th>Status</th>
              <th>Response Time</th>
              <th>IP Address</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            ${logs.flatMap(group => group.logs || []).map(log => `
              <tr>
                <td>${formatDate(log.timestamp)}</td>
                <td>${log.method}</td>
                <td>${log.path}</td>
                <td>${log.status}</td>
                <td>${log.response_time}ms</td>
                <td>${log.ip_address}</td>
                <td>${log.username || 'Anonymous'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([reportContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `system_logs_report_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Data processing for charts
  const getTimeSeriesData = () => {
    const allLogs = logs.flatMap(group => group.logs || []);
    const groupedByDate = allLogs.reduce((acc, log) => {
      const date = log.timestamp ? new Date(log.timestamp).toISOString().split('T')[0] : 'Unknown';
      if (!acc[date]) {
        acc[date] = { date, requests: 0, errors: 0, responseTimes: [] };
      }
      acc[date].requests++;
      if (log.status >= 400) acc[date].errors++;
      acc[date].responseTimes.push(log.response_time || 0);
      return acc;
    }, {});

    return Object.values(groupedByDate).map(item => ({
      ...item,
      avgResponseTime: Math.round(item.responseTimes.reduce((a, b) => a + b, 0) / item.responseTimes.length || 0)
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getMethodDistribution = () => {
    const methodCount = {};
    logs.flatMap(group => group.logs || []).forEach(log => {
      methodCount[log.method] = (methodCount[log.method] || 0) + 1;
    });
    
    return Object.entries(methodCount).map(([method, count]) => ({ method, count }));
  };

  const getStatusDistribution = () => {
    return [
      { name: 'Success (2xx)', value: stats?.status_2xx || 0, color: '#10b981' },
      { name: 'Redirect (3xx)', value: stats?.status_3xx || 0, color: '#3b82f6' },
      { name: 'Client Error (4xx)', value: stats?.status_4xx || 0, color: '#f59e0b' },
      { name: 'Server Error (5xx)', value: stats?.status_5xx || 0, color: '#ef4444' }
    ].filter(item => item.value > 0);
  };

  const getTopPaths = () => {
    return logs
      .sort((a, b) => (b.logs?.length || 0) - (a.logs?.length || 0))
      .slice(0, 10)
      .map(group => ({
        path: group.path,
        count: group.logs?.length || 0,
        avgResponseTime: group.logs?.length ? Math.round(group.logs.reduce((sum, log) => sum + (log.response_time || 0), 0) / group.logs.length) : 0
      }));
  };

  const filteredLogs = logs.filter(group => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return group.path?.toLowerCase().includes(searchLower) ||
           group.logs?.some(log => 
             log.path?.toLowerCase().includes(searchLower) ||
             log.method?.toLowerCase().includes(searchLower) ||
             log.ip_address?.toLowerCase().includes(searchLower) ||
             log.username?.toLowerCase().includes(searchLower)
           );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Error Loading Logs</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchLogs}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-800 bg-red-100 hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const timeSeriesData = getTimeSeriesData();
  const methodData = getMethodDistribution();
  const statusData = getStatusDistribution();
  const topPathsData = getTopPaths();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">System Logs Dashboard</h1>
              <p className="text-gray-600 text-sm lg:text-base">Monitor and analyze system request logs and performance</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {/* Export Dropdown */}
              <div className="relative group">
                <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={generateLogReport}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-3" />
                      HTML Report
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-3" />
                      CSV Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="mb-6 lg:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 lg:space-x-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'analytics', label: 'Analytics', icon: Activity },
                { id: 'logs', label: 'Log Entries', icon: FileText }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    viewMode === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards 
          totalLogs={totalLogs} 
          totalGroups={totalGroups} 
          stats={stats} 
        />

        {/* Content based on view mode */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <RecentLogs 
              logs={logs}
              getMethodColor={getMethodColor}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              formatDate={formatDate}
            />
            <StatusDistribution stats={stats} />
          </div>
        )}

        {viewMode === 'analytics' && (
          <AnalyticsCharts 
            timeSeriesData={timeSeriesData}
            methodData={methodData}
            statusData={statusData}
            topPathsData={topPathsData}
          />
        )}

        {viewMode === 'logs' && (
          <>
            <LogFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              methodFilter={methodFilter}
              setMethodFilter={setMethodFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              quickDateFilter={quickDateFilter}
              setQuickDateFilter={setQuickDateFilter}
              dateFrom={dateFrom}
              setDateFrom={setDateFrom}
              dateTo={dateTo}
              setDateTo={setDateTo}
              handleQuickDateFilter={handleQuickDateFilter}
              clearAllFilters={clearAllFilters}
            />
            <LogsTable 
              filteredLogs={filteredLogs}
              getMethodColor={getMethodColor}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              setSelectedLog={setSelectedLog}
            />
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalLogs={totalLogs}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
                    Log Details for {selectedLog.path}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedLog.logs?.length || 0} log entries
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-96 p-4 lg:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Response Time
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Agent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedLog.logs?.map((log, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(log.method)}`}>
                              {log.method}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                              {getStatusIcon(log.status)}
                              <span className="ml-1">{log.status}</span>
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.response_time}ms
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.ip_address}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div 
                              className="cursor-help" 
                              title={`User ID: ${log.user_id || 'N/A'}`}
                            >
                              {log.username || 'Anonymous'}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate" title={log.user_agent}>
                              {log.user_agent}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsViewer;