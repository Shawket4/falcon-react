// components/TransactionForm.js
import React, { useState } from 'react';
import { Save, X, ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react';

const TransactionForm = ({ initialData = {}, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    description: initialData.description || '',
    amount: initialData.amount ? Math.abs(initialData.amount).toString() : '',
    date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    type: initialData.amount < 0 ? 'debit' : 'credit'
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when it's being edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const setTransactionType = (type) => {
    setFormData({
      ...formData,
      type
    });
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setTransactionType('credit')}
              className={`
                flex-1 py-2 px-3 rounded-md flex items-center justify-center
                ${formData.type === 'credit' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
              `}
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Credit (Purchase)
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('debit')}
              className={`
                flex-1 py-2 px-3 rounded-md flex items-center justify-center
                ${formData.type === 'debit' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
              `}
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Debit (Payment)
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {formData.type === 'credit' 
              ? 'Use Credit for purchases from this vendor' 
              : 'Use Debit for payments made to this vendor'}
          </p>
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
              ${errors.date ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder={formData.type === 'credit' ? 'e.g., 5 tires purchased' : 'e.g., Paid invoice #123'}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
            ${errors.description ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>
      
      <div className="mt-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            step="0.01"
            min="0.01"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            className={`
              w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
              ${errors.amount ? 'border-red-500' : 'border-gray-300'}
            `}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <span className="flex items-center">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </span>
        </button>
        <button
          type="submit"
          className={`
            px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
          disabled={isLoading}
        >
          <span className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Transaction'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;