import React from 'react';
import { Link } from 'react-router-dom';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Download, Plus } from 'lucide-react';

const ListActions = ({ isLoading, isExporting, tripsCount, onExport }) => {
  const exportToExcel = async () => {
    const trips = await onExport();
    if (!trips.length) return;

    // Sort trips for better organization
    trips.sort((a, b) => {
      const dateCompare = (b.date || '').localeCompare(a.date || '');
      if (dateCompare !== 0) return dateCompare;
      
      const companyCompare = (a.company || '').localeCompare(b.company || '');
      if (companyCompare !== 0) return companyCompare;
      
      return (a.receipt_no || '').localeCompare(b.receipt_no || '');
    });

    const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = 'Trip Management System';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    const worksheet = workbook.addWorksheet('Trip Data', {
      pageSetup: { 
        paperSize: 9, 
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
      }
    });

    // Define columns - REMOVED: Parent Trip ID, Trip Type, Receipt Status
    worksheet.columns = [
      { header: 'Receipt No', key: 'receipt_no', width: 15 },
      { header: 'Date', key: 'date', width: 13 },
      { header: 'Company', key: 'company', width: 22 },
      { header: 'Terminal', key: 'terminal', width: 22 },
      { header: 'Drop-off Point', key: 'drop_off_point', width: 24 },
      { header: 'Car Number', key: 'car_no_plate', width: 15 },
      { header: 'Driver Name', key: 'driver_name', width: 22 },
      { header: 'Tank Capacity (L)', key: 'tank_capacity', width: 17 },
      { header: 'Distance (km)', key: 'distance', width: 15 },
      { header: 'Fee', key: 'fee', width: 13 },
      { header: 'In Garage', key: 'in_garage', width: 13 },
      { header: 'In Office', key: 'in_office', width: 13 },
      { header: 'Garage Received By', key: 'garage_received_by', width: 20 },
      { header: 'Garage Date', key: 'garage_date', width: 18 },
      { header: 'Office Received By', key: 'office_received_by', width: 20 },
      { header: 'Office Date', key: 'office_date', width: 18 },
      { header: 'Stamped', key: 'stamped', width: 12 },
    ];

    // Add data rows
    trips.forEach(trip => {
      let inGarage = 'No';
      let inOffice = 'No';
      let garageReceivedBy = '';
      let garageDate = '';
      let officeReceivedBy = '';
      let officeDate = '';
      let garageStep = null;
      let officeStep = null;
      
      if (trip.receipt_steps && trip.receipt_steps.length > 0) {
        garageStep = trip.receipt_steps.find(s => s.location === 'Garage');
        officeStep = trip.receipt_steps.find(s => s.location === 'Office');
        
        if (garageStep) {
          inGarage = 'Yes';
          garageReceivedBy = garageStep.received_by || '';
          garageDate = garageStep.received_at ? new Date(garageStep.received_at).toLocaleString() : '';
        }

        if (officeStep) {
          inOffice = 'Yes';
          officeReceivedBy = officeStep.received_by || '';
          officeDate = officeStep.received_at ? new Date(officeStep.received_at).toLocaleString() : '';
        }
      }

      worksheet.addRow({
        receipt_no: trip.receipt_no || '',
        date: trip.date || '',
        company: trip.company || '',
        terminal: trip.terminal || '',
        drop_off_point: trip.drop_off_point || '',
        car_no_plate: trip.car_no_plate || '',
        driver_name: trip.driver_name || '',
        tank_capacity: trip.tank_capacity || '',
        distance: trip.mileage || trip.distance || '',
        fee: trip.fee || '',
        in_garage: inGarage,
        in_office: inOffice,
        garage_received_by: garageReceivedBy,
        garage_date: garageDate,
        office_received_by: officeReceivedBy,
        office_date: officeDate,
        stamped: (garageStep?.stamped || officeStep?.stamped) ? 'Yes' : 'No'
      });
    });

    // REVAMPED STYLING - Modern, professional design
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.font = {
      name: 'Arial',
      size: 12,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F2937' } // Dark gray (gray-800)
    };
    headerRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    headerRow.border = {
      top: { style: 'medium', color: { argb: '111827' } },
      left: { style: 'medium', color: { argb: '111827' } },
      bottom: { style: 'medium', color: { argb: '111827' } },
      right: { style: 'medium', color: { argb: '111827' } }
    };

    // Style data rows with modern design
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const isEven = rowNumber % 2 === 0;
      const fillColor = isEven ? 'F3F4F6' : 'FFFFFF'; // Lighter alternating rows

      row.height = 22;
      
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Fill
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor }
        };

        // Border - subtle borders
        cell.border = {
          top: { style: 'thin', color: { argb: 'D1D5DB' } },
          left: { style: 'thin', color: { argb: 'D1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
          right: { style: 'thin', color: { argb: 'D1D5DB' } }
        };

        // Font - Modern, clean
        cell.font = {
          name: 'Arial',
          size: 10,
          color: { argb: '1F2937' }
        };

        // Alignment based on column content
        // Receipt No (1), Date (2), Car Number (6), Tank Capacity (8), Distance (9), Fee (10), In Garage (11), In Office (12), Stamped (17)
        if ([1, 2, 6, 8, 9, 10, 11, 12, 17].includes(colNumber)) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
          // Left align text fields
          cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        }

        // Number formatting
        if (colNumber === 8 && cell.value && !isNaN(cell.value)) {
          // Tank Capacity
          cell.numFmt = '#,##0';
        } else if (colNumber === 9 && cell.value && !isNaN(cell.value)) {
          // Distance
          cell.numFmt = '#,##0.00';
        } else if (colNumber === 10 && cell.value && !isNaN(cell.value)) {
          // Fee
          cell.numFmt = '#,##0.00';
        }

        // Conditional formatting for Yes/No columns (In Garage, In Office, Stamped)
        if ([11, 12, 17].includes(colNumber)) {
          if (cell.value === 'Yes') {
            cell.font = { 
              ...cell.font, 
              color: { argb: '10B981' }, // Green-500
              bold: true 
            };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: isEven ? 'ECFDF5' : 'F0FDF4' } // Light green tint
            };
          } else if (cell.value === 'No') {
            cell.font = { 
              ...cell.font, 
              color: { argb: 'EF4444' } // Red-500
            };
          }
        }
      });
    });

    // Freeze header row and first column
    worksheet.views = [
      { state: 'frozen', xSplit: 1, ySplit: 1 }
    ];

    // Add autofilter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columnCount }
    };

    // Add a modern summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    // Calculate summary statistics
    const totalTrips = trips.length;
    const companies = [...new Set(trips.map(t => t.company))];
    const inGarageCount = trips.filter(t => 
      t.receipt_steps?.some(s => s.location === 'Garage')
    ).length;
    const inOfficeCount = trips.filter(t => 
      t.receipt_steps?.some(s => s.location === 'Office')
    ).length;
    const stampedCount = trips.filter(t => 
      t.receipt_steps?.some(s => s.stamped === true)
    ).length;
    const totalVolume = trips.reduce((sum, t) => sum + (parseFloat(t.tank_capacity) || 0), 0);
    const totalDistance = trips.reduce((sum, t) => sum + (parseFloat(t.mileage || t.distance) || 0), 0);
    const totalFees = trips.reduce((sum, t) => sum + (parseFloat(t.fee) || 0), 0);

    // Title
    summarySheet.mergeCells('A1:C1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'Trip Export Summary Report';
    titleCell.font = { 
      name: 'Arial', 
      size: 18, 
      bold: true, 
      color: { argb: '1F2937' } 
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F3F4F6' }
    };
    summarySheet.getRow(1).height = 35;

    // Export info
    summarySheet.getCell('A3').value = 'Export Date:';
    summarySheet.getCell('B3').value = new Date().toLocaleString();
    summarySheet.getCell('A4').value = 'Generated By:';
    summarySheet.getCell('B4').value = 'Trip Management System';

    // Summary statistics
    const summaryData = [
      ['OVERVIEW', '', ''],
      ['Total Trips:', totalTrips, ''],
      ['Unique Companies:', companies.length, ''],
      ['Total Volume (Liters):', totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 }), 'L'],
      ['Total Distance:', totalDistance.toLocaleString(undefined, { maximumFractionDigits: 2 }), 'km'],
      ['Total Fees:', totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), ''],
      ['', '', ''],
      ['RECEIPT TRACKING', '', ''],
      ['Receipts in Garage:', inGarageCount, `${((inGarageCount / totalTrips) * 100).toFixed(1)}%`],
      ['Receipts in Office:', inOfficeCount, `${((inOfficeCount / totalTrips) * 100).toFixed(1)}%`],
      ['Stamped Receipts:', stampedCount, `${((stampedCount / totalTrips) * 100).toFixed(1)}%`],
      ['', '', ''],
      ['COMPANY BREAKDOWN', '', ''],
    ];

    let currentRow = 6;
    summaryData.forEach((row) => {
      summarySheet.getCell(`A${currentRow}`).value = row[0];
      summarySheet.getCell(`B${currentRow}`).value = row[1];
      summarySheet.getCell(`C${currentRow}`).value = row[2];
      
      // Style section headers
      if (row[0].includes('OVERVIEW') || row[0].includes('RECEIPT') || row[0].includes('COMPANY')) {
        summarySheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const headerCell = summarySheet.getCell(`A${currentRow}`);
        headerCell.font = { 
          name: 'Arial', 
          size: 12, 
          bold: true, 
          color: { argb: 'FFFFFF' } 
        };
        headerCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4B5563' }
        };
        headerCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        summarySheet.getRow(currentRow).height = 25;
      } else if (row[0].endsWith(':')) {
        // Style labels
        summarySheet.getCell(`A${currentRow}`).font = { 
          name: 'Arial', 
          size: 10, 
          bold: true 
        };
        summarySheet.getCell(`B${currentRow}`).font = { 
          name: 'Arial', 
          size: 10 
        };
        summarySheet.getCell(`C${currentRow}`).font = { 
          name: 'Arial', 
          size: 10,
          italic: true,
          color: { argb: '6B7280' }
        };
      }
      
      currentRow++;
    });

    // Add company details
    companies.sort().forEach((company) => {
      const companyTrips = trips.filter(t => t.company === company);
      summarySheet.getCell(`A${currentRow}`).value = company;
      summarySheet.getCell(`B${currentRow}`).value = companyTrips.length;
      summarySheet.getCell(`C${currentRow}`).value = `${((companyTrips.length / totalTrips) * 100).toFixed(1)}%`;
      
      summarySheet.getCell(`A${currentRow}`).font = { name: 'Arial', size: 10 };
      summarySheet.getCell(`B${currentRow}`).font = { name: 'Arial', size: 10 };
      summarySheet.getCell(`C${currentRow}`).font = { 
        name: 'Arial', 
        size: 10,
        italic: true,
        color: { argb: '6B7280' }
      };
      
      currentRow++;
    });

    // Set column widths
    summarySheet.getColumn('A').width = 30;
    summarySheet.getColumn('B').width = 20;
    summarySheet.getColumn('C').width = 15;

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const fileName = `trip_export_${dateStr}_${timeStr}.xlsx`;
    
    saveAs(blob, fileName);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium text-gray-700">
          {isLoading ? (
            <span className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Loading trips...
            </span>
          ) : (
            <span>
              {tripsCount > 0 ? (
                <>
                  <span className="text-blue-600 font-bold">{tripsCount}</span> 
                  <span className="text-gray-500"> {tripsCount === 1 ? 'trip' : 'trips'} found</span>
                </>
              ) : (
                <span className="text-gray-400">No trips found</span>
              )}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={exportToExcel}
          disabled={isExporting || tripsCount === 0}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isExporting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </>
          )}
        </button>
        
        <Link
          to="/add-trip"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Trip
        </Link>
      </div>
    </div>
  );
};

export default ListActions;