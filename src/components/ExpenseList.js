import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Search, ArrowLeft, DollarSign, Calendar } from 'lucide-react';
import apiClient from '../apiClient';

const ExpenseList = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [expenses, setExpenses] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Check if we're showing all expenses or vendor-specific expenses
  const isAllExpenses = !vendorId;
  
  useEffect(() => {
    if (isAllExpenses) {
      fetchAllExpenses();
    } else {
      fetchVendorAndExpenses();
    }
  }, [vendorId]);
  
  const fetchVendorAndExpenses = async () => {
    setLoading(true);
    try {
      const vendorResponse = await apiClient.get(`/api/vendors/${vendorId}`);
      setVendor(vendorResponse.data);
      
      const expensesResponse = await apiClient.get(`/api/vendors/${vendorId}/expenses`);
      setExpenses(expensesResponse.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAllExpenses = async () => {
    setLoading(true);
    try {
      // Get all vendors first
      const vendorsResponse = await apiClient.get('/api/vendors');
      const vendors = vendorsResponse.data || [];
      
      // Then fetch expenses for each vendor
      let allExpenses = [];
      for (const vendor of vendors) {
        try {
          const expensesResponse = await apiClient.get(`/api/vendors/${vendor.id}/expenses`);
          const vendorExpenses = expensesResponse.data || [];
          
          // Add vendor info to each expense
          allExpenses = [...allExpenses, ...vendorExpenses.map(expense => ({
            ...expense,
            vendorName: vendor.name,
            vendorId: vendor.id
          }))];
        } catch (error) {
          console.error(`Error fetching expenses for vendor ${vendor.id}:`, error);
        }
      }
      
      // Sort by date (newest first)
      allExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setExpenses(allExpenses);
      setError('');
    } catch (err) {
      console.error('Error fetching all expenses:', err);
      setError('Failed to load expenses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      if (isAllExpenses) {
        // We need to know which vendor this expense belongs to
        const expense = expenses.find(e => e.id === expenseId);
        if (!expense) {
          throw new Error('Expense not found');
        }
        await apiClient.delete(`/api/vendors/${expense.vendorId}/expenses/${expenseId}`);
      } else {
        await apiClient.delete(`/api/vendors/${vendorId}/expenses/${expenseId}`);
      }
      
      // Refresh the list after deletion
      if (isAllExpenses) {
        fetchAllExpenses();
      } else {
        fetchVendorAndExpenses();
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
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
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.price, 0).toFixed(2);
  
  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(expense => {
    // For all expenses view, search in both description and vendor name
    if (isAllExpenses) {
      return (
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // For vendor-specific view, search only in description
    return expense.description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center mb-2">
            {!isAllExpenses && (
              <button
                onClick={() => navigate('/vendors')}
                className="text-blue-600 hover:text-blue-800 mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {isAllExpenses ? 'All Expenses' : (vendor ? `${vendor.name}'s Expenses` : 'Expenses')}
            </h1>
          </div>
          {!loading && (
            <p className="text-gray-600">
              Total: <span className="font-medium">${totalExpenses}</span> • {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Link
            to={isAllExpenses ? '/add-expense' : `/add-expense/${vendorId}`}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Expense
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-12 text-center sm:px-6">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {searchTerm ? (
              <>
                <h3 className="text-lg leading-6 font-medium text-gray-900">No expenses found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No expenses match your search criteria. Try a different search or add a new expense.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg leading-6 font-medium text-gray-900">No expenses yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Get started by adding your first expense{!isAllExpenses && vendor ? ` for ${vendor.name}` : ''}.
                </p>
                <div className="mt-6">
                  <Link
                    to={isAllExpenses ? '/add-expense' : `/add-expense/${vendorId}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Expense
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  {isAllExpenses && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                    </td>
                    {isAllExpenses && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/vendor/${expense.vendorId}/expenses`} className="text-blue-600 hover:text-blue-900">
                          {expense.vendorName}
                        </Link>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatDate(expense.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{expense.price.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={isAllExpenses 
                            ? `/edit-expense/${expense.vendorId}/${expense.id}`
                            : `/edit-expense/${vendorId}/${expense.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;