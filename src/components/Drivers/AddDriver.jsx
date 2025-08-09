import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import apiClient from '../../apiClient';
// Custom icons with improved design
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

const AddDriver = () => {
  // State for form fields
  const [driverName, setDriverName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [idExpirationDate, setIdExpirationDate] = useState(null);
  const [licenseExpirationDate, setLicenseExpirationDate] = useState(null);
  const [safetyExpirationDate, setSafetyExpirationDate] = useState(null);
  const [drugTestExpirationDate, setDrugTestExpirationDate] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Format date for display
const formatDateDisplay = (date) => {
  if (!date) return ''; // handles null/undefined
  const parsedDate = date instanceof Date ? date : new Date(date);
  if (isNaN(parsedDate)) return ''; // handles invalid date strings
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Africa/Cairo'
  }).format(parsedDate);
};

  // Handle form submission
const handleSubmit = async () => {
  setFormTouched(true);

  // Validate form
  if (
    !driverName ||
    !licenseExpirationDate ||
    !safetyExpirationDate ||
    !drugTestExpirationDate
  ) {
    setError("Please fill in all required fields.");
    return;
  }
    const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  try {
    setLoading(true);
    setError("");

    // Prepare FormData
    const formData = new FormData();
    const requestData = {
        name: driverName,
        mobile_number: mobileNumber,
        id_license_expiration_date: formatDate(idExpirationDate),
        driver_license_expiration_date: formatDate(licenseExpirationDate),
        safety_license_expiration_date: formatDate(safetyExpirationDate),
        drug_test_expiration_date: formatDate(drugTestExpirationDate),
        transporter: "Apex"
      };

      formData.append('request', JSON.stringify(requestData));

    // API call
    const response = await apiClient.post(
      "/api/protected/RegisterDriver",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.data?.error) {
      setError(response.data.error);
      return;
    }

    // Reset form
    setDriverName("");
    setMobileNumber("");
    setIdExpirationDate(null);
    setLicenseExpirationDate(null);
    setSafetyExpirationDate(null);
    setDrugTestExpirationDate(null);
    setFormTouched(false);

    // Show success message
    setSuccess(true);
  } catch (err) {
    if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else {
      setError("An error occurred. Please try again.");
    }
    console.error("Error registering driver:", err);
  } finally {
    setLoading(false);
  }
};



  // Custom date picker input component with enhanced styling
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
          {value ? formatDateDisplay(value) : 'Select date'}
        </span>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">This field is required</p>
      )}
    </div>
  ));

  // Get minimum date (today)
  const today = new Date();
  
  // Get date range for year picker (current year to 10 years from now)
  const minYear = today.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => console.log('Navigate to home')}
                  className="mr-4 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeftIcon />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Add New Driver</h1>
                  <p className="text-gray-500 mt-1">Register a new driver in the system</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                <InfoIcon />
                <span className="text-sm text-blue-700">All fields marked with * are required</span>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-pulse">
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
                        placeholder="Enter phone number"
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
  {[
    {
      label: "Driving License Expiry",
      state: licenseExpirationDate,
      setState: setLicenseExpirationDate,
      required: true,
      error: formTouched && !licenseExpirationDate,
    },
    {
      label: "Driver ID Expiration",
      state: idExpirationDate,
      setState: setIdExpirationDate,
      required: false,
      error: false,
    },
    {
      label: "Safety Certificate Expiry",
      state: safetyExpirationDate,
      setState: setSafetyExpirationDate,
      required: true,
      error: formTouched && !safetyExpirationDate,
    },
    {
      label: "Drug Test Expiry",
      state: drugTestExpirationDate,
      setState: setDrugTestExpirationDate,
      required: true,
      error: formTouched && !drugTestExpirationDate,
    },
  ].map(({ label, state, setState, required, error }, idx) => (
    <DatePicker
      key={idx}
      selected={state}
      onChange={(date) => setState(date)}
      minDate={today}
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      yearDropdownItemNumber={10}
      scrollableYearDropdown
      dateFormat="MMM dd, yyyy"
      customInput={
        <CustomDateInput label={label} required={required} error={error} />
      }
    />
  ))}
</div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 sm:space-x-4 pt-6 border-t border-gray-200">
  {/* Cancel Button */}
  <button
    type="button"
    onClick={() => console.log('Cancel')}
    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
  >
    Cancel
  </button>

  {/* Primary Button */}
  <button
    type="button"
    onClick={handleSubmit}
    className={`px-5 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200
      ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
    disabled={loading}
  >
    {loading ? (
      <span className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
        Processing...
      </span>
    ) : (
      'Register Driver'
    )}
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
              <h3 className="mt-6 text-2xl font-bold text-gray-900">Success!</h3>
              <p className="mt-2 text-gray-600">Driver has been registered successfully</p>
              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    setSuccess(false);
                    console.log('Navigate to home');
                  }}
                >
                  Back to Dashboard
                </button>
                <button
                  type="button"
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setSuccess(false)}
                >
                  Add Another Driver
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

export default AddDriver;