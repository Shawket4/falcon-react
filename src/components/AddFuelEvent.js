import {useState, useEffect} from "react"
import { useNavigate} from 'react-router-dom';
import { Save, Calendar, Droplet, DollarSign, Gauge, Car, User, X, Check, AlertTriangle } from 'lucide-react';
import SearchableDropdown from "./SearchableDropdown"
import apiClient from '../apiClient';

const AddFuelEvent = () => {
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [date, setDate] = useState(new Date());
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('13.6');
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-center">
        <AlertTriangle className="mr-2" />
        <div>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
          >
            Try Again
          </button>
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
    ? (distance / parseFloat(liters)).toFixed(2)
    : '0.00';
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Add Fuel Event</h1>
          <button 
            onClick={handleCancel}
            className="text-gray-300 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vehicle Section */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Car Selection */}
            <SearchableDropdown
              options={carOptions}
              value={selectedCar?.ID}
              onChange={(value) => {
                const selected = cars.find(car => car.ID === value);
                setSelectedCar(selected);
                setOdometerBefore(selected?.last_fuel_odometer?.toString() || '');
              }}
              icon={Car}
              label="Car No Plate*"
              placeholder="Search for a car..."
            />

            {/* Driver Selection */}
            <SearchableDropdown
              options={driverOptions}
              value={selectedDriver?.ID}
              onChange={(value) => {
                const selected = drivers.find(driver => driver.ID === value);
                setSelectedDriver(selected);
              }}
              icon={User}
              label="Driver Name*"
              placeholder="Search for a driver..."
            />
          </div>

          {/* Date Selection */}
          <div className="flex flex-col">
            <label className="flex items-center mb-2 text-gray-700">
              <Calendar className="mr-2 text-gray-500" size={20} />
              Date*
            </label>
            <input 
              type="date" 
              value={date.toISOString().split('T')[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fuel Information Section */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Liters */}
            <div className="flex flex-col">
              <label className="flex items-center mb-2 text-gray-700">
                <Droplet className="mr-2 text-gray-500" size={20} />
                Liters*
              </label>
              <input
                type="number"
                step="0.01"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                placeholder="Enter liters"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price per Liter */}
            <div className="flex flex-col">
              <label className="flex items-center mb-2 text-gray-700">
                <DollarSign className="mr-2 text-gray-500" size={20} />
                Price per Liter*
              </label>
              <input
                type="number"
                step="0.01"
                value={pricePerLiter}
                onChange={(e) => setPricePerLiter(e.target.value)}
                placeholder="Enter price"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Total Price */}
            <div className="flex flex-col">
              <label className="flex items-center mb-2 text-gray-700">
                <DollarSign className="mr-2 text-gray-500" size={20} />
                Total Price
              </label>
              <input
                type="text"
                value={`${totalPrice} EGP`}
                disabled
                className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Odometer Section */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Previous Odometer */}
            <div className="flex flex-col">
              <label className="flex items-center mb-2 text-gray-700">
                <Gauge className="mr-2 text-gray-500" size={20} />
                Previous Odometer*
              </label>
              <input
                type="number"
                value={odometerBefore}
                onChange={(e) => setOdometerBefore(e.target.value)}
                placeholder="Enter previous reading"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Current Odometer */}
            <div className="flex flex-col">
              <label className="flex items-center mb-2 text-gray-700">
                <Gauge className="mr-2 text-gray-500" size={20} />
                Current Odometer*
              </label>
              <input
                type="number"
                value={odometerAfter}
                onChange={(e) => setOdometerAfter(e.target.value)}
                placeholder="Enter current reading"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Distance */}
            <div className="flex flex-col">
              <label className="flex items-center mb-2 text-gray-700">
                <Gauge className="mr-2 text-gray-500" size={20} />
                Distance
              </label>
              <input
                type="text"
                value={`${distance} km`}
                disabled
                className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Fuel Rate */}
          <div className="flex flex-col">
            <label className="flex items-center mb-2 text-gray-700">
              <Gauge className="mr-2 text-gray-500" size={20} />
              Fuel Rate
            </label>
            <input
              type="text"
              value={`${fuelRate} km/L`}
              disabled
              className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-between space-x-4">
            <button 
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Save className="mr-2" size={20} />
              {submitting ? 'Submitting...' : 'Save Fuel Event'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
          <div className="flex items-center justify-center mb-4">
              <Check className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-center mb-4">Fuel Event Added</h2>
            <p className="text-center text-gray-600 mb-6">
              The fuel event has been successfully recorded.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/');
                }}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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
                  setPricePerLiter('13.6');
                  setOdometerAfter('');
                }}
                className="flex-1 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Add Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              <X className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-center mb-4">Error</h2>
            <p className="text-center text-gray-600 mb-6">
              Failed to add fuel event. Please check your inputs and try again.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setShowError(false)}
                className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
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