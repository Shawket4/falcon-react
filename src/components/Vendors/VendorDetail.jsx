// components/VendorDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  PlusCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  AlertCircle, 
  DollarSign, 
  Calendar,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import apiClient from '../../apiClient';
import TransactionForm from './TransactionForm';

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [vendor, setVendor] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  
  // Fetch vendor details
  const fetchVendorDetails = async () => {
    setLoading(true);
    try {
      const vendorResponse = await apiClient.get(`/api/vendors/${id}`);
      setVendor(vendorResponse.data);
      
      const balanceResponse = await apiClient.get(`/api/vendors/${id}/balance`);
      setBalance(balanceResponse.data.balance);
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch vendor details');
      if (err.response?.status === 404) {
        setTimeout(() => navigate('/vendors'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch transactions for vendor
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/vendors/${id}/transactions`);
      setTransactions(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };
  
  // Create new transaction
  const createTransaction = async (transactionData) => {
    setLoading(true);
    try {
      await apiClient.post(`/api/vendors/${id}/transactions`, transactionData);
      fetchTransactions();
      fetchVendorDetails(); // Refresh balance
      setShowAddForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete transaction
  const deleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.delete(`/api/transactions/${transactionId}`);
      fetchTransactions();
      fetchVendorDetails(); // Refresh balance
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchVendorDetails();
    fetchTransactions();
  }, [id]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  if (!vendor && !loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Vendor Not Found</h2>
        <p className="text-gray-600 mb-6">The vendor you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => navigate('/vendors')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendors
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/vendors')}
          className="inline-flex items-center px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to all vendors
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Vendor Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="md:flex md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading...' : vendor?.name}
            </h1>
            {vendor?.contact && (
              <p className="text-gray-600 mt-1">{vendor.contact}</p>
            )}
            {vendor?.notes && (
              <p className="text-gray-500 mt-2 max-w-2xl">{vendor.notes}</p>
            )}
          </div>
          
          <div className="mt-4 md:mt-0 bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">CURRENT BALANCE</p>
            <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {balance > 0 
                ? 'You owe the vendor' 
                : balance < 0 
                  ? 'Vendor owes you' 
                  : 'Settled'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Financial Stats
          </button>
        </div>
      </div>
      
      {activeTab === 'transactions' && (
        <>
          {/* Action Buttons */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
            <div className="flex space-x-4">
              <button 
                className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                onClick={fetchTransactions}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowAddForm(true)}
                disabled={loading}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Transaction
              </button>
            </div>
          </div>
          
          {/* Add Transaction Form */}
          {showAddForm && (
            <div className="mb-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Add New Transaction</h3>
              <TransactionForm 
                onSubmit={createTransaction}
                onCancel={() => setShowAddForm(false)}
                isLoading={loading}
              />
            </div>
          )}
          
          {/* Transactions List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {transactions.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                {loading ? 'Loading transactions...' : 'No transactions found for this vendor. Add your first transaction above.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.amount > 0 ? (
                            <span className="flex items-center text-red-600">
                              <ArrowDownCircle className="h-4 w-4 mr-1" />
                              Credit
                            </span>
                          ) : (
                            <span className="flex items-center text-green-600">
                              <ArrowUpCircle className="h-4 w-4 mr-1" />
                              Debit
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <span className={transaction.amount > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => deleteTransaction(transaction.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
      
      {activeTab === 'stats' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium mb-6">Financial Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
                  <ArrowDownCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Purchases</h4>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(transactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0))}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500 text-white mr-4">
                  <ArrowUpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Payments</h4>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(Math.abs(transactions.reduce((sum, t) => sum + (t.amount < 0 ? t.amount : 0), 0)))}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-500 text-white mr-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Transaction Count</h4>
                  <p className="text-xl font-bold">{transactions.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-md font-medium mb-4">Transaction Summary</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Most recent transaction:</span>
                  <span className="font-medium">
                    {transactions.length > 0 
                      ? new Date(Math.max(...transactions.map(t => new Date(t.date)))).toLocaleDateString() 
                      : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Largest purchase:</span>
                  <span className="font-medium text-red-600">
                    {transactions.length > 0 
                      ? formatCurrency(Math.max(...transactions.map(t => t.amount > 0 ? t.amount : 0))) 
                      : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Largest payment:</span>
                  <span className="font-medium text-green-600">
                    {transactions.length > 0 
                      ? formatCurrency(Math.abs(Math.min(...transactions.map(t => t.amount < 0 ? t.amount : 0)))) 
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDetail;