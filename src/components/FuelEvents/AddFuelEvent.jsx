import {useState, useEffect} from "react"
import { useNavigate} from 'react-router-dom';
import { Save, Calendar, Droplet, DollarSign, Gauge, Car, User, Check, AlertTriangle, ArrowLeft } from 'lucide-react';
import SearchableDropdown from "../SearchableDropdown"
import apiClient from '../../apiClient';

const AddFuelEvent = () => {
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [date, setDate] = useState(new Date());
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('15.6');
  const [odometerBefore, setOdometerBefore] = useState('');
  const [odometerAfter, setOdometerAfter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get cars
        const carsResponse = await apiClient.get(
          '/api/GetCars',
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 4000
          }
        );
        
        const carsData = carsResponse.data || [];
        setCars(carsData);
        if (carsData && carsData.length > 0) {
          setSelectedCar(carsData[0]);
          setOdometerBefore(carsData[0].last_fuel_odometer?.toString() || '');
        }
        
        // Get drivers
        const driversResponse = await apiClient.get(
          '/api/GetDrivers',
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 4000
          }
        );
        
        const driversData = driversResponse.data || [];
        setDrivers(driversData);
        if (driversData && driversData.length > 0) {
          setSelectedDriver(driversData[0]);
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!selectedCar || !selectedDriver || !date || !liters || !pricePerLiter || !odometerBefore || !odometerAfter) {
      alert('Please fill all required fields');
      return;
    }
    
    if (parseInt(odometerBefore) >= parseInt(odometerAfter)) {
      alert('Current odometer reading must be greater than previous reading');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await apiClient.post(
        '/api/protected/AddFuelEvent',
        {
          car_id: selectedCar.ID,
          date: date.toISOString().split('T')[0],
          liters: parseFloat(liters),
          price_per_liter: parseFloat(pricePerLiter),
          odometer_before: parseInt(odometerBefore),
          odometer_after: parseInt(odometerAfter),
          driver_name: selectedDriver.name
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );
      
      if (response.status === 200) {
        // Reset form
        setDate(new Date());
        setLiters('');
        setPricePerLiter('');
        setOdometerBefore('');
        setOdometerAfter('');
        
        // Show success dialog
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
  
  const handleCancel = () => {
    navigate('/');
  };
  
  // Get fuel efficiency color based on value (same as other components)
  const getEfficiencyColorClass = (rate) => {
    if (rate < 1.0 || rate > 3.2) return 'text-gray-400';
    if (rate < 1.8) return 'text-red-500';
    if (rate < 1.9) return 'text-orange-500';
    return 'text-green-500';
  };
  
  if (loading) {
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
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <p className="text-red-700 font-medium mb-2 text-xl">Error Loading Data</p>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-4">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={18} className="mr-2" />
              Return to Dashboard
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Prepare dropdown options
  const carOptions = cars.map(car => ({
    value: car.ID,
    label: car.car_no_plate
  }));
  
  const driverOptions = drivers.map(driver => ({
    value: driver.ID,
    label: driver.name
  }));
  
  // Calculate total price
  const totalPrice = !isNaN(parseFloat(liters)) && !isNaN(parseFloat(pricePerLiter)) 
    ? (parseFloat(liters) * parseFloat(pricePerLiter)).toFixed(2) 
    : '0.00';
    
  // Calculate distance and fuel rate
  const distance = !isNaN(parseInt(odometerAfter)) && !isNaN(parseInt(odometerBefore))
    ? parseInt(odometerAfter) - parseInt(odometerBefore)
    : 0;
    
  const fuelRate = distance > 0 && !isNaN(parseFloat(liters)) && parseFloat(liters) > 0
    ? (distance / parseFloat(liters)).toFixed(1)
    : '0.0';
    
  const fuelRateColorClass = getEfficiencyColorClass(parseFloat(fuelRate));
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={handleCancel} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Back to Dashboard</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Droplet className="mr-3 text-blue-500" size={24} />
              Add Fuel Event
            </h1>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vehicle and Driver Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Vehicle and Driver</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Car Selection */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Car className="mr-2 text-gray-500" size={18} />
                  Car No Plate*
                </label>
                <SearchableDropdown
                  options={carOptions}
                  value={selectedCar?.ID}
                  onChange={(value) => {
                    const selected = cars.find(car => car.ID === value);
                    setSelectedCar(selected);
                    setOdometerBefore(selected?.last_fuel_odometer?.toString() || '');
                  }}
                  icon={Car}
                  placeholder="Search for a car..."
                />
              </div>

              {/* Driver Selection */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <User className="mr-2 text-gray-500" size={18} />
                  Driver Name*
                </label>
                <SearchableDropdown
                  options={driverOptions}
                  value={selectedDriver?.ID}
                  onChange={(value) => {
                    const selected = drivers.find(driver => driver.ID === value);
                    setSelectedDriver(selected);
                  }}
                  icon={User}
                  placeholder="Search for a driver..."
                />
              </div>
            </div>
          </div>

          {/* Fuel Information Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Fuel Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Date Selection */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Calendar className="mr-2 text-gray-500" size={18} />
                  Date*
                </label>
                <input 
                  type="date" 
                  value={date.toISOString().split('T')[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Fuel Amount */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Droplet className="mr-2 text-gray-500" size={18} />
                  Liters*
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  placeholder="Enter liters"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Price per Liter */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <DollarSign className="mr-2 text-gray-500" size={18} />
                  Price per Liter*
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                  placeholder="Enter price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Total Price */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <DollarSign className="mr-2 text-gray-500" size={18} />
                  Total Price
                </label>
                <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium">
                  {totalPrice} EGP
                </div>
              </div>
              
              {/* Fuel Rate Calculation */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Gauge className="mr-2 text-gray-500" size={18} />
                  Fuel Rate
                </label>
                <div className={`w-full px-4 py-2 border border-gray-200 rounded-lg bg-white font-medium ${fuelRateColorClass}`}>
                  {fuelRate} km/L
                  {(parseFloat(fuelRate) < 1.0 || parseFloat(fuelRate) > 3.2) && parseFloat(fuelRate) !== 0 ? 
                    <span className="ml-2 text-xs italic">(excluded from avg)</span> : ''}
                </div>
              </div>
            </div>
          </div>
          
          {/* Odometer Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Odometer Readings</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Previous Odometer */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Gauge className="mr-2 text-gray-500" size={18} />
                  Previous Odometer*
                </label>
                <input
                  type="number"
                  value={odometerBefore}
                  onChange={(e) => setOdometerBefore(e.target.value)}
                  placeholder="Enter previous reading"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Current Odometer */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Gauge className="mr-2 text-gray-500" size={18} />
                  Current Odometer*
                </label>
                <input
                  type="number"
                  value={odometerAfter}
                  onChange={(e) => setOdometerAfter(e.target.value)}
                  placeholder="Enter current reading"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Distance */}
              <div className="space-y-1">
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Gauge className="mr-2 text-gray-500" size={18} />
                  Distance
                </label>
                <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium">
                  {distance} km
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
              disabled={submitting}
              className="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-white border-white border-opacity-20 rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={20} />
                  Save Fuel Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Fuel Event Added</h2>
            <p className="text-center text-gray-600 mb-6">
              The fuel event has been successfully recorded.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/');
                }}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Fuel Events
              </button>
              <button 
                onClick={() => {
                  setShowSuccess(false);
                  // Reset form and stay on the same page, but also reload car data
                  setLoading(true); // Show loading indicator
                  
                  // Reload car data to get updated odometer values
                  apiClient.get(
                    '/api/GetCars',
                    {
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      timeout: 4000
                    }
                  ).then(response => {
                    const carsData = response.data || [];
                    setCars(carsData);
                    if (carsData && carsData.length > 0) {
                      setSelectedCar(carsData[0]);
                      setOdometerBefore(carsData[0].last_fuel_odometer?.toString() || '');
                    }
                    setLoading(false);
                  }).catch(err => {
                    console.error(err);
                    setError("Failed to reload car data");
                    setLoading(false);
                  });
                  
                  // Reset other form fields
                  setSelectedDriver(drivers[0]);
                  setDate(new Date());
                  setLiters('');
                  setPricePerLiter('15.6');
                  setOdometerAfter('');
                }}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Add Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Error</h2>
            <p className="text-center text-gray-600 mb-6">
              Failed to add fuel event. Please check your inputs and try again.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setShowError(false)}
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

export default AddFuelEvent;