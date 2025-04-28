// components/DriverDetails.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import { 
  AlertTriangle, Edit, Trash2, Phone, ArrowLeft,
  CreditCard, FileText, FileCheck, CheckCircle, XCircle, 
  LockIcon, User, Calendar, Clock, RefreshCw, Shield
} from 'lucide-react';
import { useAuth } from '../AuthContext';

// Permission level required for certain operations
const REQUIRED_PERMISSION_LEVEL = 3;

const DriverDetails = () => {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  const isMounted = useRef(true);
  
  // Get auth context to check permissions
  const { hasMinPermissionLevel } = useAuth();
  
  // Check if user has required permission level
  const canEditDelete = hasMinPermissionLevel(REQUIRED_PERMISSION_LEVEL);
  
  // This function stays outside useEffect and useCallback
  // Manually pass the parameters instead of capturing from closure
  const fetchDriverDataImpl = async (driverId, forceRefresh = false) => {
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
        const driverData = profileResponse.data.find(d => d.ID.toString() === driverId);
        
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
        setRefreshing(false);
      }
    }
  };
  
  // First effect - only runs once on mount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Second effect - runs when ID changes
  useEffect(() => {
    // Only fetch on initial mount or when ID changes
    if (isInitialMount.current || id !== driver?.ID.toString()) {
      fetchDriverDataImpl(id);
    }
    
    isInitialMount.current = false;
  }, [id]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDriverDataImpl(id, true);
  };
  
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
    navigate(`/driver/edit/${id}`);
  };
  
  const navigateToLoans = () => {
    navigate(`/driver/loans/${id}`);
  };
  
  const navigateToExpenses = () => {
    navigate(`/driver/expenses/${id}`);
  };
  
  const navigateToSalary = () => {
    navigate(`/driver/salaries/${id}`);
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
      
      // Force refresh driver data
      fetchDriverDataImpl(id, true);
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
  
  const formatExpirationStatus = (date) => {
    if (!date) return { status: 'unknown', message: 'Not provided' };
    
    const expirationDate = new Date(date);
    const now = new Date();
    const diffTime = expirationDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        status: 'expired', 
        message: 'Expired',
        className: 'bg-red-100 text-red-700' 
      };
    } else if (diffDays <= 30) {
      return { 
        status: 'warning', 
        message: `Expires in ${diffDays} days`,
        className: 'bg-amber-100 text-amber-700'  
      };
    } else {
      return { 
        status: 'valid', 
        message: 'Valid',
        className: 'bg-green-100 text-green-700'
      };
    }
  };
  
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-4">Loading driver details...</p>
      </div>
    );
  }
  
  if (error || !driver) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <p className="text-red-700 font-medium mb-2 text-xl">Error Loading Driver</p>
          <p className="text-red-600 mb-6">{error || "Driver not found"}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            onClick={() => navigate('/drivers')}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Drivers
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/drivers')} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Back to Drivers</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <User size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{driver.name}</h1>
                {driver.is_approved === 0 && (
                  <div className="mt-1 inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                    Pending Approval
                  </div>
                )}
                {driver.is_approved === 1 && (
                  <div className="mt-1 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Approved
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex mt-4 md:mt-0 gap-2">
              {!canEditDelete && (
                <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm flex items-center">
                  <LockIcon size={14} className="mr-1" />
                  <span>View Only</span>
                </div>
              )}
              
              <button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
                aria-label="Refresh driver details"
                title="Refresh driver details"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>
              
              {canEditDelete && (
                <>
                  <button 
                    className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    onClick={handleEditDriver}
                  >
                    <Edit size={18} className="mr-2" />
                    <span>Edit</span>
                  </button>
                  <button 
                    className="flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={18} className="mr-2" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Contact Information
            </h2>
            <div className="flex items-start p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 text-blue-500 rounded-md mr-4">
                <Phone size={20} />
              </div>
              <div>
                <span className="block text-sm text-gray-500">Phone Number</span>
                <span className="font-medium">{driver.mobile_number || 'Not provided'}</span>
              </div>
            </div>
          </div>
          
          {/* Documents and Licenses */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Documents and Licenses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ID License */}
              <div className={`flex flex-col p-4 ${isExpired(driver.id_license_expiration_date) ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}>
                <div className="flex mb-3">
                  <div className="p-2 bg-blue-100 text-blue-500 rounded-md mr-3">
                    <CreditCard size={20} />
                  </div>
                  <div className="flex-grow">
                    <span className="block text-sm text-gray-500">ID License</span>
                    <span className="font-medium">{driver.id_license_expiration_date || 'Not provided'}</span>
                  </div>
                  {driver.id_license_expiration_date && (
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${formatExpirationStatus(driver.id_license_expiration_date).className}`}>
                      {formatExpirationStatus(driver.id_license_expiration_date).message}
                    </div>
                  )}
                </div>
                <div className="mt-auto text-xs text-gray-500">
                  {isExpired(driver.id_license_expiration_date) && (
                    <p className="flex items-center text-red-600">
                      <AlertTriangle size={14} className="mr-1" />
                      Expired ID requires immediate attention
                    </p>
                  )}
                </div>
              </div>
              
              {/* Driver License */}
              <div className={`flex flex-col p-4 ${isExpired(driver.driver_license_expiration_date) ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}>
                <div className="flex mb-3">
                  <div className="p-2 bg-blue-100 text-blue-500 rounded-md mr-3">
                    <FileText size={20} />
                  </div>
                  <div className="flex-grow">
                    <span className="block text-sm text-gray-500">Driver License</span>
                    <span className="font-medium">{driver.driver_license_expiration_date || 'Not provided'}</span>
                  </div>
                  {driver.driver_license_expiration_date && (
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${formatExpirationStatus(driver.driver_license_expiration_date).className}`}>
                      {formatExpirationStatus(driver.driver_license_expiration_date).message}
                    </div>
                  )}
                </div>
                <div className="mt-auto text-xs text-gray-500">
                  {isExpired(driver.driver_license_expiration_date) && (
                    <p className="flex items-center text-red-600">
                      <AlertTriangle size={14} className="mr-1" />
                      Expired license prevents legal driving
                    </p>
                  )}
                </div>
              </div>
              
              {/* Safety License */}
              <div className={`flex flex-col p-4 ${isExpired(driver.safety_license_expiration_date) ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}>
                <div className="flex mb-3">
                  <div className="p-2 bg-blue-100 text-blue-500 rounded-md mr-3">
                    <Shield size={20} />
                  </div>
                  <div className="flex-grow">
                    <span className="block text-sm text-gray-500">Safety License</span>
                    <span className="font-medium">{driver.safety_license_expiration_date || 'Not provided'}</span>
                  </div>
                  {driver.safety_license_expiration_date && (
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${formatExpirationStatus(driver.safety_license_expiration_date).className}`}>
                      {formatExpirationStatus(driver.safety_license_expiration_date).message}
                    </div>
                  )}
                </div>
                <div className="mt-auto text-xs text-gray-500">
                  {isExpired(driver.safety_license_expiration_date) && (
                    <p className="flex items-center text-red-600">
                      <AlertTriangle size={14} className="mr-1" />
                      Safety certification needs renewal
                    </p>
                  )}
                </div>
              </div>
              
              {/* Drug Test */}
              <div className={`flex flex-col p-4 ${isExpired(driver.drug_test_expiration_date) ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}>
                <div className="flex mb-3">
                  <div className="p-2 bg-blue-100 text-blue-500 rounded-md mr-3">
                    <FileCheck size={20} />
                  </div>
                  <div className="flex-grow">
                    <span className="block text-sm text-gray-500">Drug Test</span>
                    <span className="font-medium">{driver.drug_test_expiration_date || 'Not provided'}</span>
                  </div>
                  {driver.drug_test_expiration_date && (
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${formatExpirationStatus(driver.drug_test_expiration_date).className}`}>
                      {formatExpirationStatus(driver.drug_test_expiration_date).message}
                    </div>
                  )}
                </div>
                <div className="mt-auto text-xs text-gray-500">
                  {isExpired(driver.drug_test_expiration_date) && (
                    <p className="flex items-center text-red-600">
                      <AlertTriangle size={14} className="mr-1" />
                      Drug test renewal required
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                onClick={navigateToLoans}
              >
                <CreditCard size={20} className="mr-2" />
                <span>Loans</span>
              </button>
              <button 
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                onClick={navigateToExpenses}
              >
                <DollarSign size={20} className="mr-2" />
                <span>Expenses</span>
              </button>
              <button 
                className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                onClick={navigateToSalary}
              >
                <Calendar size={20} className="mr-2" />
                <span>Salaries</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Approval Section */}
      {driver.is_approved === 0 && canEditDelete && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 mb-6">
          <div className="flex items-center mb-4">
            <Clock size={24} className="text-amber-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-800">Pending Approval</h2>
          </div>
          <p className="text-gray-600 mb-6">
            This driver is awaiting approval. Please review their information and decide whether to approve or reject their application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              onClick={handleRejectDriver}
            >
              <XCircle size={20} className="mr-2" />
              <span>Reject Application</span>
            </button>
            <button 
              className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              onClick={handleApproveDriver}
            >
              <CheckCircle size={20} className="mr-2" />
              <span>Approve Application</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Floating refresh indicator */}
      {refreshing && (
        <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-gray-200 z-20 animate-fadeIn">
          <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Refreshing...</span>
        </div>
      )}
      
      {/* Delete Confirmation Dialog - Only shown if user has permission */}
      {showDeleteConfirm && canEditDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Delete Driver</h3>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{driver.name}</span>? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                className="px-4 py-2 sm:py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium flex-1 flex items-center justify-center"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex-1 flex items-center justify-center disabled:bg-red-300"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-white border-white border-opacity-20 rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Delete Driver
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Import missing icons
const DollarSign = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
};

export default DriverDetails;