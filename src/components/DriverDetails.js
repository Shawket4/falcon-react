// components/DriverDetails.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { 
  AlertTriangle, Edit, Trash2, Phone, 
  CreditCard, FileText, FileCheck, CheckCircle, XCircle, LockIcon 
} from 'lucide-react';
import { useAuth } from './AuthContext';

// Permission level required for certain operations
const REQUIRED_PERMISSION_LEVEL = 3;

const DriverDetails = () => {  // Remove props completely
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  
  // Get auth context to check permissions
  const { hasMinPermissionLevel } = useAuth();
  
  // Check if user has required permission level
  const canEditDelete = hasMinPermissionLevel(REQUIRED_PERMISSION_LEVEL);
  
  // Track if the component is mounted
  const isMounted = useRef(true);
  
  // Use fetchDriverData as a ref to prevent re-creation
  const fetchDriverData = useRef(async () => {
    if (!isMounted.current) return;
    
    setLoading(true);
    
    try {
      // Fetch driver profile data
      const profileResponse = await apiClient.post(
        '/api/GetDriverProfileData',
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );
      
      if (!isMounted.current) return;
      
      if (profileResponse.data) {
        const driverData = profileResponse.data.find(d => d.ID.toString() === id);
        
        if (driverData) {
          setDriver(driverData);
        } else {
          setError("Driver not found");
        }
      }
    } catch (err) {
      if (!isMounted.current) return;
      console.error(err);
      setError("Failed to load driver details");
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }).current;
  
  useEffect(() => {
    // Set isMounted to true
    isMounted.current = true;
    
    // Call fetchDriverData
    fetchDriverData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [id]); // Only depend on id
  
  const handleDelete = async () => {
    if (!canEditDelete) return;
    
    setDeleting(true);
    
    try {
      await apiClient.post(
        '/api/DeleteDriver',
        { ID: parseInt(id) },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );
      
      navigate('/drivers');
    } catch (err) {
      console.error(err);
      setError("Failed to delete driver");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleEditDriver = () => {
    if (!canEditDelete) return;
    
    // Navigate to edit driver page (not implemented in this example)
    alert("Edit driver functionality not implemented");
  };
  
  const navigateToLoans = () => {
    navigate(`/driver/loans/${id}`);
  };
  
  const navigateToExpenses = () => {
    alert("Expenses functionality not implemented");
  };
  
  const navigateToSalary = () => {
    alert("Salary functionality not implemented");
  };
  
  const handleApproveDriver = async () => {
    if (!canEditDelete) return;
    
    try {
      await apiClient.post(
        '/api/ApproveRequest',
        {
          TableName: "users",
          ColumnIdName: "id",
          Id: parseInt(id)
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );
      
      // Refresh driver data
      fetchDriverData();
    } catch (err) {
      console.error(err);
      setError("Failed to approve driver");
    }
  };
  
  const handleRejectDriver = async () => {
    if (!canEditDelete) return;
    
    try {
      await apiClient.post(
        '/api/RejectRequest',
        {
          TableName: "users",
          ColumnIdName: "id",
          Id: parseInt(id)
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );
      
      // Navigate back to drivers list
      navigate('/drivers');
    } catch (err) {
      console.error(err);
      setError("Failed to reject driver");
    }
  };
  
  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    try {
      return new Date(dateStr) < new Date();
    } catch (e) {
      return false;
    }
  };
  
  // Rest of the component rendering remains the same...
  // (Keeping the entire render section unchanged)
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading driver details...</p>
      </div>
    );
  }
  
  if (error || !driver) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-red-500">
          <AlertTriangle size={48} />
        </div>
        <p className="text-gray-800 font-medium">{error || "Driver not found"}</p>
        <button 
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => navigate('/drivers')}
        >
          Back to Drivers
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">{driver.name}</h1>
          
          {!canEditDelete && (
            <div className="ml-3 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm flex items-center">
              <LockIcon size={14} className="mr-1" />
              <span>View Only</span>
            </div>
          )}
        </div>
        
        {canEditDelete && (
          <div className="flex space-x-2">
            <button 
              className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
              onClick={handleEditDriver}
            >
              <Edit size={18} className="mr-2" />
              <span>Edit</span>
            </button>
            <button 
              className="flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={18} className="mr-2" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          <div className="flex items-start p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 text-blue-500 rounded-md mr-4">
              <Phone size={20} />
            </div>
            <div>
              <span className="block text-sm text-gray-500">Phone</span>
              <span className="font-medium">{driver.mobile_number || 'Not provided'}</span>
            </div>
          </div>
          
          <div className={`flex items-start p-4 ${isExpired(driver.id_license_expiration_date) ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}>
            <div className="p-2 bg-blue-100 text-blue-500 rounded-md mr-4">
              <CreditCard size={20} />
            </div>
            <div>
              <span className="block text-sm text-gray-500">ID Expiration</span>
              <div className="flex items-center">
                <span className="font-medium">{driver.id_license_expiration_date || 'Not provided'}</span>
                {isExpired(driver.id_license_expiration_date) && (
                  <AlertTriangle size={16} className="ml-2 text-red-500" />
                )}
              </div>
            </div>
          </div>
          
          <div className={`flex items-start p-4 ${isExpired(driver.driver_license_expiration_date) ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}>
            <div className="p-2 bg-blue-100 text-blue-500 rounded-md mr-4">
              <FileText size={20} />
            </div>
            <div>
              <span className="block text-sm text-gray-500">Driver License Expiration</span>
              <div className="flex items-center">
                <span className="font-medium">{driver.driver_license_expiration_date || 'Not provided'}</span>
                {isExpired(driver.driver_license_expiration_date) && (
                  <AlertTriangle size={16} className="ml-2 text-red-500" />
                )}
              </div>
            </div>
          </div>
          
          <div className={`flex items-start p-4 ${isExpired(driver.safety_license_expiration_date) ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}>
            <div className="p-2 bg-blue-100 text-blue-500 rounded-md mr-4">
              <FileText size={20} />
            </div>
            <div>
              <span className="block text-sm text-gray-500">Safety License Expiration</span>
              <div className="flex items-center">
                <span className="font-medium">{driver.safety_license_expiration_date || 'Not provided'}</span>
                {isExpired(driver.safety_license_expiration_date) && (
                  <AlertTriangle size={16} className="ml-2 text-red-500" />
                )}
              </div>
            </div>
          </div>
          
          <div className={`flex items-start p-4 ${isExpired(driver.drug_test_expiration_date) ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}>
            <div className="p-2 bg-blue-100 text-blue-500 rounded-md mr-4">
              <FileCheck size={20} />
            </div>
            <div>
              <span className="block text-sm text-gray-500">Drug Test Expiration</span>
              <div className="flex items-center">
                <span className="font-medium">{driver.drug_test_expiration_date || 'Not provided'}</span>
                {isExpired(driver.drug_test_expiration_date) && (
                  <AlertTriangle size={16} className="ml-2 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            className="px-4 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
            onClick={navigateToLoans}
          >
            <span>Loans</span>
          </button>
          <button 
            className="px-4 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors"
            onClick={navigateToExpenses}
          >
            <span>Expenses</span>
          </button>
          <button 
            className="px-4 py-3 bg-purple-500 text-white font-medium rounded-md hover:bg-purple-600 transition-colors"
            onClick={navigateToSalary}
          >
            <span>Salaries</span>
          </button>
        </div>
      </div>
      
      {driver.is_approved === 0 && canEditDelete && (
        <div className="flex space-x-4 mt-8">
          <button 
            className="flex-1 flex items-center justify-center px-4 py-3 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
            onClick={handleRejectDriver}
          >
            <XCircle size={20} className="mr-2" />
            <span>Reject Request</span>
          </button>
          <button 
            className="flex-1 flex items-center justify-center px-4 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors"
            onClick={handleApproveDriver}
          >
            <CheckCircle size={20} className="mr-2" />
            <span>Approve Request</span>
          </button>
        </div>
      )}
      
      {/* Delete Confirmation Dialog - Only shown if user has permission */}
      {showDeleteConfirm && canEditDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <Trash2 size={24} className="text-red-500 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Delete Driver</h3>
            </div>
            <p className="mb-6 text-gray-600">Are you sure you want to delete {driver.name}? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-red-300"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetails;