// File: components/trips/ListActions.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const ListActions = ({ isLoading, isExporting, tripsCount, onExport }) => {
  const exportToExcel = async () => {
    const trips = await onExport();
    if (!trips.length) return;

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Trips');

    // Set columns with custom widths and header styling
    worksheet.columns = [
      { header: 'Receipt No', key: 'receipt_no', width: 12 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Company', key: 'company', width: 20 },
      { header: 'Terminal', key: 'terminal', width: 20 },
      { header: 'Drop-off Point', key: 'drop_off_point', width: 20 },
      { header: 'Tank Capacity', key: 'tank_capacity', width: 15 },
      { header: 'Driver', key: 'driver_name', width: 20 },
      { header: 'Car', key: 'car_no_plate', width: 15 },
      { header: 'Distance (km)', key: 'mileage', width: 15 },
      { header: 'Fee', key: 'fee', width: 12 }
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 20;
    headerRow.font = {
      name: 'Arial',
      size: 12,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '3B82F6' } // Blue color
    };
    headerRow.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };
    
    // Add borders to header cells
    headerRow.eachCell({ includeEmpty: true }, cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows with proper formatting
    trips.forEach(trip => {
      const row = worksheet.addRow({
        receipt_no: trip.receipt_no || '',
        date: trip.date || '',
        company: trip.company || '',
        terminal: trip.terminal || '',
        drop_off_point: trip.drop_off_point || '',
        tank_capacity: trip.tank_capacity || '',
        driver_name: trip.driver_name || '',
        car_no_plate: trip.car_no_plate || '',
        mileage: typeof trip.mileage === 'number' ? trip.mileage : (trip.mileage || ''),
        fee: typeof trip.fee === 'number' ? trip.fee : (trip.fee || '')
      });

      // Style data cells
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Add borders to all cells
        cell.border = {
          top: { style: 'thin', color: { argb: 'D1D5DB' } },
          left: { style: 'thin', color: { argb: 'D1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
          right: { style: 'thin', color: { argb: 'D1D5DB' } }
        };
        
        // Set alignment based on cell type
        if (colNumber === 1) { // Receipt No
          cell.alignment = { horizontal: 'center' };
        } else if (colNumber === 2) { // Date
          cell.alignment = { horizontal: 'center' };
        } else if (colNumber === 9 || colNumber === 10) { // Distance and Fee
          cell.alignment = { horizontal: 'right' };
          
          // Apply number formatting
          if (colNumber === 9 && typeof cell.value === 'number') {
            cell.numFmt = '#,##0.00';
          } else if (colNumber === 10 && typeof cell.value === 'number') {
            cell.numFmt = '#,##0.00';
          }
        } else {
          cell.alignment = { horizontal: 'left' };
        }
      });
    });

    // Apply zebra striping to rows
    const rowCount = worksheet.rowCount;
    for (let i = 2; i <= rowCount; i++) { // Start from 2 to skip header
      if (i % 2 === 0) { // Even rows
        const row = worksheet.getRow(i);
        row.eachCell({ includeEmpty: true }, cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F9FAFB' } // Light gray
          };
        });
      }
    }

    // Add a footer row with total count
    const footerRow = worksheet.addRow(['Total Trips:', trips.length]);
    footerRow.font = { bold: true };
    footerRow.getCell(1).alignment = { horizontal: 'right' };
    footerRow.getCell(2).alignment = { horizontal: 'left' };
    
    // Merge some cells in the footer for a cleaner look
    worksheet.mergeCells(`A${rowCount + 1}:B${rowCount + 1}`);
    
    // Add a border at the top of the footer
    footerRow.eachCell({ includeEmpty: true }, cell => {
      cell.border = {
        top: { style: 'medium' }
      };
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Create filename
    const fileName = `trips_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save file using file-saver
    saveAs(blob, fileName);
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