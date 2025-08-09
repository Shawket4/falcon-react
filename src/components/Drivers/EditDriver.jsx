import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import apiClient from '../../apiClient';

// Custom icons
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

const EditDriver = () => {
  const { id } = useParams();
  
  // State for form fields
  const [driverName, setDriverName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [idExpirationDate, setIdExpirationDate] = useState(null);
  const [licenseExpirationDate, setLicenseExpirationDate] = useState(null);
  const [safetyExpirationDate, setSafetyExpirationDate] = useState(null);
  const [drugTestExpirationDate, setDrugTestExpirationDate] = useState(null);
  
  // Original values for comparison
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Fetch driver data on mount
  useEffect(() => {
    if (id) {
      fetchDriverData();
    }
  }, [id]);

  // Check for changes whenever form values change
  useEffect(() => {
    if (originalData) {
      const currentData = {
        name: driverName,
        mobile_number: mobileNumber,
        id_license_expiration_date: formatDate(idExpirationDate),
        driver_license_expiration_date: formatDate(licenseExpirationDate),
        safety_license_expiration_date: formatDate(safetyExpirationDate),
        drug_test_expiration_date: formatDate(drugTestExpirationDate)
      };
      
      const hasAnyChange = JSON.stringify(originalData) !== JSON.stringify(currentData);
      setHasChanges(hasAnyChange);
    }
  }, [driverName, mobileNumber, idExpirationDate, licenseExpirationDate, safetyExpirationDate, drugTestExpirationDate, originalData]);

  // Parse date string to Date object
  const parseDate = (dateString) => {
    if (!dateString || dateString === '') return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Format date for API submission
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Format date for display
  const formatDateDisplay = (date) => {
    if (!date) return '';
    
    // Ensure we have a valid Date object
    let dateObj = date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    }
    
    // Check if date is valid
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('en-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'Africa/Cairo'
    });
  };

  // Fetch driver data from API
  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('id', id);
      
      const response = await apiClient.post('/api/GetDriver', formData);
      
      if (response.status === 200 && response.data) {
        const driver = response.data;
        
        // Set form values
        setDriverName(driver.name || '');
        setMobileNumber(driver.mobile_number || '');
        setIdExpirationDate(parseDate(driver.id_license_expiration_date));
        setLicenseExpirationDate(parseDate(driver.driver_license_expiration_date));
        setSafetyExpirationDate(parseDate(driver.safety_license_expiration_date));
        setDrugTestExpirationDate(parseDate(driver.drug_test_expiration_date));
        
        // Store original data for comparison
        setOriginalData({
          name: driver.name || '',
          mobile_number: driver.mobile_number || '',
          id_license_expiration_date: driver.id_license_expiration_date || '',
          driver_license_expiration_date: driver.driver_license_expiration_date || '',
          safety_license_expiration_date: driver.safety_license_expiration_date || '',
          drug_test_expiration_date: driver.drug_test_expiration_date || ''
        });
      } else {
        setError('Failed to load driver data. Please try again.');
      }
    } catch (err) {
      setError('Error loading driver data. Please check your connection.');
      console.error('Error fetching driver:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setFormTouched(true);
    
    // Validate form (removed ID and phone validation)
    if (!driverName || !licenseExpirationDate || 
        !safetyExpirationDate || !drugTestExpirationDate) {
      setError('Please fill in all required fields.');
      return;
    }
    
    // Validate phone number format only if provided
    if (mobileNumber) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(mobileNumber)) {
        setError('Please enter a valid phone number.');
        return;
      }
    }
    
    try {
      setUpdating(true);
      setError('');
      
      const formData = new FormData();
      
      // Create request object with ID
      const requestData = {
        id: parseInt(id, 10),
        name: driverName,
        mobile_number: mobileNumber,
        id_license_expiration_date: formatDate(idExpirationDate),
        driver_license_expiration_date: formatDate(licenseExpirationDate),
        safety_license_expiration_date: formatDate(safetyExpirationDate),
        drug_test_expiration_date: formatDate(drugTestExpirationDate),
        transporter: "Apex"
      };
      
      formData.append('request', JSON.stringify(requestData));
      
      // Send update request using apiClient
      const response = await apiClient.post('/api/protected/UpdateDriver', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200) {
        // Update original data to reflect saved changes
        setOriginalData({
          name: driverName,
          mobile_number: mobileNumber,
          id_license_expiration_date: formatDate(idExpirationDate),
          driver_license_expiration_date: formatDate(licenseExpirationDate),
          safety_license_expiration_date: formatDate(safetyExpirationDate),
          drug_test_expiration_date: formatDate(drugTestExpirationDate)
        });
        
        setHasChanges(false);
        setSuccess(true);
      } else {
        setError('Failed to update driver. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while updating. Please try again.');
      console.error('Error updating driver:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    if (originalData) {
      setDriverName(originalData.name);
      setMobileNumber(originalData.mobile_number);
      setIdExpirationDate(parseDate(originalData.id_license_expiration_date));
      setLicenseExpirationDate(parseDate(originalData.driver_license_expiration_date));
      setSafetyExpirationDate(parseDate(originalData.safety_license_expiration_date));
      setDrugTestExpirationDate(parseDate(originalData.drug_test_expiration_date));
      setFormTouched(false);
      setError('');
    }
  };

  // Handle navigation
  const handleNavigateBack = () => {
    window.location.href = '/drivers';
  };

  // Custom date picker input component
  const CustomDateInput = React.forwardRef(({ value, onClick, label, required, error }, ref) => (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div 
        ref={ref}
        className={`w-full flex items-center px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 cursor-pointer
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-400 focus:border-blue-500 bg-white'}
          ${value ? 'text-gray-900' : 'text-gray-400'}`}
        onClick={onClick}
      >
        <CalendarIcon />
        <span className="ml-3 flex-1">
          {value ? (typeof value === 'string' ? value : formatDateDisplay(value)) : 'Select date'}
        </span>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">This field is required</p>
      )}
    </div>
  ));

  // Get minimum date (today)
  const today = new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <LoadingSpinner />
              <p className="text-center text-gray-600 mt-4">Loading driver information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={handleNavigateBack}
                  className="mr-4 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeftIcon />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Edit Driver</h1>
                  <p className="text-gray-500 mt-1">Update driver information (ID: {id})</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                {hasChanges ? (
                  <div className="bg-yellow-50 px-4 py-2 rounded-lg flex items-center space-x-2">
                    <InfoIcon />
                    <span className="text-sm text-yellow-700">You have unsaved changes</span>
                  </div>
                ) : (
                  <div className="bg-green-50 px-4 py-2 rounded-lg flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-700">All changes saved</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <XCircleIcon />
                  <p className="ml-3 text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mr-3">
                    <UserIcon />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Driver Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon />
                      </div>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200
                          ${formTouched && !driverName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
                          outline-none`}
                        placeholder="Enter driver's full name"
                        required
                      />
                      {formTouched && !driverName && (
                        <p className="mt-1 text-xs text-red-600">This field is required</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon />
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        placeholder="Enter phone number (optional)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* License & Certification Section */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mr-3">
                    <CalendarIcon />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Licenses & Certifications</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DatePicker
                    selected={licenseExpirationDate}
                    onChange={(date) => setLicenseExpirationDate(date)}
                    minDate={today}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={10}
                    scrollableYearDropdown
                    dateFormat="MMM dd, yyyy"
                    customInput={
                      <CustomDateInput 
                        label="Driving License Expiry" 
                        required 
                        error={formTouched && !licenseExpirationDate}
                      />
                    }
                  />
                  
                  <DatePicker
                    selected={idExpirationDate}
                    onChange={(date) => setIdExpirationDate(date)}
                    minDate={today}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={10}
                    scrollableYearDropdown
                    dateFormat="MMM dd, yyyy"
                    customInput={
                      <CustomDateInput 
                        label="Driver ID Expiration" 
                        required={false}
                      />
                    }
                  />
                  
                  <DatePicker
                    selected={safetyExpirationDate}
                    onChange={(date) => setSafetyExpirationDate(date)}
                    minDate={today}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={10}
                    scrollableYearDropdown
                    dateFormat="MMM dd, yyyy"
                    customInput={
                      <CustomDateInput 
                        label="Safety Certificate Expiry" 
                        required 
                        error={formTouched && !safetyExpirationDate}
                      />
                    }
                  />
                  
                  <DatePicker
                    selected={drugTestExpirationDate}
                    onChange={(date) => setDrugTestExpirationDate(date)}
                    minDate={today}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={10}
                    scrollableYearDropdown
                    dateFormat="MMM dd, yyyy"
                    customInput={
                      <CustomDateInput 
                        label="Drug Test Expiry" 
                        required 
                        error={formTouched && !drugTestExpirationDate}
                      />
                    }
                  />
                </div>
              </div>

             {/* Action Buttons */}
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-gray-200">
  
  {/* Right Side Buttons (Cancel + Update) */}
  <div className="flex flex-row gap-3 w-full sm:w-auto justify-between sm:justify-start">
    {/* Cancel */}
    <button
      type="button"
      onClick={() => window.location.href = '/drivers'}
      className="px-4 py-2 sm:px-5 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
    >
      Cancel
    </button>

    {/* Update */}
    <button
      type="button"
      onClick={handleSubmit}
      className={`px-5 py-2 sm:px-6 sm:py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300
        ${(updating || !hasChanges) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
      disabled={updating || !hasChanges}
    >
      {updating ? (
        <span className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2"></div>
          Updating...
        </span>
      ) : (
        'Update Driver'
      )}
    </button>
  </div>

  {/* Reset Button */}
  <button
    type="button"
    onClick={handleReset}
    className={`px-4 py-2 sm:px-5 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium transition-colors
      ${!hasChanges ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
      order-last sm:order-first w-full sm:w-auto`}
    disabled={!hasChanges}
  >
    Reset Changes
  </button>
</div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 animate-bounce">
                <CheckIcon />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-gray-900">Updated Successfully!</h3>
              <p className="mt-2 text-gray-600">Driver information has been updated</p>
              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg"
                  onClick={() => window.location.href = '/drivers'}
                >
                  Back to Drivers List
                </button>
                <button
                  type="button"
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setSuccess(false)}
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
        
        /* Custom styles for react-datepicker */
        :global(.react-datepicker-wrapper) {
          width: 100%;
        }
        
        :global(.react-datepicker__year-dropdown),
        :global(.react-datepicker__month-dropdown) {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem;
          font-size: 0.875rem;
        }
        
        :global(.react-datepicker__header) {
          background-color: #3b82f6;
          border-bottom: none;
          border-radius: 0.5rem 0.5rem 0 0;
          padding: 1rem;
        }
        
        :global(.react-datepicker__current-month),
        :global(.react-datepicker__day-name) {
          color: white;
          font-weight: 600;
        }
        
        :global(.react-datepicker__day--selected),
        :global(.react-datepicker__day--keyboard-selected) {
          background-color: #3b82f6;
          color: white;
          font-weight: 500;
        }
        
        :global(.react-datepicker__day--selected:hover),
        :global(.react-datepicker__day--keyboard-selected:hover) {
          background-color: #2563eb;
        }
        
        :global(.react-datepicker__day:hover) {
          background-color: #eff6ff;
        }
        
        :global(.react-datepicker) {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default EditDriver;