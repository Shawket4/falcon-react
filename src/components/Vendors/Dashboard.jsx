// components/vendor/Dashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertCircle, 
  RefreshCw,
  Calendar,
  PieChart,
  CreditCard,
  Activity,
  Building,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';

// Import extracted components
import StatCard from './Dashboard/StatCard';
import ChartContainer from './Dashboard/ChartContainer';
import ActivityItem from './Dashboard/ActivityItem';
import CustomTooltip from './Dashboard/CustomTooltip';

// Mock data for development
const mockMonthlyData = [
  { month: 'Jan', credits: 5000, debits: -3000, net: 2000 },
  { month: 'Feb', credits: 6000, debits: -2500, net: 3500 },
  { month: 'Mar', credits: 5500, debits: -3500, net: 2000 },
  { month: 'Apr', credits: 7000, debits: -4000, net: 3000 }
];

const mockTopVendors = [
  { name: 'ABC Supply', credits: 8000, debits: -5000, net: 3000 },
  { name: 'XYZ Corp', credits: 6000, debits: -4000, net: 2000 },
  { name: 'Acme Inc', credits: 5500, debits: -3000, net: 2500 }
];

const mockRecentActivity = [
  { id: 1, date: '2025-03-30T10:30:00', vendor_name: 'ABC Supply', description: 'Monthly order', amount: 1200 },
  { id: 2, date: '2025-03-28T14:20:00', vendor_name: 'XYZ Corp', description: 'Invoice payment', amount: -800 },
  { id: 3, date: '2025-03-25T09:15:00', vendor_name: 'Acme Inc', description: 'Emergency supplies', amount: 350 }
];

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total_credits: 0,
    total_debits: 0,
    net_balance: 0,
    vendor_count: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refresh animation
  const [useMockData, setUseMockData] = useState(false);

  // Format currency using Intl API
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1); // Trigger animation
    
    try {
      if (useMockData) {
        // Use mock data for development
        setTimeout(() => {
          setSummary({
            total_credits: 15000,
            total_debits: -8000,
            net_balance: 7000,
            vendor_count: 5
          });
          setMonthlyData(mockMonthlyData);
          setTopVendors(mockTopVendors);
          setRecentActivity(mockRecentActivity);
          setError('');
          setLoading(false);
        }, 1000);
        return;
      }

      // Fetch all data in parallel for performance
      const [summaryResponse, monthlyResponse, topVendorsResponse, recentActivityResponse] = await Promise.all([
        apiClient.get('/api/analytics/summary'),
        apiClient.get('/api/analytics/monthly'),
        apiClient.get('/api/analytics/top-vendors'),
        apiClient.get('/api/analytics/recent-activity')
      ]);
      
      setSummary(summaryResponse.data);
      setMonthlyData(monthlyResponse.data || []);
      setTopVendors(topVendorsResponse.data || []);
      setRecentActivity(recentActivityResponse.data || []);
      setError('');
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard data');
      
      // Use mock data if API fails
      setUseMockData(true);
      setSummary({
        total_credits: 15000,
        total_debits: -8000,
        net_balance: 7000,
        vendor_count: 5
      });
      setMonthlyData(mockMonthlyData);
      setTopVendors(mockTopVendors);
      setRecentActivity(mockRecentActivity);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate percentage for payments vs purchases for pie chart
  const transactionDistribution = useMemo(() => {
    if (!summary || (summary.total_credits === 0 && Math.abs(summary.total_debits || 0) === 0)) {
      return [
        { name: 'No Data', value: 1, color: '#e2e8f0' }
      ];
    }
    
    return [
      { name: 'Purchases', value: summary.total_credits || 0, color: '#ef4444' },
      { name: 'Payments', value: Math.abs(summary.total_debits || 0), color: '#10b981' }
    ];
  }, [summary]);

  // COLORS for charts
  const COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    tertiary: '#f59e0b',
    quaternary: '#6366f1',
    credit: '#ef4444',
    debit: '#10b981',
    neutral: '#64748b'
  };

  // Safe check if data arrays have content
  const hasMonthlyData = monthlyData && monthlyData.length > 0;
  const hasTopVendors = topVendors && topVendors.length > 0;
  const hasRecentActivity = recentActivity && recentActivity.length > 0;

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Financial Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your vendor transactions and financial activity</p>
        </div>
        <button 
          className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors self-start sm:self-auto"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error Loading Dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Purchases" 
          value={formatCurrency(summary.total_credits || 0)}
          subtitle="All time credit transactions" 
          icon={CreditCard} 
          iconColor="bg-red-500"
          change="12%" 
          changeType="positive"
        />
        <StatCard 
          title="Total Payments" 
          value={formatCurrency(Math.abs(summary.total_debits || 0))}
          subtitle="All time debit transactions" 
          icon={TrendingDown} 
          iconColor="bg-green-500"
          change="8%" 
          changeType="positive"
        />
        <StatCard 
          title="Current Balance" 
          value={formatCurrency(summary.net_balance || 0)}
          subtitle="Net balance across all vendors" 
          icon={DollarSign} 
          iconColor={(summary.net_balance || 0) > 0 ? "bg-amber-500" : "bg-blue-500"}
          change={(summary.net_balance || 0) !== 0 ? 
            `${Math.abs(Math.round(((summary.net_balance || 0) / ((summary.total_credits || 0) + Math.abs(summary.total_debits || 0)) * 100)))}%` : 
            "0%"}
          changeType={(summary.net_balance || 0) > 0 ? "negative" : "positive"}
        />
        <StatCard 
          title="Active Vendors" 
          value={summary.vendor_count || 0}
          subtitle="Total vendors in system" 
          icon={Users} 
          iconColor="bg-purple-500"
        />
      </div>

      {/* Charts Section - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Trends Chart - Takes 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <ChartContainer 
            title="Monthly Transaction Trends" 
            subtitle="Credit vs debit transactions over the past 12 months"
          >
            <div className="h-80">
              {hasMonthlyData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="credits" 
                      name="Purchases" 
                      stroke={COLORS.credit}
                      fill={COLORS.credit} 
                      fillOpacity={0.1} 
                      activeDot={{ r: 6 }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="debits" 
                      name="Payments" 
                      stroke={COLORS.debit}
                      fill={COLORS.debit} 
                      fillOpacity={0.1} 
                      activeDot={{ r: 6 }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="net" 
                      name="Net Balance" 
                      stroke={COLORS.tertiary}
                      fill={COLORS.tertiary} 
                      fillOpacity={0.1} 
                      activeDot={{ r: 6 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-1">No Monthly Data</h3>
                    <p className="text-gray-500 text-sm">Monthly transaction data will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </ChartContainer>
        </div>

        {/* Transaction Distribution Chart - Takes 1/3 width */}
        <div>
          <ChartContainer 
            title="Transaction Distribution" 
            subtitle="Ratio between purchases and payments"
          >
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={transactionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="#374151" 
                          textAnchor={x > cx ? 'start' : 'end'} 
                          dominantBaseline="central"
                          fontSize={12}
                          fontWeight={500}
                        >
                          {name} ({(percent * 100).toFixed(0)}%)
                        </text>
                      );
                    }}
                  >
                    {transactionDistribution && transactionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>
      </div>

      {/* Second Row - Top Vendors and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Vendors Chart */}
        <ChartContainer title="Top 5 Vendors" subtitle="By transaction volume">
          <div className="h-80">
            {hasTopVendors ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topVendors}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                  <Legend />
                  <Bar 
                    dataKey="credits" 
                    name="Purchases" 
                    fill={COLORS.credit} 
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar 
                    dataKey="debits" 
                    name="Payments" 
                    fill={COLORS.debit} 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Vendor Data</h3>
                  <p className="text-gray-500 text-sm">Top vendors will appear here</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 text-right">
            <Link to="/vendors" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View all vendors →
            </Link>
          </div>
        </ChartContainer>

        {/* Recent Activity */}
        <ChartContainer title="Recent Activity" subtitle="Latest transactions">
          <div className="h-80 overflow-y-auto pr-2 styled-scrollbar">
            {!hasRecentActivity ? (
              <div className="text-center py-24 px-4">
                <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No Recent Activity</h3>
                <p className="text-gray-500 text-sm">Transactions will appear here when created</p>
              </div>
            ) : (
              <div>
                {recentActivity.map((transaction) => (
                  <ActivityItem
                    key={transaction.id}
                    date={transaction.date}
                    vendorName={transaction.vendor_name}
                    description={transaction.description}
                    amount={formatCurrency(Math.abs(transaction.amount))}
                    type={transaction.amount > 0 ? 'credit' : 'debit'}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 text-right">
            <Link to="/vendors" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View all transactions →
            </Link>
          </div>
        </ChartContainer>
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/vendors" 
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Manage Vendors</span>
          </Link>
          <Link 
            to="/vendors" 
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <ArrowUpCircle className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Record Payment</span>
          </Link>
          <Link 
            to="/vendors" 
            className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <ArrowDownCircle className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium text-red-900">Record Purchase</span>
          </Link>
          <Link 
            to="/reports" 
            className="flex flex-col items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <PieChart className="h-8 w-8 text-slate-600 mb-2" />
            <span className="text-sm font-medium text-slate-900">Financial Reports</span>
          </Link>
        </div>
      </div>

      {/* Custom CSS for scrollbars */}
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 20px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 20px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;