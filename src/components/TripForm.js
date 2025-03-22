import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { debounce } from 'lodash'; // Import lodash for debouncing

const TripForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isMappingLoading, setIsMappingLoading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [dropOffPoints, setDropOffPoints] = useState([]);
  const [filteredDropOffPoints, setFilteredDropOffPoints] = useState([]);
  const [mappingDetails, setMappingDetails] = useState({});
  
  // Cars and drivers state
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
  const pointsPerPage = 15; // Show 15 points per page
  
  // Dropdown visibility state
  const [carDropdownVisible, setCarDropdownVisible] = useState(false);
  const [driverDropdownVisible, setDriverDropdownVisible] = useState(false);
  const [companyDropdownVisible, setCompanyDropdownVisible] = useState(false);
  const [terminalDropdownVisible, setTerminalDropdownVisible] = useState(false);
  
  // Refs for dropdown containers
  const carDropdownRef = useRef(null);
  const driverDropdownRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const terminalDropdownRef = useRef(null);

  const [tripData, setTripData] = useState({
    car_id: '',
    driver_id: '',
    car_no_plate: '',
    driver_name: '',
    transporter: 'Apex', // Hardcoded as requested
    tank_capacity: 0,
    company: '',
    terminal: '',
    drop_off_point: '',
    gas_type: '',
    date: new Date().toISOString().split('T')[0], // Current date by default
    receipt_no: '',
    revenue: 0,
    mileage: 0
  });

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search function for drop-off points
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      if (dropOffPoints.length > 0) {
        if (searchTerm.trim() === '') {
          // No search term, show all drop-off points (paginated)
          setFilteredDropOffPoints(dropOffPoints.slice(0, pointsPerPage));
          setTotalPages(Math.ceil(dropOffPoints.length / pointsPerPage));
        } else {
          // Filter by search term
          const filtered = dropOffPoints.filter(point => 
            point.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredDropOffPoints(filtered.slice(0, pointsPerPage));
          setTotalPages(Math.ceil(filtered.length / pointsPerPage));
        }
        setCurrentPage(1);
      }
    }, 300), // 300ms debounce time
    [dropOffPoints, pointsPerPage]
  );

  // Filter drop-off points when search changes
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

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData();
    if (id) {
      fetchTrip(id);
    }
  }, [id]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch companies using our API
      const companiesResponse = await apiClient.get('/api/mappings/companies');
      setCompanies(companiesResponse.data.data || []);
      
      // Fetch car and driver data in parallel
      const [carsResponse, driversResponse] = await Promise.allSettled([
        apiClient.get('/api/GetCars'),
        apiClient.get('/api/GetDrivers')
      ]);
      
      if (carsResponse.status === 'fulfilled') {
        setCars(carsResponse.value.data || []);
      } else {
        console.error('Failed to fetch cars:', carsResponse.reason);
        setCars([]);
      }
      
      if (driversResponse.status === 'fulfilled') {
        setDrivers(driversResponse.value.data || []);
      } else {
        console.error('Failed to fetch drivers:', driversResponse.reason);
        setDrivers([]);
      }
    } catch (err) {
      setError('Failed to fetch initial data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update terminals when company is selected
  useEffect(() => {
    if (!tripData.company) {
      setTerminals([]);
      return;
    }

    fetchTerminals(tripData.company);
  }, [tripData.company]);

  // Update drop-off points when terminal is selected
  useEffect(() => {
    if (!tripData.company || !tripData.terminal) {
      setDropOffPoints([]);
      setFilteredDropOffPoints([]);
      setMappingDetails({});
      return;
    }

    fetchDropOffPointsWithMappings(tripData.company, tripData.terminal);
  }, [tripData.company, tripData.terminal]);

  const fetchTerminals = async (company) => {
    try {
      const response = await apiClient.get(`/api/mappings/terminals/${encodeURIComponent(company)}`);
      setTerminals(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch terminals');
      console.error(err);
    }
  };

  // New optimized function to fetch drop-off points along with their mappings
  const fetchDropOffPointsWithMappings = async (company, terminal) => {
    setIsMappingLoading(true);
    try {
      const response = await apiClient.get(`/api/mappings/dropoffs/${encodeURIComponent(company)}/${encodeURIComponent(terminal)}`);
      
      // Extract data
      const points = response.data.data || [];
      const mappings = response.data.mappings || {};
      
      // Update state
      setDropOffPoints(points);
      setMappingDetails(mappings);
      setCurrentPage(1);
      
      // Only show first page initially
      setFilteredDropOffPoints(points.slice(0, pointsPerPage));
      setTotalPages(Math.ceil(points.length / pointsPerPage));
      setDropOffSearch(''); // Reset search when drop-off points change
    } catch (err) {
      setError('Failed to fetch drop-off points');
      console.error(err);
    } finally {
      setIsMappingLoading(false);
    }
  };

  const fetchTrip = async (tripId) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/api/trips/${tripId}`);
      const trip = response.data.data;
      
      setTripData({
        ...trip,
        transporter: 'Apex' // Ensure transporter is always 'Apex'
      });
      
      // When editing, we need to load the dependent dropdowns
      if (trip.company) {
        await fetchTerminals(trip.company);
        if (trip.terminal) {
          await fetchDropOffPointsWithMappings(trip.company, trip.terminal);
        }
      }
    } catch (err) {
      setError('Failed to fetch trip details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle car selection
  const handleCarSelect = (car) => {
    setTripData(prev => ({
      ...prev,
      car_id: car.ID || car.id,
      car_no_plate: car.car_no_plate,
      tank_capacity: car.tank_capacity || 0
    }));
    setCarDropdownVisible(false);
    setCarSearch('');
  };

  // Handle driver selection
  const handleDriverSelect = (driver) => {
    setTripData(prev => ({
      ...prev,
      driver_id: driver.ID || driver.id,
      driver_name: driver.name || driver.driver_name
    }));
    setDriverDropdownVisible(false);
    setDriverSearch('');
  };

  // Handle company selection
  const handleCompanySelect = (company) => {
    setTripData(prev => ({ 
      ...prev, 
      company,
      terminal: '',
      drop_off_point: '',
      revenue: 0,
      mileage: 0
    }));
    setCompanyDropdownVisible(false);
    setCompanySearch('');
  };

  // Handle terminal selection
  const handleTerminalSelect = (terminal) => {
    setTripData(prev => ({ 
      ...prev, 
      terminal,
      drop_off_point: '',
      revenue: 0,
      mileage: 0
    }));
    setTerminalDropdownVisible(false);
    setTerminalSearch('');
  };

  // Handle drop-off point selection
  const handleDropOffPointSelect = (point) => {
    // Get the fee and distance from mapping details
    const details = mappingDetails[point] || { fee: 0, distance: 0 };
    
    setTripData(prev => ({
      ...prev,
      drop_off_point: point,
      revenue: details.fee,
      mileage: details.distance
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripData({ ...tripData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tripData.company || !tripData.terminal || !tripData.drop_off_point) {
      setError('Please select a company, terminal, and a drop-off location');
      return;
    }
    
    if (!tripData.car_no_plate || !tripData.driver_name) {
      setError('Please select a car and driver');
      return;
    }
    
    if (!tripData.receipt_no) {
      setError('Receipt number is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Format the data for submission
      const dataToSubmit = {
        ...tripData,
        car_id: parseInt(tripData.car_id, 10),
        driver_id: parseInt(tripData.driver_id, 10),
        tank_capacity: parseInt(tripData.tank_capacity, 10),
        revenue: parseFloat(tripData.revenue),
        mileage: parseFloat(tripData.mileage),
        transporter: 'Apex' // Ensure transporter is always 'Apex'
      };
      
      // Ensure these are valid numbers and not NaN
      if (isNaN(dataToSubmit.car_id)) dataToSubmit.car_id = 0;
      if (isNaN(dataToSubmit.driver_id)) dataToSubmit.driver_id = 0;
      if (isNaN(dataToSubmit.tank_capacity)) dataToSubmit.tank_capacity = 0;
      if (isNaN(dataToSubmit.revenue)) dataToSubmit.revenue = 0;
      if (isNaN(dataToSubmit.mileage)) dataToSubmit.mileage = 0;
      
      if (id) {
        await apiClient.put(`/api/trips/${id}`, dataToSubmit);
      } else {
        await apiClient.post(`/api/trips`, dataToSubmit);
      }
      
      navigate('/trips-list');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Filter cars by search query
  const filteredCars = cars.filter(car => 
    car.car_no_plate?.toLowerCase().includes(carSearch.toLowerCase()) || 
    (car.car_type && car.car_type.toLowerCase().includes(carSearch.toLowerCase()))
  );

  // Filter drivers by search query
  const filteredDrivers = drivers.filter(driver => 
    (driver.name && driver.name.toLowerCase().includes(driverSearch.toLowerCase())) ||
    (driver.driver_name && driver.driver_name.toLowerCase().includes(driverSearch.toLowerCase()))
  );

  // Filter companies by search query
  const filteredCompanies = companies.filter(company => 
    company.toLowerCase().includes(companySearch.toLowerCase())
  );

  // Filter terminals by search query
  const filteredTerminals = terminals.filter(terminal => 
    terminal.toLowerCase().includes(terminalSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-xl font-bold text-white">{id ? 'Edit Trip' : 'Add New Trip'}</h2>
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
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                  <p>{error}</p>
                </div>
              )}
              
              {/* Receipt Number - First field */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Trip Information</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number *</label>
                  <input
                    type="text"
                    name="receipt_no"
                    value={tripData.receipt_no}
                    onChange={handleChange}
                    placeholder="Enter receipt number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trip Date</label>
                  <input 
                    type="date"
                    name="date"
                    value={tripData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              {/* Vehicle & Driver Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Vehicle & Driver Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Car Selection */}
                  <div ref={carDropdownRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle</label>
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
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto">
                        {filteredCars.length > 0 ? (
                          filteredCars.map(car => (
                            <div
                              key={car.ID || car.id}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                              onClick={() => handleCarSelect(car)}
                            >
                              <div className="font-medium">{car.car_no_plate}</div>
                              <div className="text-sm text-gray-500">
                                {car.car_type && `${car.car_type} • `}Capacity: {car.tank_capacity || 'N/A'}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No vehicles found</div>
                        )}
                      </div>
                    )}
                    
                    {tripData.car_no_plate && (
                      <div className="mt-2 text-sm text-blue-600">
                        Selected: {tripData.car_no_plate}
                      </div>
                    )}
                  </div>
                  
                  {/* Driver Selection */}
                  <div ref={driverDropdownRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Driver</label>
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
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto">
                        {filteredDrivers.length > 0 ? (
                          filteredDrivers.map(driver => (
                            <div
                              key={driver.ID || driver.id}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
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
                    
                    {tripData.driver_name && (
                      <div className="mt-2 text-sm text-blue-600">
                        Selected: {tripData.driver_name}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Plate Number (Auto-filled)</label>
                    <input 
                      type="text"
                      value={tripData.car_no_plate}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                    <input 
                      type="text"
                      value={tripData.driver_name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tank Capacity</label>
                    <input 
                      type="number"
                      name="tank_capacity"
                      value={tripData.tank_capacity}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transporter</label>
                    <input 
                      type="text"
                      value="Apex"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Company and Terminal Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Route Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Company Selection */}
                  <div ref={companyDropdownRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
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
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto">
                        {filteredCompanies.length > 0 ? (
                          filteredCompanies.map((company, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
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
                    
                    {tripData.company && (
                      <div className="mt-2 text-sm text-blue-600">
                        Selected: {tripData.company}
                      </div>
                    )}
                  </div>
                  
                  {/* Terminal Selection */}
                  <div ref={terminalDropdownRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terminal (Pickup Point)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={terminalSearch}
                        onChange={(e) => setTerminalSearch(e.target.value)}
                        onFocus={() => tripData.company && terminals.length > 0 && setTerminalDropdownVisible(true)}
                        placeholder={
                          !tripData.company 
                            ? "Select a company first" 
                            : terminals.length === 0 
                              ? "No terminals available" 
                              : "Search for a terminal..."
                        }
                        disabled={!tripData.company || terminals.length === 0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => tripData.company && terminals.length > 0 && setTerminalDropdownVisible(!terminalDropdownVisible)}
                        disabled={!tripData.company || terminals.length === 0}
                        className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 disabled:text-gray-400"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {terminalDropdownVisible && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto">
                        {filteredTerminals.length > 0 ? (
                          filteredTerminals.map((terminal, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
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
                    
                    {tripData.terminal && (
                      <div className="mt-2 text-sm text-blue-600">
                        Selected: {tripData.terminal}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drop-off Locations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Drop-off Location</h3>
                <p className="text-sm text-gray-600 mb-4">Select a drop-off location for this trip.</p>
                
                {/* Drop-off Search Bar */}
                {dropOffPoints.length > 0 && (
                  <div className="mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="search"
                        placeholder="Search drop-off points..."
                        value={dropOffSearch}
                        onChange={(e) => setDropOffSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
                
                {isMappingLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                    <p className="mt-4 text-gray-600">Loading locations...</p>
                  </div>
                ) : !tripData.company || !tripData.terminal ? (
                  <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-md">
                    Select a company and terminal to view drop-off locations
                  </div>
                ) : dropOffPoints.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-md">
                    No drop-off locations available for this terminal
                  </div>
                ) : filteredDropOffPoints.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-md">
                    No drop-off locations match your search
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDropOffPoints.map((point) => {
                        const details = mappingDetails[point] || { fee: 0, distance: 0 };
                        return (
                          <div
                            key={point}
                            onClick={() => handleDropOffPointSelect(point)}
                            className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                              tripData.drop_off_point === point 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-900">{point}</h4>
                                <input 
                                  type="radio"
                                  checked={tripData.drop_off_point === point}
                                  onChange={() => {}} // Handled by the div click
                                  onClick={e => e.stopPropagation()}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-gray-100 p-2 rounded">
                                  <span className="text-gray-500">Fee:</span> {details.fee?.toFixed(2) || "0.00"}
                                </div>
                                <div className="bg-gray-100 p-2 rounded">
                                  <span className="text-gray-500">Distance:</span> {details.distance?.toFixed(2) || "0.00"} km
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center mt-6 space-x-4">
                        <button 
                          onClick={handlePrevPage} 
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <div className="text-gray-700">
                          Page {currentPage} of {totalPages}
                        </div>
                        <button 
                          onClick={handleNextPage} 
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Auto-calculated fields */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Generated Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Revenue (Auto-calculated)</label>
                    <input 
                      type="text"
                      value={parseFloat(tripData.revenue).toFixed(2)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (Auto-calculated)</label>
                    <input 
                      type="text"
                      value={parseFloat(tripData.mileage).toFixed(2)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoading || !tripData.company || !tripData.terminal || !tripData.drop_off_point || !tripData.car_no_plate || !tripData.driver_name || !tripData.receipt_no}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {id ? 'Updating Trip...' : 'Creating Trip...'}
                  </>
                ) : (
                  <>
                    <svg className="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {id ? 'Update Trip' : 'Create Trip'}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Copyright footer */}
      <div className="py-3 px-6 mt-6 bg-white border border-gray-200 rounded-md text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Shawket Ibrahim. All rights reserved.
      </div>
    </div>
  );
};

export default TripForm;