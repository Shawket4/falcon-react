import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  Save, Calendar, Droplet, DollarSign, Gauge, Car, User, 
  Check, AlertTriangle, ArrowLeft, TrendingUp, Info, X 
} from 'lucide-react';
import SearchableDropdown from "../SearchableDropdown";
import apiClient from '../../apiClient';

const AddFuelEvent = () => {
  const navigate = useNavigate();
  
  // Core data states
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  // Form states
  const [formData, setFormData] = useState({
    selectedCar: null,
    selectedDriver: null,
    date: new Date().toISOString().split('T')[0],
    liters: '',
    pricePerLiter: '15.6',
    odometerBefore: '',
    odometerAfter: ''
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Calculations
  const calculations = useMemo(() => {
    const litersNum = parseFloat(formData.liters) || 0;
    const priceNum = parseFloat(formData.pricePerLiter) || 0;
    const odometerBeforeNum = parseInt(formData.odometerBefore) || 0;
    const odometerAfterNum = parseInt(formData.odometerAfter) || 0;
    
    const totalPrice = (litersNum * priceNum).toFixed(2);
    const distance = Math.max(0, odometerAfterNum - odometerBeforeNum);
    const fuelRate = litersNum > 0 ? (distance / litersNum).toFixed(1) : '0.0';
    
    return { totalPrice, distance, fuelRate };
  }, [formData.liters, formData.pricePerLiter, formData.odometerBefore, formData.odometerAfter]);
  
  // Get efficiency color and status
  const getEfficiencyStatus = useCallback((rate) => {
    const rateNum = parseFloat(rate);
    if (rateNum < 1.0 || rateNum > 3.2) {
      return { color: 'text-gray-400', bg: 'bg-gray-50', status: 'Excluded', icon: '⚠️' };
    }
    if (rateNum < 1.8) {
      return { color: 'text-red-500', bg: 'bg-red-50', status: 'Poor', icon: '😟' };
    }
    if (rateNum < 1.9) {
      return { color: 'text-orange-500', bg: 'bg-orange-50', status: 'Average', icon: '😐' };
    }
    return { color: 'text-green-500', bg: 'bg-green-50', status: 'Good', icon: '😊' };
  }, []);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [carsResponse, driversResponse] = await Promise.all([
          apiClient.get('/api/GetCars', {
            headers: { 'Content-Type': 'application/json' },
            timeout: 4000
          }),
          apiClient.get('/api/GetDrivers', {
            headers: { 'Content-Type': 'application/json' },
            timeout: 4000
          })
        ]);
        
        const carsData = carsResponse.data || [];
        const driversData = driversResponse.data || [];
        
        setCars(carsData);
        setDrivers(driversData);
        
        // Set initial car and driver
        if (carsData.length > 0) {
          const firstCar = carsData[0];
          const assignedDriver = firstCar.driver_id && firstCar.driver_id !== 0
            ? driversData.find(d => d.ID === firstCar.driver_id) || driversData[0]
            : driversData[0];
          
          setFormData(prev => ({
            ...prev,
            selectedCar: firstCar,
            selectedDriver: assignedDriver,
            odometerBefore: firstCar.last_fuel_odometer?.toString() || ''
          }));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle car selection change
  const handleCarChange = useCallback((carId) => {
    const selected = cars.find(car => car.ID === carId);
    if (!selected) return;
    
    // Auto-set driver based on car's driver_id
    const assignedDriver = selected.driver_id && selected.driver_id !== 0
      ? drivers.find(d => d.ID === selected.driver_id) || drivers.find(d => d.ID === 1) || drivers[0]
      : drivers.find(d => d.ID === 1) || drivers[0];
    
    setFormData(prev => ({
      ...prev,
      selectedCar: selected,
      selectedDriver: assignedDriver,
      odometerBefore: selected.last_fuel_odometer?.toString() || ''
    }));
    
    // Clear validation errors
    setValidationErrors({});
  }, [cars, drivers]);
  
  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.selectedCar) errors.car = 'Please select a car';
    if (!formData.selectedDriver) errors.driver = 'Please select a driver';
    if (!formData.date) errors.date = 'Please select a date';
    if (!formData.liters || parseFloat(formData.liters) <= 0) {
      errors.liters = 'Please enter a valid amount';
    }
    if (!formData.pricePerLiter || parseFloat(formData.pricePerLiter) <= 0) {
      errors.pricePerLiter = 'Please enter a valid price';
    }
    if (!formData.odometerBefore) errors.odometerBefore = 'Please enter previous reading';
    if (!formData.odometerAfter) errors.odometerAfter = 'Please enter current reading';
    
    const odometerBeforeNum = parseInt(formData.odometerBefore);
    const odometerAfterNum = parseInt(formData.odometerAfter);
    
    if (odometerBeforeNum >= odometerAfterNum) {
      errors.odometerAfter = 'Current reading must be greater than previous';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-field');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await apiClient.post('/api/protected/AddFuelEvent', {
        car_id: formData.selectedCar.ID,
        date: formData.date,
        liters: parseFloat(formData.liters),
        price_per_liter: parseFloat(formData.pricePerLiter),
        odometer_before: parseInt(formData.odometerBefore),
        odometer_after: parseInt(formData.odometerAfter),
        driver_name: formData.selectedDriver.name
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 4000
      });
      
      if (response.status === 200) {
        setShowSuccess(true);
      } else {
        setShowError(true);
      }
    } catch (err) {
      console.error(err);
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle adding another fuel event
  const handleAddAnother = async () => {
    setShowSuccess(false);
    setLoading(true);
    
    try {
      const response = await apiClient.get('/api/GetCars', {
        headers: { 'Content-Type': 'application/json' },
        timeout: 4000
      });
      
      const carsData = response.data || [];
      setCars(carsData);
      
      if (carsData.length > 0) {
        const firstCar = carsData[0];
        const assignedDriver = firstCar.driver_id && firstCar.driver_id !== 0
          ? drivers.find(d => d.ID === firstCar.driver_id) || drivers[0]
          : drivers[0];
        
        setFormData({
          selectedCar: firstCar,
          selectedDriver: assignedDriver,
          date: new Date().toISOString().split('T')[0],
          liters: '',
          pricePerLiter: '15.6',
          odometerBefore: firstCar.last_fuel_odometer?.toString() || '',
          odometerAfter: ''
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reload data");
    } finally {
      setLoading(false);
    }
  };
  
  // Update form field
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-gray-600 font-medium mt-4">Loading data...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !cars.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-red-500 mb-4 flex justify-center">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button 
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              onClick={() => navigate('/')}
            >
              Back
            </button>
            <button 
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const efficiencyStatus = getEfficiencyStatus(calculations.fuelRate);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Mobile-optimized Header */}
        <div className="mb-4 md:mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors touch-target"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="text-sm md:text-base">Back</span>
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center">
              <Droplet className="mr-3" size={24} />
              Add Fuel Event
            </h1>
            <p className="text-blue-100 mt-1 text-sm md:text-base">Record a new fuel transaction</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Vehicle & Driver Section - Mobile optimized */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-6 border border-gray-200">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
                <Car className="mr-2 text-blue-600" size={20} />
                Vehicle & Driver
              </h2>
              
              <div className="space-y-4">
                {/* Car Selection */}
                <div className={validationErrors.car ? 'error-field' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Car Number Plate*
                  </label>
                  <SearchableDropdown
                    options={cars.map(car => ({
                      value: car.ID,
                      label: car.car_no_plate
                    }))}
                    value={formData.selectedCar?.ID}
                    onChange={handleCarChange}
                    icon={Car}
                    placeholder="Select a car..."
                  />
                  {validationErrors.car && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.car}</p>
                  )}
                </div>
                
                {/* Driver Selection - Auto-populated */}
                <div className={validationErrors.driver ? 'error-field' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver* 
                    {formData.selectedCar?.driver_id && formData.selectedCar.driver_id !== 0 && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">
                        (Auto-assigned)
                      </span>
                    )}
                  </label>
                  <SearchableDropdown
                    options={drivers.map(driver => ({
                      value: driver.ID,
                      label: driver.name
                    }))}
                    value={formData.selectedDriver?.ID}
                    onChange={(value) => {
                      const selected = drivers.find(d => d.ID === value);
                      updateField('selectedDriver', selected);
                    }}
                    icon={User}
                    placeholder="Select a driver..."
                  />
                  {validationErrors.driver && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.driver}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Fuel Information - Mobile optimized grid */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-200">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
                <Droplet className="mr-2 text-blue-600" size={20} />
                Fuel Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div className={validationErrors.date ? 'error-field' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline mr-1" size={16} />
                    Date*
                  </label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                  {validationErrors.date && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.date}</p>
                  )}
                </div>
                
                {/* Liters */}
                <div className={validationErrors.liters ? 'error-field' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Droplet className="inline mr-1" size={16} />
                    Liters*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.liters}
                    onChange={(e) => updateField('liters', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                  {validationErrors.liters && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.liters}</p>
                  )}
                </div>
                
                {/* Price per Liter */}
                <div className={validationErrors.pricePerLiter ? 'error-field' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="inline mr-1" size={16} />
                    Price/Liter (EGP)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerLiter}
                    onChange={(e) => updateField('pricePerLiter', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                  {validationErrors.pricePerLiter && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.pricePerLiter}</p>
                  )}
                </div>
                
                {/* Total Price - Calculated */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="inline mr-1" size={16} />
                    Total Price
                  </label>
                  <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 text-sm md:text-base">
                    {calculations.totalPrice} EGP
                  </div>
                </div>
              </div>
            </div>
            
            {/* Odometer Section - Mobile optimized */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-green-200">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
                <Gauge className="mr-2 text-green-600" size={20} />
                Odometer Readings
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Previous Reading */}
                <div className={validationErrors.odometerBefore ? 'error-field' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Reading (km)*
                  </label>
                  <input
                    type="number"
                    value={formData.odometerBefore}
                    onChange={(e) => updateField('odometerBefore', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                  {validationErrors.odometerBefore && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.odometerBefore}</p>
                  )}
                </div>
                
                {/* Current Reading */}
                <div className={validationErrors.odometerAfter ? 'error-field' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Reading (km)*
                  </label>
                  <input
                    type="number"
                    value={formData.odometerAfter}
                    onChange={(e) => updateField('odometerAfter', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                  {validationErrors.odometerAfter && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.odometerAfter}</p>
                  )}
                </div>
              </div>
              
              {/* Distance & Fuel Efficiency Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {/* Distance Card */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Distance Traveled</p>
                  <p className="text-xl font-bold text-gray-800">{calculations.distance} km</p>
                </div>
                
                {/* Fuel Efficiency Card */}
                <div className={`rounded-lg p-3 border ${efficiencyStatus.bg}`}>
                  <p className="text-xs text-gray-500 mb-1">Fuel Efficiency</p>
                  <div className="flex items-center justify-between">
                    <p className={`text-xl font-bold ${efficiencyStatus.color}`}>
                      {calculations.fuelRate} km/L
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{efficiencyStatus.icon}</span>
                      <span className={`text-xs font-medium ${efficiencyStatus.color}`}>
                        {efficiencyStatus.status}
                      </span>
                    </div>
                  </div>
                  {(parseFloat(calculations.fuelRate) < 1.0 || parseFloat(calculations.fuelRate) > 3.2) && parseFloat(calculations.fuelRate) !== 0 && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Info size={12} className="mr-1" />
                      Excluded from average
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Form Actions - Sticky on mobile */}
            <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 border-t md:border-0">
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 sm:flex-none sm:px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm md:text-base"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm md:text-base"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-white border-white/20 rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={18} />
                    Save Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Success Modal - Mobile optimized */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Success!</h2>
            <p className="text-center text-gray-600 mb-6">
              Fuel event has been recorded successfully.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/');
                }}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                View All Events
              </button>
              <button 
                onClick={handleAddAnother}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium text-sm"
              >
                Add Another
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Modal - Mobile optimized */}
      {showError && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-red-100 to-pink-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Error</h2>
            <p className="text-center text-gray-600 mb-6">
              Failed to save fuel event. Please check your connection and try again.
            </p>
            <button 
              onClick={() => setShowError(false)}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFuelEvent;