import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  DollarSign, 
  PlusCircle, 
  ChevronRight,
  TrendingUp,
  BarChart,
  PieChart,
  FileText
} from 'lucide-react';
import apiClient from '../apiClient';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalExpenses: 0,
    totalAmount: 0,
    recentExpenses: [],
    topVendors: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would likely be a single dashboard API endpoint
      // For this example, we'll make separate calls and combine the data
      
      // Get all vendors
      const vendorsResponse = await apiClient.get('/api/vendors');
      const vendors = vendorsResponse.data || [];
      
      // Get all expenses across all vendors
      let allExpenses = [];
      for (const vendor of vendors) {
        const expensesResponse = await apiClient.get(`/api/vendors/${vendor.ID}/expenses`);
        const vendorExpenses = expensesResponse.data || [];
        // Add vendor information to each expense for display
        allExpenses = [...allExpenses, ...vendorExpenses.map(expense => ({
          ...expense,
          vendorName: vendor.name,
          vendorId: vendor.id
        }))];
      }
      
      // Calculate total amount
      const totalAmount = allExpenses.reduce((sum, expense) => sum + expense.price, 0);
      
      // Get recent expenses (last 5)
      const recentExpenses = [...allExpenses]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      // Calculate top vendors by expense amount
      const vendorExpenseTotals = vendors.map(vendor => {
        const vendorExpenses = allExpenses.filter(expense => expense.vendorId === vendor.id);
        const total = vendorExpenses.reduce((sum, expense) => sum + expense.price, 0);
        return {
          id: vendor.id,
          name: vendor.name,
          total,
          count: vendorExpenses.length
        };
      });
      
      const topVendors = vendorExpenseTotals
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      
      setStats({
        totalVendors: vendors.length,
        totalExpenses: allExpenses.length,
        totalAmount,
        recentExpenses,
        topVendors
      });
      
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 bg-blue-100 rounded-full mr-4">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Vendors</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 bg-green-100 rounded-full mr-4">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalExpenses}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 bg-purple-100 rounded-full mr-4">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Recent Expenses
            </h2>
            <Link 
              to="/expenses" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-200">
            {stats.recentExpenses.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No recent expenses found.
              </div>
            ) : (
              stats.recentExpenses.map((expense) => (
                <div key={expense.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-md mr-4">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                      <p className="text-xs text-gray-500">
                        {expense.vendorName} • {formatDate(expense.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(expense.price)}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {stats.recentExpenses.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Link
                to="/add-expense"
                className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add New Expense
              </Link>
            </div>
          )}
        </div>
        
        {/* Top Vendors */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-blue-500" />
              Top Vendors by Expense
            </h2>
            <Link 
              to="/vendors" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-200">
            {stats.topVendors.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No vendor expenses found.
              </div>
            ) : (
              stats.topVendors.map((vendor) => (
                <div key={vendor.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-md mr-4">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                      <p className="text-xs text-gray-500">
                        {vendor.count} expense{vendor.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(vendor.total)}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {stats.topVendors.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Link
                to="/add-vendor"
                className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add New Vendor
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/add-vendor"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="p-3 bg-blue-100 rounded-full mb-3">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Add Vendor</span>
          </Link>
          
          <Link
            to="/add-expense"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="p-3 bg-green-100 rounded-full mb-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Add Expense</span>
          </Link>
          
          <Link
            to="/vendors"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="p-3 bg-purple-100 rounded-full mb-3">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">View Vendors</span>
          </Link>
          
          <Link
            to="/expenses"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="p-3 bg-yellow-100 rounded-full mb-3">
              <PieChart className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">View Expenses</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;