import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../apiClient';
import { debounce } from 'lodash';
import { Plus, Trash2, X, Package, Check, AlertCircle, Info } from 'lucide-react';

const MultiContainerTripForm = () => {
  const { parentId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!parentId;
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isMappingLoading, setIsMappingLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dropdown data
  const [companies, setCompanies] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [dropOffPoints, setDropOffPoints] = useState([]);
  const [filteredDropOffPoints, setFilteredDropOffPoints] = useState([]);
  const [mappingDetails, setMappingDetails] = useState({});
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  // Search filters
  const [carSearch, setCarSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [terminalSearch, setTerminalSearch] = useState('');
  const [dropOffSearch, setDropOffSearch] = useState('');
  
  // Pagination for drop-off points
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pointsPerPage = 15;
  
  // Dropdown visibility
  const [carDropdownVisible, setCarDropdownVisible] = useState(false);
  const [driverDropdownVisible, setDriverDropdownVisible] = useState(false);
  const [companyDropdownVisible, setCompanyDropdownVisible] = useState(false);
  const [terminalDropdownVisible, setTerminalDropdownVisible] = useState(false);
  
  // Unregistered flags
  const [isDriverUnregistered, setIsDriverUnregistered] = useState(false);
  const [unregisteredDropOffs, setUnregisteredDropOffs] = useState({});
  
  // Refs for dropdowns
  const carDropdownRef = useRef(null);
  const driverDropdownRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const terminalDropdownRef = useRef(null);
  
  // Parent trip data
  const [parentData, setParentData] = useState({
    car_id: '',
    driver_id: '',
    car_no_plate: '',
    driver_name: '',
    transporter: 'Apex',
    company: '',
    terminal: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  // Container data
  const [containers, setContainers] = useState([
    {
      id: null,
      drop_off_point: '',
      tank_capacity: 0,
      gas_type: '',
      receipt_no: '',
    }
  ]);
  
  // Active container for drop-off selection
  const [activeContainerIndex, setActiveContainerIndex] = useState(null);
  
  // Selected car data for capacity validation
  const [selectedCar, setSelectedCar] = useState(null);
  
  // Calculate total container capacity
  const totalContainerCapacity = useMemo(() => {
    return containers.reduce((sum, container) => {
      const capacity = parseFloat(container.tank_capacity) || 0;
      return sum + capacity;
    }, 0);
  }, [containers]);
  
  // Check if capacity matches
  const capacityValidation = useMemo(() => {
    if (!selectedCar || !selectedCar.tank_capacity) {
      return { isValid: true, message: '' };
    }
    
    const carCapacity = parseFloat(selectedCar.tank_capacity);
    const diff = Math.abs(totalContainerCapacity - carCapacity);
    
    if (diff === 0) {
      return { isValid: true, message: 'Capacity matches perfectly!' };
    } else if (diff < 0.01) {
      return { isValid: true, message: 'Capacity matches (minor rounding)' };
    } else {
      return {
        isValid: false,
        message: `Total containers (${totalContainerCapacity}L) must equal car capacity (${carCapacity}L). Difference: ${diff.toFixed(2)}L`
      };
    }
  }, [totalContainerCapacity, selectedCar]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (carDropdownRef.current && !carDropdownRef.current.contains(event.target)) {
        setCarDropdownVisible(false);
      }
      if (driverDropdownRef.current && !driverDropdownRef.current.contains(event.target)) {
        setDriverDropdownVisible(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setCompanyDropdownVisible(false);
      }
      if (terminalDropdownRef.current && !terminalDropdownRef.current.contains(event.target)) {
        setTerminalDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Debounced search for drop-off points
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      if (dropOffPoints.length > 0) {
        if (searchTerm.trim() === '') {
          setFilteredDropOffPoints(dropOffPoints.slice(0, pointsPerPage));
          setTotalPages(Math.ceil(dropOffPoints.length / pointsPerPage));
        } else {
          const filtered = dropOffPoints.filter(point => 
            point.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredDropOffPoints(filtered.slice(0, pointsPerPage));
          setTotalPages(Math.ceil(filtered.length / pointsPerPage));
        }
        setCurrentPage(1);
      }
    }, 300),
    [dropOffPoints, pointsPerPage]
  );
  
  useEffect(() => {
    debouncedSearch(dropOffSearch);
  }, [dropOffSearch, debouncedSearch]);
  
  // Update filtered points when page changes
  useEffect(() => {
    if (dropOffPoints.length > 0) {
      const startIndex = (currentPage - 1) * pointsPerPage;
      let filtered = dropOffPoints;
      
      if (dropOffSearch.trim() !== '') {
        filtered = dropOffPoints.filter(point => 
          point.toLowerCase().includes(dropOffSearch.toLowerCase())
        );
      }
      
      setFilteredDropOffPoints(filtered.slice(startIndex, startIndex + pointsPerPage));
      setTotalPages(Math.ceil(filtered.length / pointsPerPage));
    }
  }, [currentPage, dropOffPoints, dropOffSearch]);
  
  // Fetch initial data and existing trip if in edit mode
  useEffect(() => {
    fetchInitialData();
    if (isEditMode) {
      fetchExistingTrip();
    }
  }, []);
  
  // Fetch terminals when company changes
  useEffect(() => {
    if (parentData.company) {
      fetchTerminals(parentData.company);
    } else {
      setTerminals([]);
    }
  }, [parentData.company]);
  
  // Fetch drop-off points when terminal changes
  useEffect(() => {
    if (parentData.company && parentData.terminal) {
      fetchDropOffPointsWithMappings(parentData.company, parentData.terminal);
    } else {
      setDropOffPoints([]);
      setFilteredDropOffPoints([]);
      setMappingDetails({});
    }
  }, [parentData.company, parentData.terminal]);
  
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [companiesRes, carsRes, driversRes] = await Promise.allSettled([
        apiClient.get('/api/mappings/companies'),
        apiClient.get('/api/GetCars'),
        apiClient.get('/api/GetDrivers')
      ]);
      
      if (companiesRes.status === 'fulfilled') {
        setCompanies(companiesRes.value.data.data || []);
      }
      if (carsRes.status === 'fulfilled') {
        setCars(carsRes.value.data || []);
      }
      if (driversRes.status === 'fulfilled') {
        setDrivers(driversRes.value.data || []);
      }
    } catch (err) {
      setError('Failed to fetch initial data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchExistingTrip = async () => {
    setIsInitialLoading(true);
    try {
      const response = await apiClient.get(`/api/trips/parent/${parentId}/containers`);
      const { parent_trip, containers: existingContainers } = response.data;
      
      // Check if driver is unregistered
      const isUnregisteredDriver = parent_trip.driver_name === 'غير مسجل';
      setIsDriverUnregistered(isUnregisteredDriver);
      
      // Set parent data
      setParentData({
        car_id: parent_trip.car_id,
        driver_id: parent_trip.driver_id,
        car_no_plate: parent_trip.car_no_plate,
        driver_name: parent_trip.driver_name,
        transporter: parent_trip.transporter || 'Apex',
        company: parent_trip.company,
        terminal: parent_trip.terminal,
        date: parent_trip.date,
      });
      
      // Find and set selected car
      const car = cars.find(c => (c.ID || c.id) === parent_trip.car_id);
      if (car) {
        setSelectedCar(car);
      }
      
      // Set containers data and check for unregistered drop-offs
      const unregisteredMap = {};
      const containerData = existingContainers.map((c, idx) => {
        const isUnregistered = c.drop_off_point === 'غير مسجل';
        if (isUnregistered) {
          unregisteredMap[idx] = true;
        }
        return {
          id: c.ID,
          drop_off_point: c.drop_off_point,
          tank_capacity: c.tank_capacity,
          gas_type: c.gas_type,
          receipt_no: c.receipt_no,
        };
      });
      
      setContainers(containerData);
      setUnregisteredDropOffs(unregisteredMap);
      
    } catch (err) {
      setError('Failed to load trip data');
      console.error(err);
    } finally {
      setIsInitialLoading(false);
    }
  };
  
  const fetchTerminals = async (company) => {
    try {
      const response = await apiClient.get(`/api/mappings/terminals/${encodeURIComponent(company)}`);
      setTerminals(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch terminals:', err);
    }
  };
  
  const fetchDropOffPointsWithMappings = async (company, terminal) => {
    setIsMappingLoading(true);
    try {
      const response = await apiClient.get(
        `/api/mappings/dropoffs/${encodeURIComponent(company)}/${encodeURIComponent(terminal)}`
      );
      setDropOffPoints(response.data.data || []);
      setMappingDetails(response.data.mappings || {});
      setCurrentPage(1);
      setFilteredDropOffPoints((response.data.data || []).slice(0, pointsPerPage));
      setTotalPages(Math.ceil((response.data.data || []).length / pointsPerPage));
      setDropOffSearch('');
    } catch (err) {
      console.error('Failed to fetch drop-off points:', err);
    } finally {
      setIsMappingLoading(false);
    }
  };
  
  const handleCarSelect = (car) => {
    setSelectedCar(car);
    setParentData(prev => ({
      ...prev,
      car_id: car.ID || car.id,
      car_no_plate: car.car_no_plate,
    }));
    
    if (car.driver_id && car.driver_id !== 0) {
      const assignedDriver = drivers.find(d => 
        (d.ID === car.driver_id) || (d.id === car.driver_id)
      );
      if (assignedDriver) {
        setIsDriverUnregistered(false);
        setParentData(prev => ({
          ...prev,
          driver_id: assignedDriver.ID || assignedDriver.id,
          driver_name: assignedDriver.name || assignedDriver.driver_name
        }));
      }
    }
    
    setCarDropdownVisible(false);
    setCarSearch('');
  };
  
  const handleDriverSelect = (driver) => {
    if (driver === 'UNREGISTERED') {
      setIsDriverUnregistered(true);
      setParentData(prev => ({
        ...prev,
        driver_id: 0,
        driver_name: 'غير مسجل'
      }));
    } else {
      setIsDriverUnregistered(false);
      setParentData(prev => ({
        ...prev,
        driver_id: driver.ID || driver.id,
        driver_name: driver.name || driver.driver_name
      }));
    }
    setDriverDropdownVisible(false);
    setDriverSearch('');
  };
  
  const handleCompanySelect = (company) => {
    setParentData(prev => ({ 
      ...prev, 
      company,
      terminal: ''
    }));
    setContainers(containers.map(c => ({ ...c, drop_off_point: '' })));
    setUnregisteredDropOffs({});
    setCompanyDropdownVisible(false);
    setCompanySearch('');
  };
  
  const handleTerminalSelect = (terminal) => {
    setParentData(prev => ({ 
      ...prev, 
      terminal
    }));
    setContainers(containers.map(c => ({ ...c, drop_off_point: '' })));
    setUnregisteredDropOffs({});
    setTerminalDropdownVisible(false);
    setTerminalSearch('');
  };
  
  const addContainer = () => {
    if (containers.length < 4) {
      setContainers([...containers, {
        id: null,
        drop_off_point: '',
        tank_capacity: 0,
        gas_type: '',
        receipt_no: '',
      }]);
    }
  };
  
  const removeContainer = (index) => {
    if (containers.length > 1) {
      setContainers(containers.filter((_, i) => i !== index));
      
      // Update unregistered drop-offs mapping
      const newUnregistered = {};
      Object.keys(unregisteredDropOffs).forEach(key => {
        const idx = parseInt(key);
        if (idx < index) {
          newUnregistered[idx] = unregisteredDropOffs[idx];
        } else if (idx > index) {
          newUnregistered[idx - 1] = unregisteredDropOffs[idx];
        }
      });
      setUnregisteredDropOffs(newUnregistered);
      
      if (activeContainerIndex === index) {
        setActiveContainerIndex(null);
      } else if (activeContainerIndex > index) {
        setActiveContainerIndex(activeContainerIndex - 1);
      }
    }
  };
  
  const updateContainer = (index, field, value) => {
    const updated = [...containers];
    updated[index][field] = value;
    setContainers(updated);
  };
  
  const handleDropOffPointSelect = (point) => {
    if (activeContainerIndex !== null) {
      if (point === 'UNREGISTERED') {
        updateContainer(activeContainerIndex, 'drop_off_point', 'غير مسجل');
        setUnregisteredDropOffs(prev => ({
          ...prev,
          [activeContainerIndex]: true
        }));
      } else {
        updateContainer(activeContainerIndex, 'drop_off_point', point);
        setUnregisteredDropOffs(prev => ({
          ...prev,
          [activeContainerIndex]: false
        }));
      }
      setActiveContainerIndex(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!parentData.company || !parentData.terminal || !parentData.date) {
      setError('Please fill in company, terminal, and date');
      return;
    }
    
    if (!parentData.car_no_plate || !parentData.driver_name) {
      setError('Please select a car and driver');
      return;
    }
    
    // Validate capacity match
    if (!capacityValidation.isValid) {
      setError(capacityValidation.message);
      return;
    }
    
    // Validate all containers
    for (let i = 0; i < containers.length; i++) {
      if (!containers[i].drop_off_point) {
        setError(`Container ${i + 1}: Please select a drop-off point`);
        return;
      }
      if (!containers[i].receipt_no) {
        setError(`Container ${i + 1}: Please enter a receipt number`);
        return;
      }
      if (!containers[i].tank_capacity || containers[i].tank_capacity <= 0) {
        setError(`Container ${i + 1}: Please enter tank capacity`);
        return;
      }
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        parent_trip: {
          car_id: parseInt(parentData.car_id, 10),
          driver_id: isDriverUnregistered ? 0 : parseInt(parentData.driver_id, 10),
          car_no_plate: parentData.car_no_plate,
          driver_name: parentData.driver_name,
          transporter: 'Apex',
          company: parentData.company,
          terminal: parentData.terminal,
          date: parentData.date,
        },
        containers: containers.map(c => ({
          ...(c.id != null && { id: c.id }),
          drop_off_point: c.drop_off_point,
          tank_capacity: parseInt(c.tank_capacity, 10),
          gas_type: c.gas_type,
          receipt_no: c.receipt_no,
        })),
        update_containers: true
      };
      
      if (isEditMode) {
        await apiClient.put(`/api/trips/parent/${parentId}`, payload);
      } else {
        await apiClient.post('/api/trips/multi-container', payload);
      }
      
      navigate('/trips-list');
      
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} multi-container trip`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const filteredCars = useMemo(() => 
    cars.filter(car => 
      car.car_no_plate?.toLowerCase().includes(carSearch.toLowerCase()) ||
      (car.car_type && car.car_type.toLowerCase().includes(carSearch.toLowerCase()))
    ),
    [cars, carSearch]
  );
  
  const filteredDrivers = useMemo(() => 
    drivers.filter(driver => 
      (driver.name?.toLowerCase().includes(driverSearch.toLowerCase())) ||
      (driver.driver_name?.toLowerCase().includes(driverSearch.toLowerCase()))
    ),
    [drivers, driverSearch]
  );
  
  const filteredCompanies = useMemo(() => 
    companies.filter(company => 
      company.toLowerCase().includes(companySearch.toLowerCase())
    ),
    [companies, companySearch]
  );
  
  const filteredTerminals = useMemo(() => 
    terminals.filter(terminal => 
      terminal.toLowerCase().includes(terminalSearch.toLowerCase())
    ),
    [terminals, terminalSearch]
  );

  if (isInitialLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            <p className="mt-4 text-gray-600">Loading trip data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <Package className="mr-2" size={24} />
                {isEditMode ? 'Edit Multi-Container Trip' : 'Add Multi-Container Trip'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {isEditMode ? 'Update trip information and containers' : 'Fill up 1-4 containers in a single terminal visit'}
              </p>
            </div>
            <button
              onClick={() => navigate('/trips-list')}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {isLoading && !companies.length ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
              )}
              
              {/* Capacity Validation Warning/Success */}
              {selectedCar && selectedCar.tank_capacity && (
                <div className={`border-l-4 p-4 rounded ${
                  capacityValidation.isValid 
                    ? 'bg-green-100 border-green-500' 
                    : 'bg-yellow-100 border-yellow-500'
                }`}>
                  <div className="flex items-start">
                    {capacityValidation.isValid ? (
                      <Check className="text-green-600 mr-3 mt-0.5" size={20} />
                    ) : (
                      <AlertCircle className="text-yellow-600 mr-3 mt-0.5" size={20} />
                    )}
                    <div>
                      <p className={`font-medium ${
                        capacityValidation.isValid ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        Capacity Validation
                      </p>
                      <p className={capacityValidation.isValid ? 'text-green-700' : 'text-yellow-700'}>
                        {capacityValidation.message}
                      </p>
                      <p className="text-sm mt-1 text-gray-600">
                        Car capacity: {selectedCar.tank_capacity}L | Total containers: {totalContainerCapacity}L
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Common Trip Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  Common Trip Information
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trip Date *</label>
                  <input
                    type="date"
                    value={parentData.date}
                    onChange={(e) => setParentData({...parentData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              {/* Vehicle & Driver Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  Vehicle & Driver Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Car Selection */}
                  <div ref={carDropdownRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={carSearch}
                        onChange={(e) => setCarSearch(e.target.value)}
                        onFocus={() => setCarDropdownVisible(true)}
                        placeholder="Search for a vehicle..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setCarDropdownVisible(!carDropdownVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {carDropdownVisible && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto border border-gray-200">
                        {filteredCars.length > 0 ? (
                          filteredCars.map(car => (
                            <div
                              key={car.ID || car.id}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors"
                              onClick={() => handleCarSelect(car)}
                            >
                              <div className="font-medium">{car.car_no_plate}</div>
                              <div className="text-sm text-gray-500">
                                {car.car_type && `${car.car_type} • `}Capacity: {car.tank_capacity || 'N/A'}L
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No vehicles found</div>
                        )}
                      </div>
                    )}
                    
                    {parentData.car_no_plate && (
                      <div className="mt-2 text-sm text-blue-600 flex items-center">
                        <Check size={16} className="mr-1" />
                        Selected: {parentData.car_no_plate}
                        {selectedCar && selectedCar.tank_capacity && (
                          <span className="ml-2 text-gray-500">({selectedCar.tank_capacity}L)</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Driver Selection */}
                  <div ref={driverDropdownRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Driver *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={driverSearch}
                        onChange={(e) => setDriverSearch(e.target.value)}
                        onFocus={() => setDriverDropdownVisible(true)}
                        placeholder="Search for a driver..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setDriverDropdownVisible(!driverDropdownVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {driverDropdownVisible && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto border border-gray-200">
                        {/* Unregistered Driver Option */}
                        <div
                          className="px-4 py-2 hover:bg-orange-100 cursor-pointer transition-colors border-b border-gray-200 bg-orange-50"
                          onClick={() => handleDriverSelect('UNREGISTERED')}
                        >
                          <div className="font-medium text-orange-700 flex items-center">
                            <Info size={16} className="mr-2" />
                            غير مسجل (Unregistered)
                          </div>
                          <div className="text-sm text-orange-600">Driver not in system</div>
                        </div>
                        
                        {filteredDrivers.length > 0 ? (
                          filteredDrivers.map(driver => (
                            <div
                              key={driver.ID || driver.id}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors"
                              onClick={() => handleDriverSelect(driver)}
                            >
                              <div className="font-medium">{driver.name || driver.driver_name}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No drivers found</div>
                        )}
                      </div>
                    )}
                    
                    {parentData.driver_name && (
                      <div className={`mt-2 text-sm flex items-center ${
                        isDriverUnregistered ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        <Check size={16} className="mr-1" />
                        Selected: {parentData.driver_name}
                        {isDriverUnregistered && (
                          <span className="ml-2 text-xs bg-orange-100 px-2 py-0.5 rounded">Unregistered</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Plate Number</label>
                    <input 
                      type="text"
                      value={parentData.car_no_plate}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                    <input 
                      type="text"
                      value={parentData.driver_name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transporter</label>
                    <input 
                      type="text"
                      value="Apex"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              
              {/* Company and Terminal Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Route Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Selection */}
                  <div ref={companyDropdownRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        onFocus={() => setCompanyDropdownVisible(true)}
                        placeholder="Search for a company..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setCompanyDropdownVisible(!companyDropdownVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {companyDropdownVisible && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto border border-gray-200">
                        {filteredCompanies.length > 0 ? (
                          filteredCompanies.map((company, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors"
                              onClick={() => handleCompanySelect(company)}
                            >
                              {company}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No companies found</div>
                        )}
                      </div>
                    )}
                    
                    {parentData.company && (
                      <div className="mt-2 text-sm text-blue-600 flex items-center">
                        <Check size={16} className="mr-1" />
                        Selected: {parentData.company}
                      </div>
                    )}
                  </div>
                  
                  {/* Terminal Selection */}
                  <div ref={terminalDropdownRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terminal (Pickup Point) *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={terminalSearch}
                        onChange={(e) => setTerminalSearch(e.target.value)}
                        onFocus={() => parentData.company && terminals.length > 0 && setTerminalDropdownVisible(true)}
                        placeholder={
                          !parentData.company 
                            ? "Select a company first"
                            : terminals.length === 0
                              ? "No terminals available"
                              : "Search for a terminal..."
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!parentData.company || terminals.length === 0}
                      />
                      <button
                        type="button"
                        onClick={() => parentData.company && terminals.length > 0 && setTerminalDropdownVisible(!terminalDropdownVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 disabled:cursor-not-allowed"
                        disabled={!parentData.company || terminals.length === 0}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {terminalDropdownVisible && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto border border-gray-200">
                        {filteredTerminals.length > 0 ? (
                          filteredTerminals.map((terminal, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors"
                              onClick={() => handleTerminalSelect(terminal)}
                            >
                              {terminal}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No terminals found</div>
                        )}
                      </div>
                    )}
                    
                    {parentData.terminal && (
                      <div className="mt-2 text-sm text-blue-600 flex items-center">
                        <Check size={16} className="mr-1" />
                        Selected: {parentData.terminal}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Containers Section */}
              <div>
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Containers ({containers.length}/4)
                  </h3>
                  {containers.length < 4 && (
                    <button
                      type="button"
                      onClick={addContainer}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Container
                    </button>
                  )}
                </div>
                
                {/* Container Cards */}
                <div className="space-y-4">
                  {containers.map((container, index) => (
                    <div key={index} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-blue-900 flex items-center">
                          <Package className="mr-2" size={18} />
                          Container {index + 1}
                        </h4>
                        {containers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeContainer(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Remove container"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Receipt Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Receipt No *
                          </label>
                          <input
                            type="text"
                            value={container.receipt_no}
                            onChange={(e) => updateContainer(index, 'receipt_no', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter receipt number"
                            required
                          />
                        </div>
                        
                        {/* Tank Capacity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tank Capacity (Liters) *
                          </label>
                          <input
                            type="number"
                            value={container.tank_capacity}
                            onChange={(e) => updateContainer(index, 'tank_capacity', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter capacity"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        
                        {/* Gas Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gas Type
                          </label>
                          <input
                            type="text"
                            value={container.gas_type}
                            onChange={(e) => updateContainer(index, 'gas_type', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Diesel, Petrol"
                          />
                        </div>
                        
                        {/* Drop-off Point Selection Button */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Drop-off Point *
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (parentData.company && parentData.terminal) {
                                setActiveContainerIndex(index);
                              }
                            }}
                            disabled={!parentData.company || !parentData.terminal || isMappingLoading}
                            className={`w-full px-4 py-2 border rounded-md shadow-sm text-left ${
                              container.drop_off_point 
                                ? unregisteredDropOffs[index]
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-green-500 bg-green-50'
                                : 'border-gray-300 bg-white'
                            } ${
                              !parentData.company || !parentData.terminal || isMappingLoading
                                ? 'cursor-not-allowed bg-gray-100'
                                : 'hover:bg-blue-50 cursor-pointer'
                            } transition-colors`}
                          >
                            {isMappingLoading ? (
                              <span className="text-gray-500">Loading drop-off points...</span>
                            ) : container.drop_off_point ? (
                              <div>
                                <div className="font-medium text-gray-900 flex items-center">
                                  {container.drop_off_point}
                                  {unregisteredDropOffs[index] && (
                                    <span className="ml-2 text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded">
                                      Unregistered
                                    </span>
                                  )}
                                </div>
                                {mappingDetails[container.drop_off_point] && !unregisteredDropOffs[index] && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Distance: {mappingDetails[container.drop_off_point].distance}km • 
                                    Fee: {mappingDetails[container.drop_off_point].fee}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">
                                {!parentData.company || !parentData.terminal 
                                  ? 'Select company and terminal first' 
                                  : 'Click to select drop-off point'}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Show fee and distance if available */}
                      {container.drop_off_point && mappingDetails[container.drop_off_point] && !unregisteredDropOffs[index] && (
                        <div className="mt-4 bg-white rounded-md p-3 border border-blue-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-gray-600">Distance:</span>
                              <span className="ml-2 font-semibold text-blue-600">
                                {mappingDetails[container.drop_off_point].distance} km
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Fee:</span>
                              <span className="ml-2 font-semibold text-green-600">
                                {mappingDetails[container.drop_off_point].fee}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/trips-list')}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !capacityValidation.isValid}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2" size={18} />
                      {isEditMode ? 'Update Multi-Container Trip' : 'Create Multi-Container Trip'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Drop-off Point Selection Modal */}
      {activeContainerIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Select Drop-off Point for Container {activeContainerIndex + 1}
                </h3>
                <button
                  onClick={() => setActiveContainerIndex(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="mt-4">
                <input
                  type="text"
                  value={dropOffSearch}
                  onChange={(e) => setDropOffSearch(e.target.value)}
                  placeholder="Search drop-off points..."
                  className="w-full px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isMappingLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                  <p className="mt-4 text-gray-600">Loading drop-off points...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Unregistered Option */}
                  <div
                    onClick={() => handleDropOffPointSelect('UNREGISTERED')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      containers[activeContainerIndex].drop_off_point === 'غير مسجل'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-orange-700 flex items-center">
                          <Info size={18} className="mr-2" />
                          غير مسجل (Unregistered)
                        </div>
                        <div className="text-sm text-orange-600 mt-1">
                          Drop-off point not in system
                        </div>
                      </div>
                      {containers[activeContainerIndex].drop_off_point === 'غير مسجل' && (
                        <Check className="text-orange-600 ml-4" size={24} />
                      )}
                    </div>
                  </div>
                  
                  {/* Regular Drop-off Points */}
                  {filteredDropOffPoints.length > 0 ? (
                    filteredDropOffPoints.map((point, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleDropOffPointSelect(point)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          containers[activeContainerIndex].drop_off_point === point
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{point}</div>
                            {mappingDetails[point] && (
                              <div className="text-sm text-gray-600 mt-1">
                                Distance: {mappingDetails[point].distance}km • Fee: {mappingDetails[point].fee}
                              </div>
                            )}
                          </div>
                          {containers[activeContainerIndex].drop_off_point === point && (
                            <Check className="text-blue-600 ml-4" size={24} />
                          )}
                        </div>
                      </div>
                    ))
                  ) : dropOffSearch.trim() !== '' ? (
                    <div className="text-center py-12 text-gray-500">
                      No drop-off points found matching "{dropOffSearch}"
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No drop-off points available
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Modal Footer with Pagination */}
            {!isMappingLoading && filteredDropOffPoints.length > 0 && totalPages > 1 && (
              <div className="border-t px-6 py-4 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiContainerTripForm;