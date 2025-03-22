import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SearchableDropdown from '../components/SearchableDropdown';

const EditOilChange = (props) => {
  const { oilChangeId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    carId: '',
    date: new Date(),
    driverName: '',
    odometerAtChange: '',
    currentOdometer: '',
    oilMileage: '',
    supervisor: '',
    cost: ''
  });
  
  const [originalOilChange, setOriginalOilChange] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [cars, setCars] = useState([]);
  const [carOptions, setCarOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch cars first
        const carsResponse = await apiClient.get('/api/GetCars');
        setCars(carsResponse.data);
        
        // Format the cars for use in the dropdown
        const options = carsResponse.data.map(car => ({
          value: car.ID,
          label: car.car_no_plate
        }));
        setCarOptions(options);
        
        // Then fetch the specific oil change
        const oilChangeResponse = await apiClient.get(`/api/GetOilChange/${oilChangeId}`);
        const oilChange = oilChangeResponse.data;
        
        setOriginalOilChange(oilChange);
        
        // Find the car that matches this oil change
        const car = carsResponse.data.find(c => c.car_no_plate === oilChange.car_no_plate);
        setSelectedCar(car);
        
        // Set form data
        setFormData({
          carId: car?.ID || '',
          date: new Date(oilChange.date),
          driverName: oilChange.driver_name,
          odometerAtChange: oilChange.odometer_at_change,
          currentOdometer: oilChange.current_odometer,
          oilMileage: oilChange.mileage,
          supervisor: oilChange.super_visor,
          cost: oilChange.cost
        });
      } catch (err) {
        setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [oilChangeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCarChange = (carId) => {
    const car = cars.find(c => c.ID === carId);
    setSelectedCar(car);
    setFormData(prev => ({
      ...prev,
      carId
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.carId || !formData.date || !formData.odometerAtChange || !formData.currentOdometer || !formData.oilMileage || !formData.supervisor) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const payload = {
        ID: parseInt(oilChangeId),
        car_id: parseInt(formData.carId),
        date: formData.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        super_visor: formData.supervisor,
        mileage: parseFloat(formData.oilMileage),
        odometer_at_change: parseFloat(formData.odometerAtChange),
        current_odometer: parseFloat(formData.currentOdometer),
        driver_name: formData.driverName,
        cost: parseFloat(formData.cost)
      };
      
      const response = await apiClient.post('/api/EditOilChange', payload);
      
      if (response.status === 200) {
        setShowSuccessModal(true);
      }
    } catch (err) {
      setError('Failed to update oil change: ' + (err.response?.data?.message || err.message));
      setShowErrorModal(true);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/oil-changes');
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !originalOilChange) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-600 text-xl mb-4">
          <svg className="h-20 w-20 text-red-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-center mt-4">{error}</p>
        </div>
        <button 
          onClick={() => navigate('/oil-changes')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Oil Changes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Edit Oil Change</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {error && !showErrorModal && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Car Selection */}
              <SearchableDropdown
                options={carOptions}
                value={formData.carId}
                onChange={handleCarChange}
                label="Car No Plate*"
                placeholder="Search for a car..."
              />
              
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.date}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Driver Name */}
              <div>
                <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Name *
                </label>
                <input
                  type="text"
                  id="driverName"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              {/* Supervisor */}
              <div>
                <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor *
                </label>
                <input
                  type="text"
                  id="supervisor"
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Odometer at Change */}
              <div>
                <label htmlFor="odometerAtChange" className="block text-sm font-medium text-gray-700 mb-2">
                  Odometer at Change *
                </label>
                <input
                  type="number"
                  id="odometerAtChange"
                  name="odometerAtChange"
                  value={formData.odometerAtChange}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  min="0"
                  required
                />
              </div>
              
              {/* Current Odometer */}
              <div>
                <label htmlFor="currentOdometer" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Odometer *
                </label>
                <input
                  type="number"
                  id="currentOdometer"
                  name="currentOdometer"
                  value={formData.currentOdometer}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  min={formData.odometerAtChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Oil Mileage */}
              <div>
                <label htmlFor="oilMileage" className="block text-sm font-medium text-gray-700 mb-2">
                  Oil Mileage *
                </label>
                <input
                  type="number"
                  id="oilMileage"
                  name="oilMileage"
                  value={formData.oilMileage}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  min="0"
                  required
                />
              </div>
              
              {/* Cost */}
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                  Cost *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    className="block w-full pl-7 pr-12 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                    step="0.01"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">USD</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Oil Change'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="bg-green-100 p-6">
              <div className="flex items-center justify-center">
                <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-900 text-center mt-4">Oil Change Updated Successfully</h3>
              <p className="text-sm text-green-700 text-center mt-2">The oil change record has been updated.</p>
            </div>
            <div className="bg-white px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleCloseSuccessModal}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="bg-red-100 p-6">
              <div className="flex items-center justify-center">
                <svg className="h-16 w-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-900 text-center mt-4">Error</h3>
              <p className="text-sm text-red-700 text-center mt-2">{error}</p>
            </div>
            <div className="bg-white px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleCloseErrorModal}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditOilChange;