import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';
import { Printer, Plus, Trash2 } from 'lucide-react';

const TripReportGarage = () => {
  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  const [trips, setTrips] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: getYesterday(),
    endDate: getYesterday(),
    company: 'watanya'
  });
  const [submittedStatus, setSubmittedStatus] = useState({});
  const [customRows, setCustomRows] = useState([]);
  const [nextCustomId, setNextCustomId] = useState(-1);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (filters.company && filters.startDate && filters.endDate) {
      fetchTrips();
    }
  }, [filters]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get('/api/mappings/companies');
      setCompanies(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchTrips = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/api/trips/date', {
        params: {
          start_date: filters.startDate,
          end_date: filters.endDate,
          company: filters.company,
          page: 1,
          limit: 1000
        }
      });
      
      const fetchedTrips = response.data.data || [];
      setTrips(fetchedTrips);

      const initialStatus = {};
      fetchedTrips.forEach(trip => {
        initialStatus[trip.ID] = false;
      });
      setSubmittedStatus(prev => ({ ...prev, ...initialStatus }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmittedToggle = (tripId) => {
    setSubmittedStatus(prev => ({
      ...prev,
      [tripId]: !prev[tripId]
    }));
  };

  const handleAddRow = () => {
    const newRow = {
      ID: nextCustomId,
      receipt_no: '',
      driver_name: '',
      date: filters.startDate,
      car_no_plate: '',
      tank_capacity: '',
      isCustom: true
    };
    setCustomRows(prev => [...prev, newRow]);
    setSubmittedStatus(prev => ({ ...prev, [nextCustomId]: false }));
    setNextCustomId(prev => prev - 1);
  };

  const handleRemoveRow = (tripId) => {
    if (tripId < 0) {
      setCustomRows(prev => prev.filter(row => row.ID !== tripId));
    } else {
      setTrips(prev => prev.filter(trip => trip.ID !== tripId));
    }
    setSubmittedStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[tripId];
      return newStatus;
    });
  };

  const handleCustomRowChange = (tripId, field, value) => {
    setCustomRows(prev => prev.map(row => 
      row.ID === tripId ? { ...row, [field]: value } : row
    ));
  };

  const formatDateArabic = (dateString) => {
    if (!dateString) return 'غير متوفر';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateEnglish = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handlePrint = () => {
    const allRows = [...trips, ...customRows];
    const printWindow = window.open('', '_blank');
    const companyName = filters.company.charAt(0).toUpperCase() + filters.company.slice(1);
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير رحلات ${companyName}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Cairo', 'Arial', sans-serif; direction: rtl; padding: 15px; }
          .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #2563eb; padding-bottom: 12px; }
          .header h1 { color: #1e40af; font-size: 22px; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-size: 14px; }
          th { background-color: #f1f5f9; color: #1e40af; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .checkbox-cell { text-align: center; }
          .checkbox { width: 16px; height: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير رحلات شركة ${companyName}</h1>
        </div>
        <table>
          <thead>
            <tr>
              <th>رقم الإيصال</th>
              <th>اسم السائق</th>
              <th>التاريخ</th>
              <th>رقم اللوحة</th>
              <th>سعة الخزان</th>
              <th class="checkbox-cell">تم التسليم</th>
            </tr>
          </thead>
          <tbody>
            ${allRows.map(trip => `
              <tr>
                <td>${trip.receipt_no || 'غير متوفر'}</td>
                <td>${trip.driver_name || 'غير متوفر'}</td>
                <td>${formatDateArabic(trip.date)}</td>
                <td>${trip.car_no_plate || 'غير متوفر'}</td>
                <td>${trip.tank_capacity || 'غير متوفر'} لتر</td>
                <td class="checkbox-cell">
                  <input type="checkbox" class="checkbox" ${submittedStatus[trip.ID] ? 'checked' : ''} />
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const allRows = [...trips, ...customRows];
  const hasData = allRows.length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-white">Trip Report - Garage</h1>
            {hasData && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors font-medium shadow-sm"
              >
                <Printer size={18} />
                Print
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <select
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 capitalize"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company} value={company} className="capitalize">
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          {filters.company && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {hasData && `${allRows.length} trip${allRows.length !== 1 ? 's' : ''} (${trips.length} from database, ${customRows.length} custom)`}
              </div>
              <button
                onClick={handleAddRow}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                <Plus size={18} />
                Add Row
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Desktop Table */}
          {!isLoading && hasData && (
            <div className="hidden lg:block border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Receipt No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Driver Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Vehicle Plate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tank Capacity
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allRows.map((trip) => (
                    <tr key={trip.ID} className={`hover:bg-gray-50 transition-colors ${trip.isCustom ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-3 text-sm">
                        {trip.isCustom ? (
                          <input
                            type="text"
                            value={trip.receipt_no}
                            onChange={(e) => handleCustomRowChange(trip.ID, 'receipt_no', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Receipt No"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{trip.receipt_no || 'N/A'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {trip.isCustom ? (
                          <input
                            type="text"
                            value={trip.driver_name}
                            onChange={(e) => handleCustomRowChange(trip.ID, 'driver_name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Driver Name"
                          />
                        ) : (
                          <span className="text-gray-700">{trip.driver_name || 'N/A'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {trip.isCustom ? (
                          <input
                            type="date"
                            value={trip.date}
                            onChange={(e) => handleCustomRowChange(trip.ID, 'date', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-gray-700">{formatDateEnglish(trip.date)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {trip.isCustom ? (
                          <input
                            type="text"
                            value={trip.car_no_plate}
                            onChange={(e) => handleCustomRowChange(trip.ID, 'car_no_plate', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Plate No"
                          />
                        ) : (
                          <span className="text-gray-700">{trip.car_no_plate || 'N/A'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {trip.isCustom ? (
                          <input
                            type="number"
                            value={trip.tank_capacity}
                            onChange={(e) => handleCustomRowChange(trip.ID, 'tank_capacity', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Capacity"
                          />
                        ) : (
                          <span className="text-gray-700">{trip.tank_capacity || 'N/A'} L</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={submittedStatus[trip.ID] || false}
                          onChange={() => handleSubmittedToggle(trip.ID)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemoveRow(trip.ID)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Remove row"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile List */}
          {!isLoading && hasData && (
            <div className="lg:hidden space-y-3">
              {allRows.map((trip) => (
                <div key={trip.ID} className={`rounded-lg p-4 border ${trip.isCustom ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                  <div className="space-y-3">
                    {Object.entries({
                      'Receipt No': { field: 'receipt_no', type: 'text', placeholder: 'Receipt No' },
                      'Driver': { field: 'driver_name', type: 'text', placeholder: 'Driver Name' },
                      'Date': { field: 'date', type: 'date' },
                      'Vehicle Plate': { field: 'car_no_plate', type: 'text', placeholder: 'Plate No' },
                      'Tank Capacity': { field: 'tank_capacity', type: 'number', placeholder: 'Capacity', suffix: ' L' }
                    }).map(([label, config]) => (
                      <div key={label} className="flex justify-between items-center gap-3">
                        <span className="text-xs font-medium text-gray-600 min-w-[100px]">{label}:</span>
                        {trip.isCustom ? (
                          <input
                            type={config.type}
                            value={trip[config.field]}
                            onChange={(e) => handleCustomRowChange(trip.ID, config.field, e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder={config.placeholder}
                          />
                        ) : (
                          <span className="text-sm text-gray-900 text-right flex-1">
                            {config.field === 'date' ? formatDateEnglish(trip[config.field]) : (trip[config.field] || 'N/A')}
                            {config.suffix && trip[config.field] ? config.suffix : ''}
                          </span>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-between items-center gap-3 pt-2 border-t">
                      <span className="text-xs font-medium text-gray-600">Submitted:</span>
                      <input
                        type="checkbox"
                        checked={submittedStatus[trip.ID] || false}
                        onChange={() => handleSubmittedToggle(trip.ID)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveRow(trip.ID)}
                      className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md transition-colors text-sm font-medium mt-2"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty States */}
          {!isLoading && !hasData && filters.company && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">No trips found. Click "Add Row" to add entries.</p>
            </div>
          )}

          {!filters.company && !isLoading && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">Please select a company to view trips.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripReportGarage;