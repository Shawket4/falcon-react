import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Simple SVG icons
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const AddCar = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [carPlateNo, setCarPlateNo] = useState('');
  const [compartments, setCompartments] = useState([
    { size: '' },
    { size: '' },
    { size: '' },
    { size: '' }
  ]);
  const [licenseExpirationDate, setLicenseExpirationDate] = useState(null);
  const [calibrationExpirationDate, setCalibrationExpirationDate] = useState(null);
  const [carType, setCarType] = useState('No Trailer');
  const [tankLicenseExpirationDate, setTankLicenseExpirationDate] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [permission, setPermission] = useState(1);

  // Load user permission and transporters on component mount
  useEffect(() => {
    const userPermission = localStorage.getItem('permission') || '1';
    setPermission(parseInt(userPermission, 10));
  }, []);

  // Format date for API submission
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Update compartment size
  const handleCompartmentChange = (index, value) => {
    const newCompartments = [...compartments];
    newCompartments[index].size = value;
    setCompartments(newCompartments);
  };

  // Calculate total tank capacity
  const calculateTankCapacity = () => {
    return compartments.reduce((total, comp) => {
      return total + (comp.size ? parseInt(comp.size, 10) : 0);
    }, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!carPlateNo || !licenseExpirationDate || !calibrationExpirationDate ||
        (carType === 'Trailer' && !tankLicenseExpirationDate)) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      
      // Create request object
      const requestData = {
        car_no_plate: carPlateNo,
        tank_capacity: calculateTankCapacity(),
        car_type: carType,
        transporter: "Apex",
        compartments: compartments
          .filter(comp => comp.size)
          .map(comp => parseInt(comp.size, 10)),
        license_expiration_date: formatDate(licenseExpirationDate),
        calibration_expiration_date: formatDate(calibrationExpirationDate),
        tank_license_expiration_date: carType === 'Trailer' 
          ? formatDate(tankLicenseExpirationDate) 
          : ''
      };
      
      formData.append('request', JSON.stringify(requestData));
      
      // Send request using apiClient
      const response = await apiClient.post('/api/RegisterCar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200) {
        // Reset form
        setCarPlateNo('');
        setCompartments([
          { size: '' },
          { size: '' },
          { size: '' },
          { size: '' }
        ]);
        setLicenseExpirationDate(null);
        setCalibrationExpirationDate(null);
        setCarType('No Trailer');
        setTankLicenseExpirationDate(null);
        
        // Show success message
        setSuccess(true);
      } else {
        setError('Failed to register car. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error registering car:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom date picker input component
  const CustomDateInput = ({ value, onClick, label }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div 
        className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        onClick={onClick}
      >
        <CalendarIcon />
        <span className={`${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value ? value : 'Select date'}
        </span>
      </div>
    </div>
  );
  

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Add Car</h1>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <XCircleIcon />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold text-gray-700 mb-2 mt-4">Car Details</h2>
          <div className="border-b border-gray-200 mb-6"></div>
          
          {/* Transporter selection for high permission levels */}
          {permission > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Type*
                </label>
                <select
                  value={carType}
                  onChange={(e) => setCarType(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="No Trailer">No Trailer</option>
                  <option value="Trailer">Trailer</option>
                </select>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Car Plate Number*
              </label>
              <input
                type="text"
                value={carPlateNo}
                onChange={(e) => setCarPlateNo(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Compartment Sizes */}
          {compartments.map((comp, index) => (
  <div key={index}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Compartment {index + 1} Size
    </label>
    <input
      type="number"
      value={comp.size}
      onChange={(e) => handleCompartmentChange(index, e.target.value)}
      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      placeholder="Enter size"
      required={index === 0}
    />
  </div>
))}
            
            <div>
              <DatePicker
                selected={licenseExpirationDate}
                onChange={(date) => setLicenseExpirationDate(date)}
                customInput={<CustomDateInput label="Car License Expiry*" />}
              />
            </div>
            
            <div>
              <DatePicker
                selected={calibrationExpirationDate}
                onChange={(date) => setCalibrationExpirationDate(date)}
                customInput={<CustomDateInput label="Calibration License Expiry*" />}
              />
            </div>
            
            {carType === 'Trailer' && (
              <div>
                <DatePicker
                  selected={tankLicenseExpirationDate}
                  onChange={(date) => setTankLicenseExpirationDate(date)}
                  customInput={<CustomDateInput label="Tank License Expiry*" />}
                />
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className={`px-6 py-3 bg-blue-600 text-white rounded-md font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                'Register Car'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <CheckIcon />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Car Registered Successfully</h3>
              <div className="mt-6">
                <button
                  type="button"
                  className="w-full inline-flex justify-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    setSuccess(false);
                    navigate('/');
                  }}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCar;