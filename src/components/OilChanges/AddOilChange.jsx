import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SearchableDropdown from '../SearchableDropdown';
import { 
  Calendar, 
  Car, 
  User, 
  DollarSign, 
  Gauge, 
  ArrowLeft, 
  Check, 
  AlertTriangle, 
  Save 
} from 'lucide-react';

const AddOilChange = (props) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    carId: '',
    date: new Date(),
    driverName: '',
    odometerAtChange: '',
    oilMileage: '',
    supervisor: '',
    cost: ''
  });
  
  const [selectedCar, setSelectedCar] = useState(null);
  const [cars, setCars] = useState([]);
  const [carOptions, setCarOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/GetCars');
      setCars(response.data);
      
      // Format the cars for use in the dropdown
      const options = response.data.map(car => ({
        value: car.ID,
        label: car.car_no_plate
      }));
      setCarOptions(options);
    } catch (err) {
      setError('Failed to fetch cars: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
    
    if (!formData.carId || !formData.date || !formData.odometerAtChange || !formData.oilMileage || !formData.supervisor) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const payload = {
        car_id: parseInt(formData.carId),
        date: formData.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        super_visor: formData.supervisor,
        mileage: parseInt(formData.oilMileage),
        odometer_at_change: parseInt(formData.odometerAtChange),
        current_odometer: parseInt(formData.odometerAtChange), // Initially same as odometer at change
        driver_name: formData.driverName,
        cost: parseFloat(formData.cost || 0)
      };
      
      const response = await apiClient.post('/api/CreateOilChange', payload);
      
      if (response.status === 200) {
        setShowSuccessModal(true);
        // Reset form
        setFormData({
          carId: selectedCar?.ID || '',
          date: new Date(),
          driverName: '',
          odometerAtChange: '',
          oilMileage: '',
          supervisor: '',
          cost: ''
        });
        setSelectedCar(null);
      }
    } catch (err) {
      setError('Failed to create oil change: ' + (err.response?.data?.message || err.message));
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

  const handleCancel = () => {
    navigate('/oil-changes');
  };

  if (isLoading && !cars.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-4">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={handleCancel} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Back to Oil Changes</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Gauge className="mr-3 text-blue-500" size={24} />
              Add Oil Change
            </h1>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {error && !showErrorModal && (
            <div className="flex items-start p-4 mb-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <AlertTriangle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle and Date Section */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Vehicle Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Car Selection */}
                <div className="space-y-1">
                  <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <Car className="mr-2 text-gray-500" size={18} />
                    Car No Plate*
                  </label>
                  <SearchableDropdown
                    options={carOptions}
                    value={formData.carId}
                    onChange={handleCarChange}
                    icon={Car}
                    placeholder="Search for a car..."
                  />
                </div>
                
                {/* Date Picker */}
                <div className="space-y-1">
                  <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <Calendar className="mr-2 text-gray-500" size={18} />
                    Date*
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.date}
                      onChange={handleDateChange}
                      dateFormat="yyyy-MM-dd"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personnel Section */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Personnel</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Driver Name */}
                <div className="space-y-1">
                  <label htmlFor="driverName" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <User className="mr-2 text-gray-500" size={18} />
                    Driver Name*
                  </label>
                  <input
                    type="text"
                    id="driverName"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Supervisor */}
                <div className="space-y-1">
                  <label htmlFor="supervisor" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <User className="mr-2 text-gray-500" size={18} />
                    Supervisor*
                  </label>
                  <input
                    type="text"
                    id="supervisor"
                    name="supervisor"
                    value={formData.supervisor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Maintenance Details */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Maintenance Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Odometer at Change */}
                <div className="space-y-1">
                  <label htmlFor="odometerAtChange" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <Gauge className="mr-2 text-gray-500" size={18} />
                    Odometer at Change*
                  </label>
                  <input
                    type="number"
                    id="odometerAtChange"
                    name="odometerAtChange"
                    value={formData.odometerAtChange}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
                
                {/* Oil Mileage */}
                <div className="space-y-1">
                  <label htmlFor="oilMileage" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <Gauge className="mr-2 text-gray-500" size={18} />
                    Oil Mileage*
                  </label>
                  <input
                    type="number"
                    id="oilMileage"
                    name="oilMileage"
                    value={formData.oilMileage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              {/* Cost */}
              <div className="space-y-1">
                <label htmlFor="cost" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <DollarSign className="mr-2 text-gray-500" size={18} />
                  Cost*
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    className="w-full pl-7 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-2">
              <button 
                type="button"
                onClick={handleCancel}
                className="py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-white border-white border-opacity-20 rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={20} />
                    Register Oil Change
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Oil Change Added Successfully</h3>
            <p className="text-center text-gray-600 mb-6">
              The oil change record has been created successfully.
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleCloseSuccessModal}
                className="py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                View Oil Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Error</h3>
            <p className="text-center text-gray-600 mb-6">
              {error}
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleCloseErrorModal}
                className="py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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

export default AddOilChange;