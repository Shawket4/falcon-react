// File: components/trips/ListActions.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

const ListActions = ({ isLoading, isExporting, tripsCount, onExport }) => {
  const exportToExcel = async () => {
    const trips = await onExport();
    if (!trips.length) return;

    // Format data for Excel
    const worksheet = XLSX.utils.json_to_sheet(
      trips.map(trip => ({
        'Receipt No': trip.receipt_no || '',
        'Date': trip.date || '',
        'Company': trip.company || '',
        'Terminal': trip.terminal || '',
        'Drop-off Point': trip.drop_off_point || '',
        'Tank Capacity': trip.tank_capacity || '',
        'Driver': trip.driver_name || '',
        'Car': trip.car_no_plate || '',
        'Distance (km)': typeof trip.mileage === 'number' ? trip.mileage.toFixed(2) : trip.mileage || '',
        'Fee': typeof trip.fee === 'number' ? trip.fee : trip.fee || ''
      }))
    );

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Receipt No
      { wch: 12 }, // Date
      { wch: 20 }, // Company
      { wch: 20 }, // Terminal
      { wch: 20 }, // Drop-off Point
      { wch: 15 }, // Tank Capacity
      { wch: 20 }, // Driver
      { wch: 15 }, // Car
      { wch: 15 }, // Distance
      { wch: 12 }  // Fee
    ];
    
    worksheet['!cols'] = columnWidths;

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trips');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const fileName = `trips_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Create a temporary download link and trigger the download
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 sticky top-0 bg-white z-10 pb-2">
      <div className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-0">
        {isLoading ? 'Loading trips...' : (
          tripsCount > 0 ? `Showing ${tripsCount} trips` : 'No trips found'
        )}
      </div>
      <div className="flex flex-wrap gap-2 justify-end">
        <button
          onClick={exportToExcel}
          disabled={isExporting}
          className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 flex-1 sm:flex-none"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </>
          )}
        </button>
        <Link
          to="/add-trip"
          className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 sm:flex-none"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Trip
        </Link>
      </div>
    </div>
  );
};

export default ListActions;